'use client';
import { Shield, Lock, Award, BarChart3, DollarSign, Zap, Rocket, Link } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { FeatureCard } from '@/components/ui/grid-feature-cards';

const features = [
    {
        title: 'Sovereign Identity',
        icon: Shield,
        description: 'Your wallet is your passport. Verifiable credentials that belong to you, not a database.',
    },
    {
        title: 'Atomic Escrow',
        icon: Lock,
        description: 'Smart contracts act as neutral arbiters. Payment is released only when milestones are verified.',
    },
    {
        title: 'Proof of Reputation',
        icon: Award,
        description: 'Earn non-transferable badges for every successful mission. Your history is your capital.',
    },
    {
        title: 'On-Chain Governance',
        icon: BarChart3,
        description: 'The protocol is governed by the users. Propose, vote, and evolve the ecosystem together.',
    },
    {
        title: 'Trustless Payments',
        icon: DollarSign,
        description: 'Direct peer-to-peer value transfer without intermediaries or hidden fees.',
    },
    {
        title: 'Hyper-Secure Speed',
        icon: Zap,
        description: "Leveraging Avalanche's sub-second finality for near-instant transaction settlement.",
    },
    {
        title: 'DAO Incubation',
        icon: Rocket,
        description: 'Tools to launch and scale your own decentralized autonomous organization effortlessly.',
    },
    {
        title: 'Universal Connectivity',
        icon: Link,
        description: 'Cross-chain interoperability to connect with the broader Web3 ecosystem seamlessly.',
    },
];

export function FeaturesSection() {
    return (
        <section className="relative py-20 md:py-36 overflow-visible z-10">
            {/* Subtle Gradient connecting previous section */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="relative mx-auto w-full max-w-[90rem] space-y-16 px-4 md:px-8">
                <div className="w-full flex justify-center">
                    <AnimatedContainer className="mx-auto max-w-3xl text-center flex flex-col items-center">
                        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#f42525]/10 border border-[#f42525]/20 text-[#f42525] text-xs font-bold uppercase tracking-widest mb-6">
                            <span>Core Features</span>
                        </div>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight">
                            A New Era of <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#f42525] to-orange-500">Trust</span>
                        </h2>
                        <p className="text-slate-400 text-lg md:text-xl leading-relaxed max-w-2xl mx-auto">
                            Engineered for the decentralized frontier. Built on Avalanche for speed, security, and absolute reliability.
                        </p>
                    </AnimatedContainer>
                </div>

                <AnimatedContainer
                    delay={0.4}
                    className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
                >
                    {features.map((feature, i) => (
                        <FeatureCard key={i} feature={feature} className="glass-node bg-white/5 border border-white/5 hover:border-[#f42525]/30 transition-all duration-300 group" />
                    ))}
                </AnimatedContainer>
            </div>
        </section>
    );
}

type ViewAnimationProps = {
    delay?: number;
    className?: React.ComponentProps<typeof motion.div>['className'];
    children: React.ReactNode;
};

function AnimatedContainer({ className, delay = 0.1, children }: ViewAnimationProps) {
    const shouldReduceMotion = useReducedMotion();

    if (shouldReduceMotion) {
        return children;
    }

    return (
        <motion.div
            initial={{ filter: 'blur(4px)', translateY: -8, opacity: 0 }}
            whileInView={{ filter: 'blur(0px)', translateY: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay, duration: 0.8 }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
