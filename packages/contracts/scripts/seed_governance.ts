import { ethers, network } from 'hardhat'
import * as fs from 'fs'
import * as path from 'path'

async function main() {
  const [deployer] = await ethers.getSigners()

  const govAddrsPath = path.resolve(__dirname, '..', 'deployments', 'localhost_governance.json')
  if (!fs.existsSync(govAddrsPath)) {
    throw new Error('Governance addresses not found. Run deploy_governance.ts first.')
  }
  const govAddrs = JSON.parse(fs.readFileSync(govAddrsPath, 'utf8'))

  const AVAXToken = await ethers.getContractAt('AVAXToken', govAddrs.AVAXToken)
  const AVAXGovernor = await ethers.getContractAt('AVAXGovernor', govAddrs.AVAXGovernor)

  console.log('\n🌱 Seeding Governance data...')

  // 1. Check if we have voting power
  const votes = await AVAXToken.getVotes(deployer.address)
  console.log(`  Deployer Voting Power: ${ethers.formatUnits(votes, 18)}`)

  if (votes === 0n) {
    console.log('  Minting tokens and delegating...')
    const mintTx = await AVAXToken.mint(deployer.address, ethers.parseUnits('10000', 18))
    await mintTx.wait()
    const delegateTx = await AVAXToken.delegate(deployer.address)
    await delegateTx.wait()
    console.log('  Tokens minted and delegated.')
  }

  // 2. Create a proposal
  console.log('  Creating proposal...')
  const targets = [govAddrs.AVAXToken]
  const values = [0]
  const calldatas = [AVAXToken.interface.encodeFunctionData('mint', [deployer.address, ethers.parseUnits('1000', 18)])]
  const description = 'AVGP-1: Initial Governance Incentive. This proposal mints 1,000 extra tokens to the treasury/deployer for initial bootstrap.'

  const proposeTx = await AVAXGovernor.propose(targets, values, calldatas, description)
  const receipt = await proposeTx.wait()

  // Find ProposalCreated event
  const event = receipt?.logs.find((log: any) => {
    try {
      const parsed = AVAXGovernor.interface.parseLog(log)
      return parsed?.name === 'ProposalCreated'
    } catch {
      return false
    }
  })

  if (!event) {
    console.log('❌ ProposalCreated event not found.')
    return
  }

  const parsedEvent = AVAXGovernor.interface.parseLog(event as any)
  const proposalId = parsedEvent?.args[0]
  console.log(`✅ Proposal created! ID: ${proposalId}`)

  // 3. Move forward in time to start voting
  console.log('  Advancing blocks to start voting...')
  const delay = await AVAXGovernor.votingDelay()
  for (let i = 0; i <= Number(delay); i++) {
    await network.provider.send('evm_mine')
  }

  // 4. Cast votes
  console.log('  Casting "For" vote...')
  const voteTx = await AVAXGovernor.castVote(proposalId, 1) // 1 = For
  await voteTx.wait()
  console.log('✅ Vote cast.')

  console.log('\n✨ Governance seeded successfully!')
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
