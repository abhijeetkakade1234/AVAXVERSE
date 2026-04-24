import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
  IdentityRegistry,
  ReputationToken,
  EscrowFactory,
  Escrow,
  Rejector,
} from '../typechain-types'

async function deployContracts() {
  const [owner, alice, bob, carol, mediator, feeWallet] = await ethers.getSigners()

  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry')
  const registry = (await upgrades.deployProxy(IdentityRegistry, [], { kind: 'uups' })) as unknown as IdentityRegistry

  const ReputationToken = await ethers.getContractFactory('ReputationToken')
  const repToken = (await upgrades.deployProxy(ReputationToken, [], { kind: 'uups', unsafeAllow: ['constructor'] })) as unknown as ReputationToken

  const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
  const factory = (await upgrades.deployProxy(EscrowFactory, [
    await registry.getAddress(),
    await repToken.getAddress(),
    feeWallet.address,
    mediator.address,
    mediator.address,
  ], { kind: 'uups', unsafeAllow: ['constructor'] })) as unknown as EscrowFactory

  await repToken.setMinter(await factory.getAddress(), true)
  await registry.setAuthorizedUpdater(await factory.getAddress(), true)

  return { owner, alice, bob, carol, mediator, feeWallet, registry, repToken, factory }
}

describe('IdentityRegistry', () => {
  it('allows a user to register a profile', async () => {
    const { alice, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice-profile')

    const profile = await registry.getProfile(alice.address)
    expect(profile.name).to.equal('Alice')
    expect(profile.did).to.include('did:avax:')
    expect(profile.exists).to.be.true
  })

  it('prevents double registration', async () => {
    const { alice, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice-profile')
    await expect(
      registry.connect(alice).register('Alice2', 'ipfs://pfp', 'ipfs://alice-profile-2'),
    ).to.be.revertedWith('IdentityRegistry: already registered')
  })

  it('allows updating metadata URI', async () => {
    const { alice, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://old')
    await registry.connect(alice).updateMetadata('ipfs://new')

    const profile = await registry.getProfile(alice.address)
    expect(profile.metadataURI).to.equal('ipfs://new')
  })

  it('only authorized updaters can increment reputation', async () => {
    const { alice, bob, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')

    await expect(
      registry.connect(bob).incrementReputation(alice.address, 10),
    ).to.be.revertedWith('IdentityRegistry: not authorized')
  })

  it('enforces unique usernames', async () => {
    const { alice, bob, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')
    
    // Existing name
    expect(await registry.isNameAvailable('Alice')).to.be.false
    
    // Bob tries to register Alice's name
    await expect(
      registry.connect(bob).register('Alice', 'ipfs://pfp-bob', 'ipfs://bob')
    ).to.be.revertedWithCustomError(registry, 'NameAlreadyTaken')
  })

  it('allows taking a released name after update', async () => {
    const { alice, bob, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')
    
    // Alice changes name to Alison
    await registry.connect(alice).updateProfile('Alison', 'ipfs://pfp', 'ipfs://alice')
    expect(await registry.isNameAvailable('Alice')).to.be.true
    
    // Bob can now take Alice's old name
    await registry.connect(bob).register('Alice', 'ipfs://pfp-bob', 'ipfs://bob')
    const bobProfile = await registry.getProfile(bob.address)
    expect(bobProfile.name).to.equal('Alice')
  })

  it('isNameAvailable returns false for empty string', async () => {
    const { registry } = await deployContracts()
    expect(await registry.isNameAvailable('')).to.be.false
  })

  it('registerWithRole registers profile and base role in one transaction', async () => {
    const { alice, registry } = await deployContracts()
    await registry.connect(alice).registerWithRole('Alice', 'ipfs://pfp', 'ipfs://alice', 1)

    const profile = await registry.getProfile(alice.address)
    expect(profile.exists).to.equal(true)
    expect(await registry.getBaseRole(alice.address)).to.equal(1)
  })

  it('enforces one-time base role assignment and admin dispute-handler control', async () => {
    const { owner, alice, registry } = await deployContracts()
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')
    await registry.connect(alice).setInitialBaseRole(1)
    expect(await registry.getBaseRole(alice.address)).to.equal(1)

    await expect(
      registry.connect(alice).setInitialBaseRole(2)
    ).to.be.revertedWith('IdentityRegistry: base role already set')

    await registry.connect(owner).setDisputeHandler(alice.address, true)
    expect(await registry.isDisputeHandler(alice.address)).to.equal(true)
  })
})

describe('ReputationToken', () => {
  it('owner can mint to a user', async () => {
    const { alice, repToken } = await deployContracts()
    await repToken.mintAchievement(alice.address, 'ipfs://achievement-1')
    expect(await repToken.balanceOf(alice.address)).to.equal(1)
  })

  it('tokens are soulbound - transfers revert', async () => {
    const { alice, bob, repToken } = await deployContracts()
    await repToken.mintAchievement(alice.address, 'ipfs://achievement-1')

    const tokenId = 0n
    await expect(
      repToken.connect(alice).transferFrom(alice.address, bob.address, tokenId),
    ).to.be.revertedWithCustomError(repToken, 'SoulboundTransferForbidden')
  })

  it('locked() always returns true', async () => {
    const { repToken } = await deployContracts()
    expect(await repToken.locked(0n)).to.be.true
  })
})

describe('EscrowFactory -> Escrow', () => {
  async function setupWithProfiles() {
    const ctx = await deployContracts()
    const { alice, bob, carol, registry } = ctx
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')
    await registry.connect(bob).register('Bob', 'ipfs://pfp', 'ipfs://bob')
    await registry.connect(carol).register('Carol', 'ipfs://pfp', 'ipfs://carol')
    await registry.connect(alice).setInitialBaseRole(1) // CLIENT
    await registry.connect(bob).setInitialBaseRole(2) // OPERATOR
    await registry.connect(carol).setInitialBaseRole(2) // OPERATOR
    await ethers.provider.send('evm_increaseTime', [8 * 24 * 60 * 60])
    await ethers.provider.send('evm_mine', [])
    return ctx
  }

  async function createSelectAndFund(factory: EscrowFactory, aliceAddr: string, bobAddr: string, budget: bigint) {
    const commitment = await factory.clientCommitmentWei()
    const stake = await factory.applicationStakeWei()
    await factory.connect(await ethers.getSigner(aliceAddr)).createJob('Build smart contracts', budget, 'ipfs://job-meta', { value: commitment })
    const jobId = 0n

    const requiredStake = await factory.requiredStakeFor(bobAddr)
    await factory.connect(await ethers.getSigner(bobAddr)).applyToJob(jobId, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(await ethers.getSigner(aliceAddr)).selectOperator(jobId, bobAddr)
    await factory.connect(await ethers.getSigner(bobAddr)).acceptAssignment(jobId)
    await factory.connect(await ethers.getSigner(aliceAddr)).fundEscrow(jobId, { value: budget })

    const job = await factory.getJob(jobId)
    return { jobId, escrowAddr: job.escrow }
  }

  it('creates open job, accepts applications, and tracks selection', async () => {
    const { alice, bob, carol, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Build smart contracts', budget, 'ipfs://job-meta', { value: commitment })
    const stakeBob = await factory.requiredStakeFor(bob.address)
    const stakeCarol = await factory.requiredStakeFor(carol.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: stakeBob })
    await factory.connect(carol).applyToJob(0n, 'ipfs://proposal-carol', { value: stakeCarol })

    const applicants = await factory.getApplicants(0n)
    expect(applicants.length).to.equal(2)

    await factory.connect(alice).selectOperator(0n, bob.address)
    const job = await factory.getJob(0n)
    expect(job.freelancer).to.equal(bob.address)
    expect(job.status).to.equal(1) // SELECTED
  })

  it('fails to fund before operator accepts', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Fail fund job', budget, 'ipfs://meta', { value: commitment })
    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(alice).selectOperator(0n, bob.address)
    
    // Status is SELECTED (1), but fundEscrow requires ACCEPTED (2)
    await expect(
        factory.connect(alice).fundEscrow(0n, { value: budget })
    ).to.be.revertedWithCustomError(factory, 'StateMismatch')
  })

  it('full happy path: create -> apply -> select -> accept -> fund -> submit -> approve', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    const jobStatus = (await factory.getJob(0n)).status
    expect(jobStatus).to.equal(3) // FUNDED (was 2)

    await escrow.connect(bob).submitWork('ipfs://deliverable')
    expect(await escrow.getState()).to.equal(1) // SUBMITTED

    const bobBefore = await ethers.provider.getBalance(bob.address)
    await escrow.connect(alice).approveWork()

    expect(await escrow.getState()).to.equal(4) // RELEASED
    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })

  it('auto-approve work after review timeout', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable')
    
    const reviewTimeout = await escrow.reviewTimeoutSec()
    // Fast forward review timeout + 1 second
    await ethers.provider.send('evm_increaseTime', [Number(reviewTimeout) + 1])
    await ethers.provider.send('evm_mine', [])

    const bobBefore = await ethers.provider.getBalance(bob.address)
    // Anyone can call autoApprove
    await escrow.autoApprove()
    
    expect(await escrow.getState()).to.equal(4) // RELEASED
    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })

  it('dispute flow: mediator can resolve to freelancer', async () => {
    const { alice, bob, mediator, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable')
    await escrow.connect(alice).raiseDispute('Work quality does not match scope', 'ipfs://client-evidence', { value: ethers.parseEther('0.005') })
    expect(await escrow.getState()).to.equal(3) // DISPUTED

    // Verify evidence is stored
    expect(await escrow.disputeEvidenceURI()).to.equal('ipfs://client-evidence')

    // Mediator tries to resolve immediately -> should fail
    await expect(
        escrow.connect(mediator).resolveDispute(bob.address, 'ipfs://resolution-reason')
    ).to.be.revertedWith('Escrow: response window active')

    // Other party submits counter evidence
    await escrow.connect(bob).submitCounterEvidence('ipfs://freelancer-evidence')
    expect(await escrow.counterEvidenceURI()).to.equal('ipfs://freelancer-evidence')

    const responseWindow = await escrow.disputeResponseWindowSec()
    // Fast forward response window + 1 second
    await ethers.provider.send('evm_increaseTime', [Number(responseWindow) + 1])
    await ethers.provider.send('evm_mine', [])

    const bobBefore = await ethers.provider.getBalance(bob.address)
    await escrow.connect(mediator).resolveDispute(bob.address, 'ipfs://resolution-reason')
    expect(await escrow.getState()).to.equal(4) // RELEASED
    expect(await escrow.resolutionReasonHash()).to.equal('ipfs://resolution-reason')

    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })

  it('refunds dispute fee overpayment back to the raiser', async () => {
    const { owner, alice, bob, factory, feeWallet } = await setupWithProfiles()
    await factory.connect(owner).setDisputeFeeConfig(ethers.parseEther('0.005'))
    const budget = ethers.parseEther('1')
    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable-overpay')
    const feeBefore = await ethers.provider.getBalance(feeWallet.address)
    const overpay = ethers.parseEther('0.01')
    await escrow.connect(alice).raiseDispute('overpay test', 'ipfs://evidence-overpay', { value: overpay })

    expect(await escrow.pendingWithdrawals(alice.address)).to.equal(0)
    const feeAfter = await ethers.provider.getBalance(feeWallet.address)
    expect(feeAfter - feeBefore).to.equal(ethers.parseEther('0.005'))
  })

  it('allows only one counter-evidence submission', async () => {
    const { alice, bob, mediator, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable-once')
    await escrow.connect(alice).raiseDispute('counter evidence lock', 'ipfs://evidence-lock', { value: ethers.parseEther('0.005') })
    await escrow.connect(bob).submitCounterEvidence('ipfs://counter-once')

    await expect(
      escrow.connect(bob).submitCounterEvidence('ipfs://counter-twice')
    ).to.be.revertedWith('Escrow: counter evidence already submitted')

    const responseWindow = await escrow.disputeResponseWindowSec()
    await ethers.provider.send('evm_increaseTime', [Number(responseWindow) + 1])
    await ethers.provider.send('evm_mine', [])
    await escrow.connect(mediator).resolveDispute(bob.address, 'ipfs://resolution-lock')
    expect(await escrow.getState()).to.equal(4)
  })

  it('timeout slash selected operator if they never accept', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Timeout job', budget, 'ipfs://meta', { value: commitment })
    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(alice).selectOperator(0n, bob.address)

    const selectionTimeout = await factory.selectionTimeoutSec()
    await ethers.provider.send('evm_increaseTime', [Number(selectionTimeout) + 5])
    await ethers.provider.send('evm_mine', [])

    await factory.connect(alice).timeoutReopenAndSlashSelected(0n)
    const job = await factory.getJob(0n)
    expect(job.status).to.equal(0) // OPEN
    expect(job.freelancer).to.equal('0x0000000000000000000000000000000000000000')
  })

  it('timeout cancel by operator if client never funds after acceptance', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Funding timeout job', budget, 'ipfs://meta', { value: commitment })
    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(alice).selectOperator(0n, bob.address)
    await factory.connect(bob).acceptAssignment(0n)

    const fundingTimeout = await factory.fundingTimeoutSec()
    await ethers.provider.send('evm_increaseTime', [Number(fundingTimeout) + 5])
    await ethers.provider.send('evm_mine', [])

    await factory.connect(bob).timeoutCancelByOperator(0n)
    const job = await factory.getJob(0n)
    console.log("Job status after operator cancel:", job.status.toString());
    expect(job.status).to.equal(5) // CANCELLED (was 4)
  })

  it('verifies selected operator stake is locked during ACCEPTED phase', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Stake lock job', budget, 'ipfs://meta', { value: commitment })
    const jobId = 0n
    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(jobId, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(alice).selectOperator(jobId, bob.address)
    await factory.connect(bob).acceptAssignment(jobId)

    const job = await factory.getJob(jobId)
    expect(job.status).to.equal(2) // ACCEPTED

    await expect(
      factory.connect(bob).withdrawApplicationStake(jobId),
    ).to.be.revertedWithCustomError(factory, 'StakeLocked')
  })

  it('blocks re-apply to same mission after stake withdrawal', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()
    await factory.connect(alice).createJob('One apply only mission', budget, 'ipfs://meta', { value: commitment })

    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-v1', { value: requiredStake })
    await factory.connect(bob).withdrawApplicationStake(0n)

    await expect(
      factory.connect(bob).applyToJob(0n, 'ipfs://proposal-v2', { value: requiredStake })
    ).to.be.revertedWithCustomError(factory, 'AlreadyApplied')
  })

  it('prevents client from selecting an operator who withdrew application stake', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()
    await factory.connect(alice).createJob('Withdrawn operator should not be selectable', budget, 'ipfs://meta', { value: commitment })

    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-v1', { value: requiredStake })
    await factory.connect(bob).withdrawApplicationStake(0n)

    await expect(
      factory.connect(alice).selectOperator(0n, bob.address)
    ).to.be.revertedWithCustomError(factory, 'NoStake')
  })

  it('enforces global apply cooldown across different missions', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()
    await factory.connect(alice).createJob('Mission A', budget, 'ipfs://meta-a', { value: commitment })
    await factory.connect(alice).createJob('Mission B', budget, 'ipfs://meta-b', { value: commitment })

    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-a', { value: requiredStake })
    await expect(
      factory.connect(bob).applyToJob(1n, 'ipfs://proposal-b', { value: requiredStake })
    ).to.be.revertedWithCustomError(factory, 'CooldownActive')
  })

  it('allows newly registered profiles to create mission in fast mode', async () => {
    const { alice, factory, registry } = await deployContracts()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice-profile')
    await registry.connect(alice).setInitialBaseRole(1)
    await expect(
      factory.connect(alice).createJob('Immediate create account', budget, 'ipfs://meta', { value: commitment })
    ).to.not.be.reverted
  })

  it('enforces mission role gating for create/apply actions', async () => {
    const { alice, bob, factory, registry } = await deployContracts()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice-profile')
    await registry.connect(bob).register('Bob', 'ipfs://pfp', 'ipfs://bob-profile')
    await registry.connect(alice).setInitialBaseRole(2) // OPERATOR
    await registry.connect(bob).setInitialBaseRole(1) // CLIENT

    await expect(
      factory.connect(alice).createJob('Wrong role create', budget, 'ipfs://meta', { value: commitment })
    ).to.be.revertedWithCustomError(factory, 'Unauthorized')

    await factory.connect(bob).createJob('Valid client create', budget, 'ipfs://meta', { value: commitment })
    const stake = await factory.requiredStakeFor(alice.address)
    await factory.connect(alice).applyToJob(0n, 'ipfs://proposal', { value: stake })
  })

  it('requires dispute fee and allows backup mediator resolution', async () => {
    const { owner, alice, bob, carol, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    await factory.connect(owner).setMediatorBackup(carol.address)

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow
    await escrow.connect(bob).submitWork('ipfs://deliverable-v1')

    await expect(
      escrow.connect(alice).raiseDispute('missing fee', 'ipfs://proof')
    ).to.be.revertedWith('Escrow: dispute fee too low')

    await escrow.connect(alice).raiseDispute('valid fee', 'ipfs://proof', { value: ethers.parseEther('0.005') })
    const responseWindow = await escrow.disputeResponseWindowSec()
    await ethers.provider.send('evm_increaseTime', [Number(responseWindow) + 1])
    await ethers.provider.send('evm_mine', [])
    await escrow.connect(carol).resolveDispute(bob.address, 'ipfs://backup-mediator-resolution')
    expect(await escrow.getState()).to.equal(4)
  })

  it('prevents immediate duplicate URI submission', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow
    await escrow.connect(bob).submitWork('ipfs://deliverable-a')
    await expect(
      escrow.connect(bob).submitWork('ipfs://deliverable-a')
    ).to.be.reverted
  })

  it('enforces timelock delay for owner config changes', async () => {
    const { owner, factory, feeWallet, mediator } = await setupWithProfiles()
    const TimelockController = await ethers.getContractFactory('AVAXTimelock')
    const delay = 2 * 24 * 60 * 60
    const timelock = await TimelockController.deploy(delay, [owner.address], [owner.address], owner.address)
    await timelock.waitForDeployment()
    await factory.connect(owner).transferOwnership(await timelock.getAddress())

    const payload = factory.interface.encodeFunctionData('setConfig', [300, feeWallet.address, mediator.address])
    const target = await factory.getAddress()
    const predecessor = ethers.ZeroHash
    const salt = ethers.keccak256(ethers.toUtf8Bytes('set-config-delay'))

    await timelock.schedule(target, 0, payload, predecessor, salt, delay)
    await expect(
      timelock.execute(target, 0, payload, predecessor, salt)
    ).to.be.reverted

    await ethers.provider.send('evm_increaseTime', [delay + 1])
    await ethers.provider.send('evm_mine', [])
    await timelock.execute(target, 0, payload, predecessor, salt)
    expect(await factory.platformFeeBps()).to.equal(300)
  })

  it('does not brick timeout slash flow when client cannot receive AVAX', async () => {
    const { bob, owner, factory, registry } = await setupWithProfiles()
    const RejectorFactory = await ethers.getContractFactory('Rejector')
    const badClient = (await RejectorFactory.deploy()) as unknown as Rejector
    await badClient.waitForDeployment()
    const badClientAddr = await badClient.getAddress()

    await badClient.connect(owner).execute(
      await registry.getAddress(),
      registry.interface.encodeFunctionData('register', ['BadClient', 'ipfs://pfp', 'ipfs://meta'])
    )
    await badClient.connect(owner).execute(
      await registry.getAddress(),
      registry.interface.encodeFunctionData('setInitialBaseRole', [1])
    )
    await ethers.provider.send('evm_increaseTime', [8 * 24 * 60 * 60])
    await ethers.provider.send('evm_mine', [])

    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()
    await badClient.connect(owner).execute(
      await factory.getAddress(),
      factory.interface.encodeFunctionData('createJob', ['Rejector Job', budget, 'ipfs://job']),
      { value: commitment }
    )

    const stake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: stake })
    await badClient.connect(owner).execute(
      await factory.getAddress(),
      factory.interface.encodeFunctionData('selectOperator', [0n, bob.address])
    )

    await ethers.provider.send('evm_increaseTime', [24 * 60 * 60 + 5])
    await ethers.provider.send('evm_mine', [])

    await badClient.connect(owner).execute(
      await factory.getAddress(),
      factory.interface.encodeFunctionData('timeoutReopenAndSlashSelected', [0n])
    )
    expect(await factory.pendingWithdrawals(badClientAddr)).to.equal(stake)
  })

  it('does not brick operator stake withdrawal when operator cannot receive AVAX', async () => {
    const { alice, owner, factory, registry } = await setupWithProfiles()
    const RejectorFactory = await ethers.getContractFactory('Rejector')
    const badOperator = (await RejectorFactory.deploy()) as unknown as Rejector
    await badOperator.waitForDeployment()
    const badOperatorAddr = await badOperator.getAddress()

    await badOperator.connect(owner).execute(
      await registry.getAddress(),
      registry.interface.encodeFunctionData('register', ['BadOp', 'ipfs://pfp', 'ipfs://meta'])
    )
    await badOperator.connect(owner).execute(
      await registry.getAddress(),
      registry.interface.encodeFunctionData('setInitialBaseRole', [2])
    )

    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()
    await factory.connect(alice).createJob('Stake Refund Job', budget, 'ipfs://job', { value: commitment })

    const badStake = await factory.requiredStakeFor(badOperatorAddr)
    await badOperator.connect(owner).execute(
      await factory.getAddress(),
      factory.interface.encodeFunctionData('applyToJob', [0n, 'ipfs://proposal-bad']),
      { value: badStake }
    )

    await badOperator.connect(owner).execute(
      await factory.getAddress(),
      factory.interface.encodeFunctionData('withdrawApplicationStake', [0n])
    )
    expect(await factory.pendingWithdrawals(badOperatorAddr)).to.equal(badStake)
  })

  it('allows manual unblock through owner path', async () => {
    const { owner, alice, factory } = await setupWithProfiles()
    await factory.connect(owner).setBlocked(alice.address, true)
    expect(await factory.blocked(alice.address)).to.equal(true)
    await factory.connect(owner).setBlocked(alice.address, false)
    expect(await factory.blocked(alice.address)).to.equal(false)
  })

  it('rejects zero-address mediator and fee configuration', async () => {
    const { owner, factory } = await setupWithProfiles()
    const currentFeeRecipient = await factory.feeRecipient()
    const currentMediator = await factory.mediator()

    await expect(
      factory.connect(owner).setConfig(250, ethers.ZeroAddress, currentMediator)
    ).to.be.revertedWithCustomError(factory, 'AddressMismatch')

    await expect(
      factory.connect(owner).setConfig(250, currentFeeRecipient, ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(factory, 'AddressMismatch')

    await expect(
      factory.connect(owner).setMediatorBackup(ethers.ZeroAddress)
    ).to.be.revertedWithCustomError(factory, 'AddressMismatch')
  })

  it('records dispute fee config changes and preserves dispute flow when feeRecipient rejects', async () => {
    const { owner, alice, bob, factory } = await setupWithProfiles()
    const RejectorFactory = await ethers.getContractFactory('Rejector')
    const rejectFeeRecipient = (await RejectorFactory.deploy()) as unknown as Rejector
    await rejectFeeRecipient.waitForDeployment()
    const rejectFeeRecipientAddr = await rejectFeeRecipient.getAddress()

    const oldDisputeFee = await factory.minDisputeFee()
    await expect(factory.connect(owner).setDisputeFeeConfig(ethers.parseEther('0.01')))
      .to.emit(factory, 'DisputeFeeConfigUpdated')
      .withArgs(oldDisputeFee, ethers.parseEther('0.01'))

    const currentMediator = await factory.mediator()
    await factory.connect(owner).setConfig(250, rejectFeeRecipientAddr, currentMediator)

    const budget = ethers.parseEther('1')
    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow
    await escrow.connect(bob).submitWork('ipfs://deliverable')
    await escrow.connect(alice).raiseDispute('fee-recipient-reject-test', 'ipfs://evidence', { value: ethers.parseEther('0.01') })

    expect(await escrow.getState()).to.equal(3) // DISPUTED
    expect(await escrow.pendingWithdrawals(rejectFeeRecipientAddr)).to.equal(ethers.parseEther('0.01'))
  })

  it('owner can update timing config and non-owner cannot', async () => {
    const { owner, alice, factory } = await setupWithProfiles()
    await expect(
      factory.connect(alice).setTimingConfig(30, 600, 600, 1800, 1800, 14 * 24 * 60 * 60)
    ).to.be.reverted

    await factory.connect(owner).setTimingConfig(30, 600, 600, 1800, 1800, 14 * 24 * 60 * 60)
    expect(await factory.applicationCooldownSec()).to.equal(30)
    expect(await factory.selectionTimeoutSec()).to.equal(600)
    expect(await factory.fundingTimeoutSec()).to.equal(600)
    expect(await factory.escrowReviewTimeoutSec()).to.equal(1800)
    expect(await factory.escrowDisputeResponseWindowSec()).to.equal(1800)
    expect(await factory.escrowDisputeRecoveryTimeoutSec()).to.equal(14 * 24 * 60 * 60)
  })

  it('passes updated escrow timing config into newly funded escrows', async () => {
    const { owner, alice, bob, factory } = await setupWithProfiles()
    await factory.connect(owner).setTimingConfig(30, 600, 600, 1800, 1800, 14 * 24 * 60 * 60)
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow
    expect(await escrow.reviewTimeoutSec()).to.equal(1800)
    expect(await escrow.disputeResponseWindowSec()).to.equal(1800)
    expect(await escrow.disputeRecoveryTimeoutSec()).to.equal(14 * 24 * 60 * 60)
  })
})

