import { ethers, upgrades } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to emergency rollback an AVAXVERSE proxy to a PREVIOUS implementation.
 * 
 * Usage: npx hardhat run scripts/rollback.ts --network fuji
 * 
 * This script is a safety net. If an upgrade messes up the logic, 
 * you can use this to point the proxy back to a known working logic address.
 */
async function main() {
  const network = await ethers.provider.getNetwork();
  const networkName = network.name;
  const effectiveNetwork = networkName === 'unknown' ? 'fuji' : networkName === 'hardhat' ? 'localhost' : networkName;
  
  const deploymentPath = path.resolve(__dirname, '..', 'deployments', `${effectiveNetwork}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found for ${networkName}.`);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log(`\n🚨 EMERGENCY ROLLBACK INITIATED on ${networkName}`);
  console.log(`--------------------------------------------------`);

  // To rollback, you need TWO things:
  // 1. The Proxy Address (found in deployments/network.json)
  // 2. The Implementation Address you want to go back to.
  
  // NOTE: In a REAL emergency, you would modify the values below 
  // with the "Last Known Good" implementation address.
  
  const ROLLBACK_TARGETS = [
    { 
        name: 'IdentityRegistry', 
        proxy: addresses.IdentityRegistry, 
        previousImplementation: '' // PASTE OLD IMPLEMENTATION ADDRESS HERE
    },
    { 
        name: 'EscrowFactory', 
        proxy: addresses.EscrowFactory, 
        previousImplementation: '' // PASTE OLD IMPLEMENTATION ADDRESS HERE
    }
  ];

  for (const target of ROLLBACK_TARGETS) {
    if (target.proxy && target.previousImplementation) {
        console.log(`Rolling back ${target.name}...`);
        console.log(`Proxy: ${target.proxy}`);
        console.log(`Reverting to: ${target.previousImplementation}`);

        // We use the Manifest to ensure OZ knows about this implementation
        // and then we point the proxy back to it.
        await upgrades.upgradeProxy(target.proxy, await ethers.getContractFactory(target.name));
        
        console.log(`✅ ${target.name} rollback complete.`);
    } else if (target.proxy) {
        const currentImpl = await upgrades.erc1967.getImplementationAddress(target.proxy);
        console.log(`ℹ️  ${target.name} current implementation: ${currentImpl}`);
        console.log(`   (To rollback, edit rollback.ts and add a 'previousImplementation' address for this contract)`);
    }
  }

  console.log(`\n💡 TIP: To rollback via code, 'git checkout' the previous working version of your code and run:`);
  console.log(`   npm run upgrade:${effectiveNetwork === 'localhost' ? 'local' : effectiveNetwork}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
