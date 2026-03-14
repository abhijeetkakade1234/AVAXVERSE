import Navbar from "@/components/Navbar"
import Footer from "@/components/Footer"

export default function TalentPage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark flex flex-col pt-24 text-center">
            <Navbar />
            <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center justify-center">
                 <h1 className="text-5xl font-black font-outfit mb-6">Talent Marketplace</h1>
                 <p className="text-xl opacity-70 max-w-2xl font-medium">Coming Soon: The premier marketplace for high-stakes Web3 talent and reputation-weighted matching.</p>
                 <div className="mt-12 p-8 glass-card rounded-3xl border border-white/20">
                    <p className="font-bold">Building the future of sovereign work.</p>
                 </div>
            </div>
            <Footer />
        </main>
    )
}
