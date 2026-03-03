import {
    IconUsers,
    IconShieldLock,
    IconAward,
    IconChartBar,
    IconCurrencyDollar,
    IconBolt,
    IconRocket,
    IconLink
} from "@tabler/icons-react";
import { FeaturesSectionWithHoverEffects } from "@/components/ui/feature-section-with-hover-effects";
import { cn } from "@/lib/utils";

export function FeaturesSection() {
    const avaxFeatures = [
        {
            title: 'Sovereign Identity',
            description: 'Your wallet is your passport. Verifiable credentials that belong to you, not a database.',
            icon: <IconUsers stroke={1.5} />,
        },
        {
            title: 'Atomic Escrow',
            description: 'Smart contracts act as neutral arbiters. Payment is released only when milestones are verified.',
            icon: <IconShieldLock stroke={1.5} />,
        },
        {
            title: 'Proof of Reputation',
            description: 'Earn non-transferable badges for every successful mission. Your history is your capital.',
            icon: <IconAward stroke={1.5} />,
        },
        {
            title: 'On-Chain Governance',
            description: 'The protocol is governed by the users. Propose, vote, and evolve the ecosystem together.',
            icon: <IconChartBar stroke={1.5} />,
        },
        {
            title: 'Trustless Payments',
            description: 'Direct peer-to-peer value transfer without intermediaries or hidden fees.',
            icon: <IconCurrencyDollar stroke={1.5} />,
        },
        {
            title: 'Hyper-Secure Speed',
            description: 'Leveraging Avalanche\'s sub-second finality for near-instant transaction settlement.',
            icon: <IconBolt stroke={1.5} />,
        },
        {
            title: 'DAO Incubation',
            description: 'Tools to launch and scale your own decentralized autonomous organization effortlessly.',
            icon: <IconRocket stroke={1.5} />,
        },
        {
            title: 'Universal Connectivity',
            description: 'Cross-chain interoperability to connect with the broader Web3 ecosystem seamlessly.',
            icon: <IconLink stroke={1.5} />,
        },
    ]

    return (
        <section className="relative py-24 px-6 md:px-12 w-full flex flex-col items-center bg-black">
            <div className="max-w-7xl w-full relative z-10">
                <div className="flex flex-col items-center mb-10 text-center px-4">
                    <h2 className="text-4xl md:text-7xl font-bold mb-0 text-white tracking-tighter">
                        A NEW ERA OF <span className="text-[#E84142]">TRUST.</span>
                    </h2>
                </div>
                <div className="h-12 md:h-16" />

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 relative z-10 border border-white/5 rounded-xl overflow-hidden">
                    {avaxFeatures.map((feature, index) => (
                        <Feature key={feature.title} {...feature} index={index} />
                    ))}
                </div>
                <div className="h-12 md:h-8" />
            </div>
        </section>
    )
}

const Feature = ({
    title,
    description,
    icon,
    index,
}: {
    title: string;
    description: string;
    icon: React.ReactNode;
    index: number;
}) => {
    return (
        <div
            className={cn(
                "flex flex-col lg:border-r py-12 relative group/feature border-white/5",
                (index === 0 || index === 4) && "lg:border-l border-white/5",
                index < 4 && "lg:border-b border-white/5"
            )}
        >
            {index < 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-t from-[#E84142]/5 to-transparent pointer-events-none" />
            )}
            {index >= 4 && (
                <div className="opacity-0 group-hover/feature:opacity-100 transition duration-300 absolute inset-0 h-full w-full bg-gradient-to-b from-[#E84142]/5 to-transparent pointer-events-none" />
            )}

            <div className="mb-6 relative z-10 px-10 text-[#E84142]">
                <div className="group-hover/feature:scale-110 group-hover/feature:translate-x-2 transition-transform duration-300 w-fit">
                    {icon}
                </div>
            </div>

            <div className="text-xl font-semibold mb-3 relative z-10 px-10">
                <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-10 w-1 rounded-tr-full rounded-br-full bg-white/10 group-hover/feature:bg-[#E84142] transition-all duration-300 origin-center" />
                <span className="group-hover/feature:translate-x-2 transition duration-300 inline-block text-white/90">
                    {title}
                </span>
            </div>

            <p className="text-sm text-white/40 group-hover/feature:text-white/60 max-w-xs relative z-10 px-10 leading-relaxed transition-colors duration-300">
                {description}
            </p>
        </div>
    );
};
