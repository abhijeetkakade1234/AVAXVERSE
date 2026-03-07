import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const deploymentPath = path.resolve(__dirname, '..', 'deployments', 'localhost.json');
    const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    const [owner] = await ethers.getSigners();
    const EscrowFactory = await ethers.getContractAt('EscrowFactory', addresses.EscrowFactory, owner);
    
    const escrowAddr = '0x856e4424f806D16E8CBC702B3c0F2ede5468eae5'; // From previous diagnostic
    
    console.log('--- Attempting manual onJobCompleted call ---');
    console.log('Escrow Address:', escrowAddr);
    console.log('Caller (Owner):', owner.address);
    
    try {
        const tx = await EscrowFactory.onJobCompleted(escrowAddr);
        console.log('Transaction sent:', tx.hash);
        await tx.wait();
        console.log('✅ Status successfully updated to CLOSED!');
    } catch (error: any) {
        console.error('❌ onJobCompleted failed!');
        if (error.reason) console.error('Reason:', error.reason);
        if (error.data) console.error('Data:', error.data);
        console.error(error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
