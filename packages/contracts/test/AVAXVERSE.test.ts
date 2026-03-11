import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import {
  IdentityRegistry,
  ReputationToken,
  EscrowFactory,
  Escrow,
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

  it('auto-approve work after 7-day timeout', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const { escrowAddr } = await createSelectAndFund(factory, alice.address, bob.address, budget)
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable')
    
    // Fast forward 7 days + 1 second
    await ethers.provider.send('evm_increaseTime', [7 * 24 * 60 * 60 + 1])
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
    await escrow.connect(alice).raiseDispute('Work quality does not match scope', 'ipfs://client-evidence')
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

    // Fast forward 3 days + 1 second
    await ethers.provider.send('evm_increaseTime', [3 * 24 * 60 * 60 + 1])
    await ethers.provider.send('evm_mine', [])

    const bobBefore = await ethers.provider.getBalance(bob.address)
    await escrow.connect(mediator).resolveDispute(bob.address, 'ipfs://resolution-reason')
    expect(await escrow.getState()).to.equal(4) // RELEASED
    expect(await escrow.resolutionReasonHash()).to.equal('ipfs://resolution-reason')

    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })

  it('timeout slash selected operator if they never accept', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')
    const commitment = await factory.clientCommitmentWei()

    await factory.connect(alice).createJob('Timeout job', budget, 'ipfs://meta', { value: commitment })
    const requiredStake = await factory.requiredStakeFor(bob.address)
    await factory.connect(bob).applyToJob(0n, 'ipfs://proposal-bob', { value: requiredStake })
    await factory.connect(alice).selectOperator(0n, bob.address)

    await ethers.provider.send('evm_increaseTime', [24 * 60 * 60 + 5])
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

    await ethers.provider.send('evm_increaseTime', [24 * 60 * 60 + 5])
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
})
