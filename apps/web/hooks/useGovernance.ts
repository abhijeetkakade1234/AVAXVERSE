'use client'

import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { CONTRACT_ADDRESSES } from '@/lib/config'
import { AVAX_GOVERNOR_ABI, AVAX_TOKEN_ABI } from '@/lib/abis'

export function useGovernance() {
    const { address } = useAccount()
    const { writeContractAsync } = useWriteContract()

    // 1. Fetch User Voting Power
    const { data: votingPower } = useReadContract({
        address: CONTRACT_ADDRESSES.AVAXToken,
        abi: AVAX_TOKEN_ABI,
        functionName: 'getVotes',
        args: address ? [address] : undefined,
    })

    // 2. Fetch User Delegate
    const { data: delegate } = useReadContract({
        address: CONTRACT_ADDRESSES.AVAXToken,
        abi: AVAX_TOKEN_ABI,
        functionName: 'delegates',
        args: address ? [address] : undefined,
    })

    // 3. Delegate to self
    const selfDelegate = async () => {
        if (!address) return
        try {
            return await writeContractAsync({
                address: CONTRACT_ADDRESSES.AVAXToken,
                abi: AVAX_TOKEN_ABI,
                functionName: 'delegate',
                args: [address],
            })
        } catch (error: unknown) {
            console.error('Delegation error:', error)
            throw error
        }
    }

    // 4. Cast Vote
    const castVote = async (proposalId: bigint, support: number) => {
        try {
            return await writeContractAsync({
                address: CONTRACT_ADDRESSES.AVAXGovernor,
                abi: AVAX_GOVERNOR_ABI,
                functionName: 'castVote',
                args: [proposalId, support],
            })
        } catch (error: unknown) {
            console.error('Vote error:', error)
            throw error
        }
    }

    // 5. Propose
    const propose = async (description: string, targetAddr?: `0x${string}`, calldata?: `0x${string}`) => {
        if (!address) return
        const targets: readonly `0x${string}`[] = [targetAddr || CONTRACT_ADDRESSES.AVAXToken]
        const values: readonly bigint[] = [0n]
        const calldatas: readonly `0x${string}`[] = [calldata || '0x']
        try {
            return await writeContractAsync({
                address: CONTRACT_ADDRESSES.AVAXGovernor,
                abi: AVAX_GOVERNOR_ABI,
                functionName: 'propose',
                args: [targets, values, calldatas, description],
            })
        } catch (error: unknown) {
            console.error('Propose error:', error)
            throw error
        }
    }

    // 6. Execute (Queue and Execute are often combined or separate, here we map to execute assuming no timelock or basic governor)
    const execute = async (targets: `0x${string}`[], values: bigint[], calldatas: `0x${string}`[], descriptionHash: `0x${string}`) => {
        try {
            return await writeContractAsync({
                address: CONTRACT_ADDRESSES.AVAXGovernor,
                abi: AVAX_GOVERNOR_ABI,
                functionName: 'execute',
                args: [targets, values, calldatas, descriptionHash],
            })
        } catch (error: unknown) {
            console.error('Execute error:', error)
            throw error
        }
    }

    return {
        address,
        votingPower: votingPower ? BigInt(votingPower.toString()) : 0n,
        delegate,
        selfDelegate,
        castVote,
        propose,
        execute,
        hasVotingPower: votingPower ? BigInt(votingPower.toString()) > 0n : false,
        isDelegated: delegate && address ? delegate.toString().toLowerCase() === address.toLowerCase() : false,
    }
}
