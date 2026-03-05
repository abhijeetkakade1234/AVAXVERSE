export default function Footer() {
    return (
        <footer className="bg-card-white/90 dark:bg-card-dark-1/90 backdrop-blur-xl rounded-[3rem] p-10 md:p-16 shadow-2xl border border-white/20 dark:border-white/5">
            <div className="flex flex-col lg:flex-row justify-between gap-16 border-b border-gray-200 dark:border-gray-700/50 pb-16 mb-12">
                <div className="flex-1 max-w-lg">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="material-icons text-primary text-3xl">layers</span>
                        <span className="font-bold text-2xl tracking-tighter text-gray-900 dark:text-white">AVAXVERSE</span>
                    </div>
                    <h3 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">Stay updated</h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">
                        Sign up for our newsletter and join the growing AVAXVERSE community.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input
                            type="email"
                            placeholder="Enter your email"
                            className="flex-1 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-white/10 rounded-full px-8 py-4 text-base focus:ring-2 focus:ring-primary outline-none text-gray-900 dark:text-white shadow-inner"
                        />
                        <button className="bg-primary text-white px-10 py-4 rounded-full text-base font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                            Sign up
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-12 lg:gap-20 text-sm">
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Product</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400">
                            <a className="hover:text-primary transition-colors cursor-pointer">Download</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Security</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Support</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Feature Requests</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Resources</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400">
                            <a className="hover:text-primary transition-colors cursor-pointer">Explore</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Learn</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Blog</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Docs</a>
                        </div>
                    </div>
                    <div className="flex flex-col gap-6">
                        <h4 className="font-bold text-gray-900 dark:text-white uppercase tracking-widest text-xs">Company</h4>
                        <div className="flex flex-col gap-4 text-gray-500 dark:text-gray-400">
                            <a className="hover:text-primary transition-colors cursor-pointer">About</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Careers</a>
                            <a className="hover:text-primary transition-colors cursor-pointer">Press Kit</a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-xs font-medium text-gray-500">
                <div className="flex items-center gap-3 bg-green-50 dark:bg-green-900/10 text-green-600 dark:text-green-400 px-4 py-2 rounded-full border border-green-200 dark:border-green-800/30">
                    <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.6)]"></span>
                    Systems Operational
                </div>
                <p>© 2024 AVAXVERSE Ecosystem. All rights reserved.</p>
                <div className="flex gap-8">
                    <a className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Terms of Service</a>
                    <a className="hover:text-gray-900 dark:hover:text-white transition-colors cursor-pointer">Privacy Policy</a>
                </div>
            </div>
        </footer>
    )
}