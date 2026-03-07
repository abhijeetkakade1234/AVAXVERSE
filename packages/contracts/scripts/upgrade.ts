import { ethers, upgrades } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Script to upgrade existing AVAXVERSE proxies.
 * Use this instead of deploy.ts when you want to update code logic BUT KEEP DATA.
 * 
 * Usage: npx hardhat run scripts/upgrade.ts --network fuji
 */
async function main() {
  const networkName = 'localhost'; // Change as needed
  const deploymentPath = path.resolve(__dirname, '..', 'deployments', `${networkName}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found for ${networkName}. Have you deployed yet?`);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  console.log(`\n🚀 Upgrading contracts on ${networkName}...`);

  // --- Example: Upgrading IdentityRegistry ---
  if (addresses.IdentityRegistry) {
    console.log('Upgrading IdentityRegistry...');
    const IdentityRegistry = await ethers.getContractFactory('IdentityRegistry');
    await upgrades.upgradeProxy(addresses.IdentityRegistry, IdentityRegistry);
    console.log('✅ IdentityRegistry logic upgraded.');
  }

  // --- Example: Upgrading EscrowFactory ---
  if (addresses.EscrowFactory) {
    console.log('Upgrading EscrowFactory...');
    const EscrowFactory = await ethers.getContractFactory('EscrowFactory');
    // Note: If you need to allow specific unsafe patterns during upgrade, add options:
    await upgrades.upgradeProxy(addresses.EscrowFactory, EscrowFactory, { unsafeAllow: ['constructor'] });
    console.log('✅ EscrowFactory logic upgraded.');
  }

  console.log('\n✨ All requested upgrades complete. Your DATA has been preserved.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
