import { expect } from 'chai'
import { ethers } from 'hardhat'
import { SignerWithAddress } from '@nomicfoundation/hardhat-ethers/signers'
import {
  IdentityRegistry,
  ReputationToken,
  EscrowFactory,
  Escrow,
} from '../typechain-types'

// ─── Fixtures ────────────────────────────────────────────────────────────────

async function deployContracts() {
  const [owner, alice, bob, carol, mediator, feeWallet] =
    await ethers.getSigners()

  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry')
  const registry = (await IdentityRegistry.deploy()) as unknown as IdentityRegistry

  const ReputationToken = await ethers.getContractFactory('ReputationToken')
  const repToken = (await ReputationToken.deploy()) as unknown as ReputationToken

  const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
  const factory = (await EscrowFactory.deploy(
    await registry.getAddress(),
    await repToken.getAddress(),
    feeWallet.address,
    mediator.address,
  )) as unknown as EscrowFactory

  // Authorize the factory as a minter on ReputationToken
  await repToken.setMinter(await factory.getAddress(), true)
  // Authorize the factory on IdentityRegistry
  await registry.setAuthorizedUpdater(await factory.getAddress(), true)

  return { owner, alice, bob, carol, mediator, feeWallet, registry, repToken, factory }
}

// ─── IdentityRegistry Tests ──────────────────────────────────────────────────

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
})

// ─── ReputationToken Tests ────────────────────────────────────────────────────

describe('ReputationToken', () => {
  it('owner can mint to a user', async () => {
    const { alice, repToken } = await deployContracts()
    await repToken.mintAchievement(alice.address, 'ipfs://achievement-1')
    expect(await repToken.balanceOf(alice.address)).to.equal(1)
  })

  it('tokens are soulbound — transfers revert', async () => {
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

// ─── Escrow via EscrowFactory Tests ──────────────────────────────────────────

describe('EscrowFactory → Escrow', () => {
  async function setupWithProfiles() {
    const ctx = await deployContracts()
    const { alice, bob, registry } = ctx
    await registry.connect(alice).register('Alice', 'ipfs://pfp', 'ipfs://alice')
    await registry.connect(bob).register('Bob', 'ipfs://pfp', 'ipfs://bob')
    return ctx
  }

  it('creates a job escrow and tracks it', async () => {
    const { alice, bob, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const tx = await factory
      .connect(alice)
      .createJob(bob.address, 'Build smart contracts', { value: budget })

    const receipt = await tx.wait()
    const event = receipt?.logs.find(
      (l) => factory.interface.parseLog(l as any)?.name === 'JobCreated',
    )
    expect(event).to.not.be.undefined
    expect(await factory.totalJobs()).to.equal(1)
  })

  it('full happy path: fund → submit → approve → release', async () => {
    const { alice, bob, factory, feeWallet } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const tx = await factory
      .connect(alice)
      .createJob(bob.address, 'Full flow job', { value: budget })

    const receipt = await tx.wait()
    const jobCreatedLog = receipt!.logs
      .map((l) => {
        try { return factory.interface.parseLog(l as any) } catch { return null }
      })
      .find((e) => e?.name === 'JobCreated')!

    const escrowAddr = jobCreatedLog.args.escrow as string
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    // Freelancer submits work
    await escrow.connect(bob).submitWork('ipfs://deliverable')
    expect(await escrow.getState()).to.equal(1) // SUBMITTED

    // Client approves
    const bobBefore = await ethers.provider.getBalance(bob.address)
    await escrow.connect(alice).approveWork()

    expect(await escrow.getState()).to.equal(4) // RELEASED
    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })

  it('dispute flow: mediator can resolve to freelancer', async () => {
    const { alice, bob, mediator, factory } = await setupWithProfiles()
    const budget = ethers.parseEther('1')

    const tx = await factory
      .connect(alice)
      .createJob(bob.address, 'Disputed job', { value: budget })

    const receipt = await tx.wait()
    const jobCreatedLog = receipt!.logs
      .map((l) => {
        try { return factory.interface.parseLog(l as any) } catch { return null }
      })
      .find((e) => e?.name === 'JobCreated')!

    const escrowAddr = jobCreatedLog.args.escrow as string
    const escrow = (await ethers.getContractAt('Escrow', escrowAddr)) as unknown as Escrow

    await escrow.connect(bob).submitWork('ipfs://deliverable')
    await escrow.connect(alice).raiseDispute()
    expect(await escrow.getState()).to.equal(3) // DISPUTED

    const bobBefore = await ethers.provider.getBalance(bob.address)
    await escrow.connect(mediator).resolveDispute(bob.address)
    expect(await escrow.getState()).to.equal(4) // RELEASED

    const bobAfter = await ethers.provider.getBalance(bob.address)
    expect(bobAfter).to.be.gt(bobBefore)
  })
})
