// Shared types for the Jobs route
export type Job = {
    escrow: string
    client: string
    freelancer: string
    title: string
    metadataURI: string
    budget: bigint
    createdAt: bigint
    status: number // 0: OPEN, 1: SELECTED, 2: ACCEPTED, 3: FUNDED, 4: CLOSED, 5: CANCELLED
    operatorAccepted: boolean
}

export type JobApplication = {
    proposalURI: string
    appliedAt: bigint
    exists: boolean
}
