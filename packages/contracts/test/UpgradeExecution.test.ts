import { expect } from 'chai'
import { ethers, upgrades } from 'hardhat'
import { IdentityRegistry } from '../typechain-types'

describe('Upgradeability', () => {
  it('should upgrade IdentityRegistry and preserve state', async () => {
    // Deploy V1
    const RegistryV1 = await ethers.getContractFactory('IdentityRegistry')
    const instance = (await upgrades.deployProxy(RegistryV1, [], { kind: 'uups' })) as unknown as IdentityRegistry
    await instance.waitForDeployment()
    
    // Interact with V1 (Modify State)
    const [owner, user] = await ethers.getSigners()
    await instance.connect(owner).setAuthorizedUpdater(owner.address, true)
    await instance.connect(user).register('Alice', 'ipfs://pfp', 'ipfs://meta')
    
    let profile = await instance.getProfile(user.address)
    expect(profile.name).to.equal('Alice')

    // Deploy V2 (Upgrading the existing proxy with the SAME implementation just to prove retention)
    const RegistryV2 = await ethers.getContractFactory('IdentityRegistry')
    const upgraded = (await upgrades.upgradeProxy(await instance.getAddress(), RegistryV2)) as unknown as IdentityRegistry
    await upgraded.waitForDeployment()

    // Verify V2 retained V1 State
    profile = await upgraded.getProfile(user.address)
    expect(profile.name).to.equal('Alice')
  })
})
