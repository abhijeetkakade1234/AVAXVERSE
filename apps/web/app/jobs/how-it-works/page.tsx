'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Zap, Scale, Clock, Award, Info, HelpCircle, Layout, Code2, Rocket, ChevronDown, ChevronUp } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Section } from '@/components/ui'

const FAQ_ITEMS = [
    {
        q: "Why do I need to pay a 'Commitment Deposit' to post a job?",
        a: "The commitment deposit is an anti-spam measure. It ensures that only serious clients use the network's resources. This deposit is fully refunded to you once you fund the escrow for your selected operator. If you select an operator but fail to fund the mission within the timeout window, the deposit is forfeited to the operator as compensation for their reserved time."
    },
    {
        q: "How is the 'Operator Stake' calculated?",
        a: "Operator stake is a security collateral. By default, it's a percentage of the job budget. However, AVAXVERSE rewards high-reputation users. For every 100 reputation points you earn, your required stake is dynamically reduced, making it easier for trusted veterans to secure more missions."
    },
    {
        q: "What happens if there is a dispute?",
        a: "If either party raising a dispute, the funds are locked in the smart contract. A 3-day window opens for both sides to submit final evidence. After this, an independent Mediator reviews the on-chain evidence and the Audit Report (if applicable) to decide the final distribution of funds. Mediators are high-reputation community members or specialized security partners."
    },
    {
        q: "Can I cancel a mission after it's been posted?",
        a: "A mission can be cancelled by the client as long as no operator has been selected. Once an operator is selected and accepted, the workflow enters a high-stakes phase where cancellations have economic consequences to protect both sides' time and capital."
    },
    {
        q: "How do I increase my Reputation Score?",
        a: "Reputation is earned through successful mission completions, manual approvals by clients, and positive dispute resolutions. High reputation unlocks lower collateral requirements, priority ranking in search, and eligibility for Mediator roles."
    }
]

const ROUTE_EXPLANATIONS = [
    {
        icon: <Layout className="text-primary" size={24} />,
        title: "Marketplace (/jobs)",
        desc: "The nerve center of AVAXVERSE. This is where missions are initialized, discovered, and managed. It handles everything from the initial handshake to the final escrow release."
    },
    {
        icon: <HelpCircle className="text-emerald-500" size={24} />,
        title: "Profile (/profile)",
        desc: "Your professional on-chain identity. It displays your completed missions, reputation score, and technical specializations. It acts as your passport in the Avalanche gig economy."
    },
    {
        icon: <Scale className="text-purple-500" size={24} />,
        title: "Governance (/governance)",
        desc: "Where the community decides on protocol parameters, mediator selections, and long-term platform evolution using the AVX token (coming soon)."
    },
    {
        icon: <Code2 className="text-blue-500" size={24} />,
        title: "Explorer (/explorer)",
        desc: "A specialized dashboard to track on-chain escrow states, historical payouts, and global network analytics. Total transparency for every mission."
    },
    {
        icon: <Rocket className="text-orange-500" size={24} />,
        title: "Vision (/vision)",
        desc: "Our roadmap and core philosophy. Learn about why we're building on Avalanche and how we plan to scale decentralized work to millions."
    }
]

function FaqItem({ q, a }: { q: string, a: string }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-2xl overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full text-left p-6 flex justify-between items-center hover:bg-primary/5 transition-colors"
            >
                <span className="font-bold text-lg pr-4">{q}</span>
                {isOpen ? <ChevronUp className="shrink-0" /> : <ChevronDown className="shrink-0" />}
            </button>
            {isOpen && (
                <div className="p-6 pt-0 text-text-muted-light dark:text-text-muted-dark border-t border-white/5 animate-enter">
                    <p className="leading-relaxed">{a}</p>
                </div>
            )}
        </div>
    )
}

export default function HowItWorksPage() {
    return (
        <main className="min-h-screen bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark transition-colors duration-300">
            <Navbar />
            <div className="pt-32 pb-20">
                <Section>
                    <Link href="/jobs" className="inline-flex items-center gap-2 text-text-muted-light dark:text-text-muted-dark hover:text-primary transition-colors mb-12 group text-sm font-bold">
                        <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Back to Marketplace
                    </Link>

                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <h1 className="text-4xl md:text-6xl font-black mb-6 tracking-tight">Documentation & Help</h1>
                            <p className="text-xl text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                Master the AVAXVERSE engine. Everything you need to know about trustless missions on Avalanche.
                            </p>
                        </div>

                        {/* Navigation Tabs */}
                        <div className="flex flex-wrap justify-center gap-4 mb-20">
                            {['Workflow', 'System FAQ', 'Route Guide', 'Safety'].map((tab) => (
                                <a key={tab} href={`#${tab.toLowerCase().replace(' ', '-')}`} className="px-6 py-2 rounded-full border border-white/20 hover:border-primary hover:text-primary transition-all font-bold text-sm bg-white/5">
                                    {tab}
                                </a>
                            ))}
                        </div>

                        {/* Workflow Section */}
                        <div id="workflow" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                                    <Zap size={32} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">7-Step Trustless Flow</h2>
                            </div>
                            <div className="grid gap-6">
                                {[
                                    { step: 1, title: 'Mission Posting', desc: 'Define scope and budget. Provide metadata for accountability. Post requires a small commitment deposit.' },
                                    { step: 2, title: 'Network Application', desc: 'Verified Operators apply with proposals and collateral (stake). Reputation reduces stake requirements.' },
                                    { step: 3, title: 'Intelligent Selection', desc: 'Analyze past completion rates and audit history to select the ideal partner for the task.' },
                                    { step: 4, title: 'Mission Acceptance', desc: 'Operator confirms technical readiness. This commitment is locked on-chain to prevent time-wasting.' },
                                    { step: 5, title: 'Escrow Funding', desc: 'Capital is locked in the contract. Client deposit is refunded. Capital is now secure and visible.' },
                                    { step: 6, title: 'Evidence Submission', desc: 'Operator delivers work and immutable proof (CID/TX). The 7-day Quality Assurance clock begins.' },
                                    { step: 7, title: 'Payout & Reputation', desc: 'Funds release on approval or timeout. Both parties gain reputation for a successful operation.' },
                                ].map((s) => (
                                    <div key={s.step} className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-6 flex gap-6 items-start hover:scale-[1.01] transition-transform">
                                        <div className="flex-none w-12 h-12 rounded-2xl bg-primary text-white flex items-center justify-center font-black text-xl shadow-lg shadow-primary/20">
                                            {s.step}
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-1 tracking-tight">{s.title}</h3>
                                            <p className="text-text-muted-light dark:text-text-muted-dark text-sm leading-relaxed">{s.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* FAQ Section */}
                        <div id="system-faq" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-emerald-500/10 rounded-2xl text-emerald-500">
                                    <HelpCircle size={32} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">Marketplace FAQ</h2>
                            </div>
                            <div className="space-y-4">
                                {FAQ_ITEMS.map((item, i) => (
                                    <FaqItem key={i} q={item.q} a={item.a} />
                                ))}
                            </div>
                        </div>

                        {/* Routes Section */}
                        <div id="route-guide" className="mb-32 scroll-mt-32">
                            <div className="flex items-center gap-4 mb-10">
                                <div className="p-3 bg-blue-500/10 rounded-2xl text-blue-500">
                                    <Layout size={32} />
                                </div>
                                <h2 className="text-4xl font-black tracking-tight">Platform Guide</h2>
                            </div>
                            <div className="grid gap-6">
                                {ROUTE_EXPLANATIONS.map((route, i) => (
                                    <div key={i} className="glass-panel bg-card-light dark:bg-card-dark border border-white/40 dark:border-white/10 rounded-3xl p-8 flex gap-8 items-center">
                                        <div className="flex-none w-16 h-16 rounded-2xl bg-white/5 dark:bg-black/20 flex items-center justify-center">
                                            {route.icon}
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black mb-1 tracking-tight">{route.title}</h3>
                                            <p className="text-text-muted-light dark:text-text-muted-dark text-sm leading-relaxed">{route.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Safety Section */}
                        <div id="safety" className="mb-32 scroll-mt-32">
                            <div className="glass-panel bg-red-500/5 border border-red-500/20 rounded-[3rem] p-12 overflow-hidden relative">
                                <div className="absolute top-0 right-0 p-8 opacity-10">
                                    <ShieldCheck size={200} />
                                </div>
                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-10">
                                        <div className="p-3 bg-red-500/10 rounded-2xl text-red-500">
                                            <Info size={32} />
                                        </div>
                                        <h2 className="text-4xl font-black tracking-tight">Safety & SLA</h2>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <Clock className="text-primary" size={20} /> Auto-Review Windows
                                            </h3>
                                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                To prevent capital from being locked indefinitely, a 7-day auto-review timer starts when an operator submits work. If you don&apos;t approve or raise a dispute within this window, the smart contract automatically releases the funds.
                                            </p>
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                                                <Scale className="text-primary" size={20} /> Resolution SLAs
                                            </h3>
                                            <p className="text-sm text-text-muted-light dark:text-text-muted-dark leading-relaxed">
                                                If a dispute is raised, the counter-evidence window is 72 hours. Our goal is for mediators to resolve all disputes within 5 business days of the final evidence submission.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Call to Action */}
                        <div className="text-center p-20 glass-panel bg-primary rounded-[4rem] text-white shadow-2xl shadow-primary/30">
                            <Rocket className="mx-auto mb-8 animate-bounce" size={64} />
                            <h2 className="text-4xl font-black mb-6 tracking-tight">Ready to Deploy?</h2>
                            <p className="text-white/80 max-w-xl mx-auto mb-10 text-lg font-medium leading-relaxed">
                                Join the most secure job marketplace in the Avalanche ecosystem. Start building on the infrastructure of trust.
                            </p>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Link href="/jobs?tab=create" className="px-12 py-5 rounded-full bg-white text-primary font-black text-lg hover:scale-105 transition-all shadow-xl">
                                    Post a Mission
                                </Link>
                                <Link href="/jobs?tab=browse" className="px-12 py-5 rounded-full bg-primary-dark text-white border border-white/20 font-black text-lg hover:scale-105 transition-all shadow-xl">
                                    Browse Missions
                                </Link>
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
            <section className="px-4 md:px-8 py-20">
                <div className="max-w-7xl mx-auto w-full">
                    <Footer />
                </div>
            </section>
        </main>
    )
}
