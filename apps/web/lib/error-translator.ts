const ERROR_MESSAGES: Record<string, string> = {
    // EscrowFactory reverts
    "EscrowFactory: application cooldown active": "You're on a quick cooldown. Please wait a few minutes before applying to another mission!",
    "EscrowFactory: already applied": "You've already submitted an application for this mission.",
    "EscrowFactory: client cannot apply": "As the mission creator, you cannot apply to your own mission.",
    "EscrowFactory: operator must have profile": "You need to create a profile before you can apply for missions. Visit the 'Onboarding' section!",
    "EscrowFactory: invalid application stake": "The application stake amount is incorrect. Please refresh and try again.",
    "EscrowFactory: job not open": "This mission is no longer accepting applications.",
    "EscrowFactory: only client": "Only the mission creator can perform this action.",
    "EscrowFactory: only selected operator": "Only the selected operator for this mission can perform this action.",
    "EscrowFactory: incorrect funding amount": "The funding amount does not match the mission budget.",
    "EscrowFactory: funding window expired": "The time to fund this mission has passed. Please contact support if this is an error.",
    
    // Governor reverts
    "Governor: vote already cast": "You have already cast a vote for this proposal.",
    "Governor: proposal not active": "This proposal is not currently active for voting.",
    "Governor: invalid proposal id": "This proposal does not exist.",
    "Governor: proposal not successful": "This proposal cannot be executed yet. It must pass first.",
    "Governor: execution failed": "Execution failed. Ensure the underlying contract logic allows this action.",
    
    // Generic fallbacks
    "user rejected the request": "Transaction was cancelled in your wallet.",
    "insufficient funds": "You don't have enough AVAX to cover the transaction cost or stake."
}

type ContractError = {
    message?: string;
    toString?: () => string;
};

/**
 * Translates technical contract revert reasons into simple, non-technical language for users.
 */
export function translateError(error: unknown): string {
    const err = error as ContractError;
    const errorMessage = (err?.message || err?.toString?.() || "").toLowerCase()
    
    const matchedKey = Object.keys(ERROR_MESSAGES).find(key => 
        errorMessage.includes(key.toLowerCase())
    )
    
    if (matchedKey) {
        return ERROR_MESSAGES[matchedKey]
    }

    // Default catch-all
    console.error("Unrecognized contract error:", error)
    return "Something went wrong with the transaction. Please try again or check your connection."
}
