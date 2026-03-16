import Link from 'next/link'
import Logo from './Logo'

export default function Footer() {
    return (
        <footer className="bg-card-white/90 dark:bg-card-dark-1/90 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/20 dark:border-white/5">
            <div className="flex flex-col lg:flex-row justify-between gap-16 border-b border-gray-200 dark:border-gray-700/50 pb-16 mb-12">
                <div className="flex-1 max-w-lg">
                    <Logo
                        className="mb-8"
                        iconSize="text-3xl"
                        textSize="text-2xl"
                        color="text-gray-900 dark:text-white"
                    />
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">One Identity.<br /><span className="text-primary italic">Sovereign Work.</span></h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                        The ultimate professional super app for the sovereign economy. Build your reputation, execute missions, and govern the future.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Stay in the loop"
                            suppressHydrationWarning
                            className="flex-1 bg-white dark:bg-gray-800/10 border border-gray-200 dark:border-white/10 rounded-full px-8 py-4 text-base focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white shadow-sm"
                        />
                        <button className="bg-primary text-white px-10 py-4 rounded-full text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            Join Hub
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20 text-sm">
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Ecosystem</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400 font-medium">
                            <Link href="/explore" className="hover:text-primary transition-colors cursor-pointer">Explorer</Link>
                            <Link href="/governance" className="hover:text-primary transition-colors cursor-pointer">Governance</Link>
                            <Link href="/missions" className="hover:text-primary transition-colors cursor-pointer">Mission Hub</Link>
                            <Link href="/profile" className="hover:text-primary transition-colors cursor-pointer">My Career</Link>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Knowledge</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400 font-medium">
                            <Link href="/vision" className="hover:text-primary transition-colors cursor-pointer">Super App Vision</Link>
                            <a href="https://docs.avaxverse.xyz" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors cursor-pointer">Documentation</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Whitepaper</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Roadmap</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Community</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400 font-medium">
                            <a href="https://x.com/avaxverse67" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors cursor-pointer">Twitter / X</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Discord</a>
                            <a href="https://github.com/abhijeetkakade1234/AVAXVERSE" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors cursor-pointer">GitHub</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full border border-green-200 dark:border-green-800/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                    <span className="uppercase font-bold">{process.env.NEXT_PUBLIC_NETWORK || 'Avalanche'}</span> Systems Operational
                </div>
                <p suppressHydrationWarning>© {new Date().getFullYear()} AVAXVERSE Ecosystem. All rights reserved.</p>
                <div className="flex gap-8">
                    <a className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                    <a className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                </div>
            </div>
        </footer>
    )
}