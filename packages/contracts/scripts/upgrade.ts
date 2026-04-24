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
  const effectiveNetwork =
    networkName === 'unknown' ? 'fuji' : networkName === 'hardhat' ? 'localhost' : networkName;

  const deploymentPath = path.resolve(__dirname, '..', 'deployments', `${effectiveNetwork}.json`);

  if (!fs.existsSync(deploymentPath)) {
    throw new Error(`Deployment file not found for ${networkName}. Have you deployed yet?`);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  const [signer] = await ethers.getSigners();
  const signerAddress = await signer.getAddress();
  const isLocalNetwork = effectiveNetwork === 'localhost' || effectiveNetwork === 'hardhat';

  if (effectiveNetwork === 'mainnet') {
    console.log('\nWARNING: You are about to upgrade contracts on MAINNET.');
    console.log('This will cost real AVAX and permanently change production logic.');
    console.log('Ensure you have tested these changes on Fuji first.\n');
  }

  console.log(`Upgrading contracts on ${networkName}...`);
  console.log(`Upgrade signer: ${signerAddress}`);

  const ownableAbi = ['function owner() view returns (address)'];
  const timelockAbi = [
    'function getMinDelay() view returns (uint256)',
    'function schedule(address target,uint256 value,bytes data,bytes32 predecessor,bytes32 salt,uint256 delay)',
    'function execute(address target,uint256 value,bytes data,bytes32 predecessor,bytes32 salt)',
  ];
  const uupsAbi = ['function upgradeToAndCall(address newImplementation, bytes data)'];

  async function upgradeUUPS(
    label: string,
    proxyAddress: string,
    factoryName: string,
    options?: { unsafeAllow?: string[] }
  ) {
    const ContractFactory = await ethers.getContractFactory(factoryName);
    const proxyAsOwnable = await ethers.getContractAt(ownableAbi, proxyAddress);
    const owner = (await proxyAsOwnable.owner()).toLowerCase();

    // Owner is signer => direct upgrade path
    if (owner === signerAddress.toLowerCase()) {
      await upgrades.upgradeProxy(proxyAddress, ContractFactory, options ?? {});
      console.log(`OK ${label} logic upgraded (direct owner path).`);
      return;
    }

    // Owner is timelock => timelock path
    const timelockAddress = (addresses.TimelockController as string | undefined)?.toLowerCase();
    if (timelockAddress && owner === timelockAddress) {
      const timelock = await ethers.getContractAt(timelockAbi, addresses.TimelockController);
      const minDelay = await timelock.getMinDelay();

      const newImplementation = await upgrades.prepareUpgrade(proxyAddress, ContractFactory, options ?? {});
      const proxyAsUUPS = await ethers.getContractAt(uupsAbi, proxyAddress);
      const callData = proxyAsUUPS.interface.encodeFunctionData('upgradeToAndCall', [
        newImplementation,
        '0x',
      ]);

      const predecessor = ethers.ZeroHash;
      const salt = ethers.keccak256(ethers.toUtf8Bytes(`${label}-${Date.now()}`));

      console.log(`INFO ${label} owner is TimelockController (${addresses.TimelockController}).`);
      console.log(`INFO Prepared new implementation: ${newImplementation}`);
      console.log(`Scheduling timelock operation (delay=${minDelay}s)...`);

      await timelock.schedule(proxyAddress, 0, callData, predecessor, salt, minDelay);
      console.log(`OK ${label} timelock operation scheduled.`);

      if (!isLocalNetwork) {
        console.log(
          `INFO ${label} upgrade is scheduled on ${effectiveNetwork}. Execute it after delay with the same calldata/salt.`
        );
        return;
      }

      if (minDelay > 0n) {
        await ethers.provider.send('evm_increaseTime', [Number(minDelay) + 1]);
        await ethers.provider.send('evm_mine', []);
      }

      await timelock.execute(proxyAddress, 0, callData, predecessor, salt);
      console.log(`OK ${label} logic upgraded (timelock path).`);
      return;
    }

    throw new Error(
      `${label} owner mismatch. Proxy owner is ${owner}, signer is ${signerAddress}. ` +
        `Set the correct signer or use timelock-owned deployment metadata.`
    );
  }

  if (addresses.IdentityRegistry) {
    console.log('Upgrading IdentityRegistry...');
    await upgradeUUPS('IdentityRegistry', addresses.IdentityRegistry, 'IdentityRegistry');
  }

  if (addresses.EscrowFactory) {
    console.log('Upgrading EscrowFactory...');
    await upgradeUUPS('EscrowFactory', addresses.EscrowFactory, 'EscrowFactory', {
      unsafeAllow: ['constructor'],
    });
  }

  console.log('\nAll requested upgrades complete. Your DATA has been preserved.');
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
