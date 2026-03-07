import * as fs from 'fs';
import * as path from 'path';

async function main() {
  const deploymentPath = path.resolve(__dirname, '..', 'deployments', 'localhost.json');
  const envPath = path.resolve(__dirname, '..', '..', '..', 'apps', 'web', '.env.local');

  if (!fs.existsSync(deploymentPath)) {
    console.error("❌ Deployment file not found!");
    process.exit(1);
  }

  const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
  
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  const updates = {
    NEXT_PUBLIC_IDENTITY_REGISTRY: addresses.IdentityRegistry,
    NEXT_PUBLIC_REPUTATION_TOKEN: addresses.ReputationToken,
    NEXT_PUBLIC_ESCROW_FACTORY: addresses.EscrowFactory,
    NEXT_PUBLIC_AVAX_TOKEN: addresses.AVAXToken,
    NEXT_PUBLIC_AVAX_GOVERNOR: addresses.AVAXGovernor,
  };

  let newEnvContent = envContent;
  for (const [key, value] of Object.entries(updates)) {
    const regex = new RegExp(`^${key}=.*`, 'm');
    if (newEnvContent.match(regex)) {
      newEnvContent = newEnvContent.replace(regex, `${key}=${value}`);
    } else {
      newEnvContent += `\n${key}=${value}`;
    }
  }

  fs.writeFileSync(envPath, newEnvContent.trim() + '\n');
  console.log("✅ .env.local updated with new contract addresses!");
}

main().catch(console.error);
