// Shared types for the Missions route
export type Mission = {
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

export type MissionApplication = {
    proposalURI: string
    appliedAt: bigint
    exists: boolean
}
