import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function BountiesPage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark flex flex-col pt-24 text-center">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">
                 <h1 className="text-5xl font-black font-outfit mb-6">Open Bounties</h1>
                 <p className="text-xl opacity-70 max-w-2xl font-medium">Coming Soon: Contribute to the ecosystem and earn rewards through our decentralized bounty system.</p>
                 <div className="mt-12 p-8 glass-card rounded-3xl border border-white/20">
                    <p className="font-bold">Your expertise, rewarded on-chain.</p>
                 </div>
            </div>
            <Footer />
        </main>
    )
}
