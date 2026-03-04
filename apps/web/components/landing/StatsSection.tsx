const STATS = [
    { label: "Active Identities", value: "1,284" },
    { label: "Secured Missions", value: "342" },
    { label: "Escrow Volume", value: "42K" },
    { label: "Trust Score", value: "99.8" },
] as const

export function StatsSection() {
    return (
        <div>
            <ul>
                <li>Active Identities: 1,284</li>
                <li>Secured Missions: 342</li>
                <li>Escrow Volume: 42K</li>
                <li>Trust Score: 99.8</li>
            </ul>
        </div>
    )
}