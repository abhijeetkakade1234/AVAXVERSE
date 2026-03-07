import { ethers, network, upgrades } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Deployment script for AVAXVERSE contracts using Upgradeable Proxies.
 * Run with: hardhat run scripts/deploy.ts --network fuji
 *           hardhat run scripts/deploy.ts --network localhost
 */
async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('\n🚀 Deploying AVAXVERSE Super App contracts with Proxies...')
  console.log(`  Network  : ${network.name}`)
  console.log(`  Deployer : ${deployer.address}`)
  console.log(`  Balance  : ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} AVAX\n`)

  // 1. IdentityRegistry
  const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry')
  const registry = await upgrades.deployProxy(IdentityRegistry, [], { kind: 'uups' })
  await registry.waitForDeployment()
  console.log(`✅ IdentityRegistry Proxy deployed: ${await registry.getAddress()}`)

  // 2. ReputationToken (Soulbound NFT)
  const ReputationToken = await ethers.getContractFactory('ReputationToken')
  const repToken = await upgrades.deployProxy(ReputationToken, [], { kind: 'uups', unsafeAllow: ['constructor'] })
  await repToken.waitForDeployment()
  console.log(`✅ ReputationToken    Proxy deployed: ${await repToken.getAddress()}`)

  // 3. AVAXToken (Soulbound Governance/Reputation Token)
  const AVAXToken = await ethers.getContractFactory('AVAXToken')
  const avaxToken = await upgrades.deployProxy(AVAXToken, [deployer.address], { kind: 'uups' })
  await avaxToken.waitForDeployment()
  console.log(`✅ AVAXToken          Proxy deployed: ${await avaxToken.getAddress()}`)

  // 4. AVAXGovernor
  // Keeping Governor as a standard contract for now as it's mostly logic-based 
  // and relies on AVAXToken for state.
  const AVAXGovernor = await ethers.getContractFactory('AVAXGovernor')
  const governor = await AVAXGovernor.deploy(await avaxToken.getAddress())
  await governor.waitForDeployment()
  console.log(`✅ AVAXGovernor       deployed: ${await governor.getAddress()}`)

  // 5. EscrowFactory
  const EscrowFactory = await ethers.getContractFactory('EscrowFactory')
  const factory = await upgrades.deployProxy(
    EscrowFactory,
    [
      await registry.getAddress(),
      await repToken.getAddress(),
      deployer.address, // feeRecipient
      await governor.getAddress() // mediator is now Governor
    ],
    { kind: 'uups', unsafeAllow: ['constructor'] }
  )
  await factory.waitForDeployment()
  console.log(`✅ EscrowFactory      Proxy deployed: ${await factory.getAddress()}`)

  // 6. Wire up permissions
  await repToken.setMinter(await factory.getAddress(), true)
  await registry.setAuthorizedUpdater(await factory.getAddress(), true)
  
  // Tie reputation points to voting power
  await registry.setAVAXToken(await avaxToken.getAddress())
  await avaxToken.transferOwnership(await registry.getAddress())
  console.log('\n🔗 Permissions set. EscrowFactory authorized on Registry & RepToken. Registry authorized to mint AVAXToken.')

  // 7. Save deployed addresses
  const addresses = {
    network: network.name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    IdentityRegistry: await registry.getAddress(),
    ReputationToken: await repToken.getAddress(),
    EscrowFactory: await factory.getAddress(),
    AVAXToken: await avaxToken.getAddress(),
    AVAXGovernor: await governor.getAddress(),
  }

  const outputDir = path.resolve(__dirname, '..', 'deployments')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `${network.name}.json`)
  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
  console.log(`\n📄 Addresses saved to: deployments/${network.name}.json`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
