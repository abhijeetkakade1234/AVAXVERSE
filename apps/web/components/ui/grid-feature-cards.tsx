'use client';

import { cn } from '@/lib/utils';
import React from 'react';

type FeatureType = {
    title: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
};

type FeatureCardPorps = React.ComponentProps<'div'> & {
    feature: FeatureType;
};

export function FeatureCard({ feature, className, ...props }: FeatureCardPorps) {
    const [p, setP] = React.useState<number[][]>([]);

    React.useEffect(() => {
        setP(genRandomPattern());
    }, []);

    return (
        <div className={cn('relative overflow-hidden p-10 md:p-12 pb-24 md:pb-32 min-h-[200px] md:min-h-[140px] rounded-2xl relative group', className)} {...props}>
            <div className="absolute inset-0 bg-[#f42525]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-2xl"></div>

            <div className="pointer-events-none absolute top-0 left-1/2 -mt-2 -ml-20 h-full w-full [mask-image:linear-gradient(white,transparent)]">
                <div className="from-white/5 to-transparent absolute inset-0 bg-gradient-to-r [mask-image:radial-gradient(farthest-side_at_top,white,transparent)] opacity-100">
                    <GridPattern
                        width={20}
                        height={20}
                        x="-12"
                        y="4"
                        squares={p}
                        className="fill-white/5 stroke-white/10 absolute inset-0 h-full w-full mix-blend-overlay"
                    />
                </div>
            </div>

            <div className="flex items-center gap-4 relative z-30">
                <feature.icon className="text-[#f42525] size-7 md:size-8" strokeWidth={1.5} aria-hidden />
                <h3 className="text-white text-base md:text-xl font-semibold tracking-tight">{feature.title}</h3>
            </div>
            <p className="text-slate-400 relative z-20 mt-6 text-sm md:text-base font-light leading-relaxed">
                {feature.description}
            </p>
        </div>

    );
}

function GridPattern({
    width,
    height,
    x,
    y,
    squares,
    ...props
}: React.ComponentProps<'svg'> & { width: number; height: number; x: string; y: string; squares?: number[][] }) {
    const patternId = React.useId();

    return (
        <svg aria-hidden="true" {...props}>
            <defs>
                <pattern id={patternId} width={width} height={height} patternUnits="userSpaceOnUse" x={x} y={y}>
                    <path d={`M.5 ${height}V.5H${width}`} fill="none" />
                </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${patternId})`} />
            {squares && (
                <svg x={x} y={y} className="overflow-visible">
                    {squares.map(([x, y], index) => (
                        <rect strokeWidth="0" key={index} width={width + 1} height={height + 1} x={x * width} y={y * height} />
                    ))}
                </svg>
            )}
        </svg>
    );
}

function genRandomPattern(length?: number): number[][] {
    length = length ?? 5;
    return Array.from({ length }, () => [
        Math.floor(Math.random() * 4) + 7, // random x between 7 and 10
        Math.floor(Math.random() * 6) + 1, // random y between 1 and 6
    ]);
}
