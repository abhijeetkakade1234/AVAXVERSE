import { ethers } from 'hardhat';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
    const deploymentPath = path.resolve(__dirname, '..', 'deployments', 'localhost.json');
    const addresses = JSON.parse(fs.readFileSync(deploymentPath, 'utf8'));
    
    const EscrowFactory = await ethers.getContractAt('EscrowFactory', addresses.EscrowFactory);
    const jobId = 1;
    
    try {
        const job = await EscrowFactory.getJob(jobId);
        console.log('--- Job Details ---');
        console.log('ID:', jobId);
        console.log('Status:', job.status.toString()); // enum: 0=OPEN, 1=SELECTED, 2=ACCEPTED, 3=FUNDED...
        console.log('Client:', job.client);
        console.log('Freelancer:', job.freelancer);
        console.log('Budget:', ethers.formatEther(job.budget), 'AVAX');
        console.log('Escrow Address:', job.escrow);
        console.log('Operator Accepted:', job.operatorAccepted);
        
        const [selectedAt, acceptedAt] = await EscrowFactory.getSelectedTimestamps(jobId);
        console.log('Selected At:', selectedAt.toString());
        console.log('Accepted At:', acceptedAt.toString());
        
        if (job.escrow !== ethers.ZeroAddress) {
            const Escrow = await ethers.getContractAt('Escrow', job.escrow);
            const escrowState = await Escrow.getState();
            const storedFactory = await Escrow.factory();
            console.log('Escrow Stored Factory:', storedFactory);
            console.log('Actual Factory Address:', addresses.EscrowFactory);
            
            const ESCROW_STATES = ['FUNDED', 'SUBMITTED', 'APPROVED', 'DISPUTED', 'RELEASED', 'REFUNDED'];
            console.log('Escrow State:', ESCROW_STATES[Number(escrowState)] || 'UNKNOWN');
            
            const balance = await ethers.provider.getBalance(job.escrow);
            console.log('Escrow Balance:', ethers.formatEther(balance), 'AVAX');
            
            const filter = Escrow.filters.FundsReleased();
            const events = await Escrow.queryFilter(filter);
            console.log('FundsReleased Events:', events.length);
            if (events.length > 0) {
                console.log('Last Payout To:', (events[events.length - 1] as any).args[0]);
                console.log('Last Payout Amount:', ethers.formatEther((events[events.length - 1] as any).args[1]), 'AVAX');
            }
        }
        
        const sender = '0x8e133dF53EaC0211B9b57dCB4CF616bACB0a59f9';
        const IdentityRegistry = await ethers.getContractAt('IdentityRegistry', addresses.IdentityRegistry);
        const hasProfile = await IdentityRegistry.hasProfile(sender);
        console.log('--- Sender Profile Check ---');
        console.log('Sender:', sender);
        console.log('Has Profile:', hasProfile);
        
        const requiredStake = await EscrowFactory.requiredStakeFor(sender);
        console.log('Required Stake:', ethers.formatEther(requiredStake), 'AVAX');
        
        const provider = ethers.provider;
        const block = await provider.getBlock('latest');
        console.log('Current Block Timestamp:', block?.timestamp);
        
        const lastApp = await EscrowFactory.lastApplicationAt(sender);
        const cooldown = await EscrowFactory.applicationCooldownSec();
        console.log('Last Application At:', lastApp.toString());
        console.log('Application Cooldown (s):', cooldown.toString());
        
        if (lastApp > 0n && block && BigInt(block.timestamp) < lastApp + cooldown) {
            console.log('COOLDOWN ACTIVE! Remaining:', (lastApp + cooldown - BigInt(block.timestamp)).toString(), 'seconds');
        } else {
            console.log('Cooldown not active.');
        }
        
        const applicants = await EscrowFactory.getApplicants(jobId);
        console.log('Applicants:', applicants);
        
    } catch (error) {
        console.error('Error fetching job details:', error);
    }
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
