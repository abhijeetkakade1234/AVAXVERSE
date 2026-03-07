import { ethers, network } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

/**
 * Deployment script for AVAXVERSE Governance contracts.
 * Run with: hardhat run scripts/deploy_governance.ts --network fuji
 */
async function main() {
  const [deployer] = await ethers.getSigners()

  console.log('\n🏛️ Deploying AVAXVERSE Governance contracts...')
  console.log(`  Network  : ${network.name}`)
  console.log(`  Deployer : ${deployer.address}\n`)

  // 1. Deploy AVAXToken (the governance token)
  const AVAXToken = await ethers.getContractFactory('AVAXToken')
  const token = await AVAXToken.deploy(deployer.address)
  await token.waitForDeployment()
  const tokenAddr = await token.getAddress()
  console.log(`✅ AVAXToken    deployed: ${tokenAddr}`)

  // 2. Deploy AVAXGovernor (the governance engine)
  const AVAXGovernor = await ethers.getContractFactory('AVAXGovernor')
  const governor = await AVAXGovernor.deploy(tokenAddr)
  await governor.waitForDeployment()
  const governorAddr = await governor.getAddress()
  console.log(`✅ AVAXGovernor deployed: ${governorAddr}`)

  // 3. Delegation (Crucial: Proposer must delegate to themselves to have voting power)
  console.log('\n🔗 Self-delegating voting power for deployer...')
  const delegateTx = await token.delegate(deployer.address)
  await delegateTx.wait()
  console.log('✅ Voting power delegated.')

  // 4. Save deployed addresses
  const outputDir = path.resolve(__dirname, '..', 'deployments')
  if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true })

  const outputPath = path.join(outputDir, `${network.name}_governance.json`)
  const addresses = {
    network: network.name,
    AVAXToken: tokenAddr,
    AVAXGovernor: governorAddr,
  }

  fs.writeFileSync(outputPath, JSON.stringify(addresses, null, 2))
  console.log(`\n📄 Governance addresses saved to: deployments/${network.name}_governance.json`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
