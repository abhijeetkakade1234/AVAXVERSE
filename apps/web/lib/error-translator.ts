const ERROR_MESSAGES: Record<string, string> = {
    // EscrowFactory / Escrow errors
    "escrowfactory: application cooldown active": "You are on application cooldown. Please wait and try again.",
    "cooldownactive": "You are on application cooldown. Please wait and try again.",
    "escrowfactory: already applied": "You have already applied to this mission.",
    "alreadyapplied": "You have already applied to this mission.",
    "escrowfactory: client cannot apply": "Mission creator cannot apply to their own mission.",
    "escrowfactory: operator must have profile": "Create your profile first, then apply again.",
    "escrowfactory: invalid application stake": "Application stake amount is incorrect. Refresh and try again.",
    "escrowfactory: job not open": "This mission is not open for applications.",
    "escrowfactory: only client": "Only the mission creator can perform this action.",
    "escrowfactory: only selected operator": "Only the selected operator can perform this action.",
    "unauthorized": "This action is not allowed for your current role or mission state.",
    "profilerequired": "Create your profile first, then retry this action.",
    "escrowfactory: incorrect funding amount": "Funding amount must match the mission budget exactly.",
    "escrowfactory: funding window expired": "Funding window has expired for this mission.",
    "escrow: dispute fee too low": "Dispute fee is below the required minimum.",
    "stake locked": "Your application stake is still locked for this mission state.",
    "stakelocked": "Your application stake is still locked for this mission state.",
    "nostake": "No withdrawable application stake found for this mission.",
    "no stake": "No withdrawable application stake found for this mission.",
    "state mismatch": "This action is not available in the current mission state.",
    "statemismatch": "This action is not available in the current mission state.",
    "windowexpired": "This timeout action is not available yet. Wait for the configured time window, then retry.",
    "accounttoonew": "This wallet is too new to create missions yet.",
    "account too new": "This wallet is too new to create missions yet.",
    "rolenotset": "Select your mission role in profile settings before continuing.",
    "invalidrole": "This action is not allowed for your current role.",
    "base role already set": "Your base role is already set and cannot be changed in MVP mode.",

    // Identity / profile errors
    "identityregistry: already registered": "This wallet is already registered.",
    "namealreadytaken": "That display name is already taken.",
    "identityregistry: not authorized": "You are not authorized to perform this action.",
    "identityregistry: invalid name": "Display name is invalid. Try a shorter or different name.",

    // Governance errors
    "governor: vote already cast": "You have already cast a vote for this proposal.",
    "governor: proposal not active": "This proposal is not active for voting.",
    "governor: invalid proposal id": "This proposal does not exist.",
    "governor: proposal not successful": "This proposal must pass before execution.",
    "governor: execution failed": "Proposal execution failed on-chain.",

    // Network / gas / wallet common cases
    "user rejected the request": "Transaction was cancelled in your wallet.",
    "user denied": "Transaction was cancelled in your wallet.",
    "rejected the request": "Transaction was cancelled in your wallet.",
    "insufficient funds": "Not enough AVAX to cover value + gas.",
    "unable to calculate gas limit": "Gas estimation failed. Check wallet balance, network, and mission state.",
    "exceeds transaction gas cap": "Transaction could not be processed due to a temporary network limit. Please try again in a moment.",
    "transaction gas limit is 21000000 and exceeds transaction gas cap": "Transaction failed on the local test network limit. Restart your local node and try again.",
    "nonce too low": "Nonce is out of sync. Reset account in wallet or wait for pending tx to confirm.",
    "already known": "This transaction is already pending in your wallet.",
    "network changed": "Wallet network changed during the transaction. Reconnect and retry.",
    "execution reverted": "Transaction reverted by contract conditions. Verify mission state and inputs.",
    "hardhat couldn't infer the reason": "Transaction failed, usually due to gas or oversized input. Shorten mission text and retry.",
}

type ContractError = {
    message?: string
    shortMessage?: string
    details?: string
    cause?: unknown
    toString?: () => string
}

function flattenError(error: unknown): string {
    const err = error as ContractError
    const self = [err?.message, err?.shortMessage, err?.details, err?.toString?.()].filter(Boolean).join(" | ")
    const cause = err?.cause ? flattenError(err.cause) : ""
    return `${self}${cause ? ` | ${cause}` : ""}`.toLowerCase()
}

export function isUserRejection(error: unknown): boolean {
    const msg = flattenError(error)
    return (
        msg.includes("user rejected") ||
        msg.includes("user denied") ||
        msg.includes("rejected the request") ||
        msg.includes("cancelled in your wallet")
    )
}

/**
 * Translates technical contract/wallet errors into user-facing messages.
 */
export function translateError(error: unknown): string {
    const errorMessage = flattenError(error)

    const matchedKey = Object.keys(ERROR_MESSAGES).find((key) => errorMessage.includes(key))
    if (matchedKey) return ERROR_MESSAGES[matchedKey]

    console.error("Unrecognized contract error:", error)
    return "Transaction failed. Check mission state, inputs, and wallet network, then try again."
}
