export function Footer() {
    const currentYear = new Date().getFullYear()

    return (
        <footer>
            <div>
                AVAXVERSE
            </div>
            <p>
                © {currentYear} AVAXVERSE // FORGED IN AVALANCHE
            </p>
            <nav>
                <a href="#">Documentation</a>
                <a href="#">Governance</a>
                <a href="#">Fuji Lab</a>
                <a href="#">Ecosystem</a>
            </nav>
            <div>
                CORE ONLINE
            </div>
            <div>
                Sovereign Identity. Atomic Escrow. Proof of Reputation.
            </div>
        </footer>
    )
}
