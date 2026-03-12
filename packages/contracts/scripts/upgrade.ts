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
  const networkName = ethers.provider.network ? (await ethers.provider.getNetwork()).name : 'localhost';
  
  // Normalize network name for deployment file checking
  const effectiveNetwork = networkName === 'unknown' ? 'fuji' : networkName === 'hardhat' ? 'localhost' : networkName;
  
  const deploymentPath = path.resolve(__dirname, '..', 'deployments', `${effectiveNetwork}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found for ${networkName}. Have you deployed yet?`);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));

  if (effectiveNetwork === 'mainnet') {
    console.log('\n⚠️  WARNING: You are about to upgrade contracts on MAINNET.');
    console.log('This will cost real AVAX and permanently change production logic.');
    console.log('Ensure you have tested these changes on Fuji first.\n');
  }

  console.log(`🚀 Upgrading contracts on ${networkName}...`);

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
