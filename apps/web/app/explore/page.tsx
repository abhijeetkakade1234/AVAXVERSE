'use client'

import React, { useState, useEffect } from 'react'
import { useBlockNumber, usePublicClient } from 'wagmi'
import { formatUnits } from 'viem'
import { ACTIVE_CHAIN } from '@/lib/config'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'

export default function ExplorePage() {
    const publicClient = usePublicClient()
    const { data: blockNumber } = useBlockNumber({ watch: true })

    const [searchQuery, setSearchQuery] = useState('')

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (!searchQuery.trim()) return

        const baseUrl = ACTIVE_CHAIN.blockExplorers?.default.url ?? 'https://snowtrace.io'

        const q = searchQuery.trim()
        if (q.length === 66 && q.startsWith('0x')) {
            window.open(`${baseUrl}/tx/${q}`, '_blank')
        } else if (q.length === 42 && q.startsWith('0x')) {
            window.open(`${baseUrl}/address/${q}`, '_blank')
        } else {
            window.open(`${baseUrl}/search?q=${q}`, '_blank')
        }
    }

    const [stats, setStats] = useState({
        tps: 0,
        gas: "0",
    })

    // Known prominent Avalanche subnets with P-Chain subnet IDs and EVM RPC URLs
    const SUBNET_CONFIGS = [
        { id: 'c-chain', name: "C-Chain", type: "EVM Mainnet", rpcUrl: "https://api.avax.network/ext/bc/C/rpc", subnetId: "11111111111111111111111111111111LpoYY", url: "https://subnets.avax.network/c-chain" },
        { id: 'p-chain', name: "P-Chain", type: "Platform Layer", rpcUrl: null, subnetId: "11111111111111111111111111111111LpoYY", url: "https://subnets.avax.network/p-chain" },
        { id: 'x-chain', name: "X-Chain", type: "Exchange DAG", rpcUrl: null, subnetId: "11111111111111111111111111111111LpoYY", url: "https://subnets.avax.network/x-chain" },
        { id: 'dfk', name: "DFK Chain", type: "GameFi Subnet", rpcUrl: "https://subnets.avax.network/defi-kingdoms/dfk-chain/rpc", subnetId: "Vn3aX6hNRstj5VHHm63TCgPNaeGnRSqCYXQqemSqDd2TQH4qJ", url: "https://subnets.avax.network/defi-kingdoms" },
        { id: 'dexalot', name: "Dexalot", type: "DeFi Subnet", rpcUrl: "https://subnets.avax.network/dexalot/mainnet/rpc", subnetId: "28nrH5T2BMvNrWecFcV3mfccjs6axM1TVyqe79MCv2Mhs8koBh", url: "https://subnets.avax.network/dexalot" },
        { id: 'shrapnel', name: "Shrapnel", type: "GameFi Subnet", rpcUrl: "https://subnets.avax.network/shrapnel/mainnet/rpc", subnetId: "2LZp9ypK4SWm3fRxQbqG4PzAHBW7A5fBpqXjLNDpHRHepBQvN9", url: "https://subnets.avax.network/shrapnel" },
        { id: 'beam', name: "Beam", type: "GameFi Subnet", rpcUrl: "https://subnets.avax.network/beam/mainnet/rpc", subnetId: "EjYM2ZHLN4vabREQmMfqCWSYggFGM1JdQxVpWQFDsH3gXZ7t4", url: "https://subnets.avax.network/beam" },
        { id: 'fuji', name: "Fuji Testnet", type: "Public Testnet", rpcUrl: "https://api.avax-test.network/ext/bc/C/rpc", subnetId: null, url: "https://subnets.testnet.avax.network/c-chain" }
    ]

    const [subnets, setSubnets] = useState(SUBNET_CONFIGS.map(s => ({
        ...s,
        validators: 0,
        tps: 0,
        latency: 0,
        health: "100%",
        loadBars: [0, 0, 0, 0, 0, 0, 0],
        statusIcon: "hourglass_empty",
        statusColor: "text-primary",
        loadBalance: "SYNC",
        loadColor: "text-primary",
        btnText: "Connecting...",
        btnIcon: "sync",
        btnClass: "bg-primary/5 border border-primary/10 py-3 rounded-2xl font-bold text-sm text-[#4B5563] flex items-center justify-center gap-2",
        grayscaleBars: false,
        opacityClass: ""
    })))

    // Fetch real validator count from P-Chain for a subnetID
    const fetchValidatorCount = async (subnetId: string): Promise<number> => {
        try {
            const res = await fetch('https://api.avax.network/ext/bc/P', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'platform.getCurrentValidators', params: { subnetID: subnetId } }),
                signal: AbortSignal.timeout(4000)
            })
            const data = await res.json()
            return data.result?.validators?.length ?? 0
        } catch { return 0 }
    }

    // Fetch TPS from EVM RPC by checking tx count in latest block
    const fetchEvmTps = async (rpcUrl: string): Promise<number> => {
        try {
            const latestRes = await fetch(rpcUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_getBlockByNumber', params: ['latest', false] }), signal: AbortSignal.timeout(3000) })
            const latest = (await latestRes.json()).result
            const txCount = (latest?.transactions?.length ?? 0) as number
            // Avalanche blocks are ~2s apart; compute TPS as txCount / 2
            return Math.round(txCount / 2)
        } catch { return 0 }
    }

    // Real-time pinger: runs every 3s per subnet
    useEffect(() => {
        let mounted = true

        const pingSubnet = async (config: typeof SUBNET_CONFIGS[0]) => {
            const startTime = Date.now()
            let isUp = false
            let pingTime = 0
            let validators = 0
            let tps = 0

            // 1. Latency + Health: ping the EVM RPC (or P endpoint for platform chains)
            const pingUrl = config.rpcUrl ?? 'https://api.avax.network/ext/bc/P'
            try {
                const res = await fetch(pingUrl, {
                    method: 'POST',
                    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: config.rpcUrl ? 'eth_chainId' : 'platform.getBlockchainStatus', params: config.rpcUrl ? [] : { blockchainID: 'P' } }),
                    headers: { 'Content-Type': 'application/json' },
                    signal: AbortSignal.timeout(3000)
                })
                pingTime = Date.now() - startTime
                isUp = res.ok || res.status === 400 || res.status === 405
            } catch { isUp = false }

            // 2. Validators: query P-Chain (only for subnets with a known subnetId)
            if (config.subnetId) {
                validators = await fetchValidatorCount(config.subnetId)
            }

            // 3. TPS: compute from latest EVM block (only for EVM chains)
            if (config.rpcUrl && isUp) {
                tps = await fetchEvmTps(config.rpcUrl)
            }

            if (!mounted) return

            setSubnets(curr => curr.map(s => {
                if (s.id !== config.id) return s

                const jiggle = isUp ? Math.floor(Math.random() * 40) + (tps * 4) + 20 : 0
                const newBars = isUp ? [...(s.loadBars.slice(1, 7)), Math.min(jiggle, 100)] : [0, 0, 0, 0, 0, 0, 0]

                // Health: based on latency (< 100ms = 100%, < 300ms = 95%, else 90%)
                const health = !isUp ? "OFFLINE" : pingTime < 100 ? "100%" : pingTime < 300 ? "95%" : "90%"
                const loadBalance = !isUp ? "DOWN" : pingTime < 100 ? "OPTIMAL" : pingTime < 300 ? "MODERATE" : "HEAVY"

                return {
                    ...s,
                    latency: isUp ? pingTime : -1,
                    validators,
                    tps,
                    health,
                    loadBalance,
                    loadBars: newBars,
                    statusIcon: isUp ? "check_circle" : "error",
                    statusColor: isUp ? "text-green-500" : "text-red-500",
                    loadColor: !isUp ? "text-red-500" : pingTime > 300 ? "text-yellow-500" : "text-primary",
                    btnText: isUp ? "Open Diagnostics" : "Unresponsive",
                    btnIcon: isUp ? "open_in_new" : "warning",
                    btnClass: isUp
                        ? "bg-primary/10 border border-primary/20 py-3 rounded-2xl font-bold text-sm text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                        : "bg-red-500/10 border border-red-500/20 py-3 rounded-2xl font-bold text-sm text-red-500 cursor-not-allowed flex items-center justify-center gap-2",
                    grayscaleBars: !isUp
                }
            }))
        }

        const runAll = () => {
            SUBNET_CONFIGS.forEach(config => pingSubnet(config))
        }

        // Immediate ping on mount
        runAll()
        const pingInterval = setInterval(runAll, 5000)

        return () => {
            mounted = false
            clearInterval(pingInterval)
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Aggregate totals dynamically from live data
    const totalValidators = subnets.find(s => s.id === 'c-chain')?.validators ?? 0
    const activeSubnets = subnets.filter(s => s.latency !== -1 && s.latency !== 0).length

    // Fetch real-time gas price from the connected chain
    useEffect(() => {
        const fetchGasData = async () => {
            if (!blockNumber || !publicClient) return
            try {
                const gasPrice = await publicClient.getGasPrice()
                setStats(prev => ({
                    ...prev,
                    gas: parseFloat(formatUnits(gasPrice, 9)).toFixed(2)
                }))
            } catch (error) {
                console.error("Error fetching gas data:", error)
            }
        }
        fetchGasData()
    }, [blockNumber, publicClient])

    return (
        <div className="bg-[#C3BAF8] dark:bg-[#0F0E23] text-[#1F2937] dark:text-[#F3F4F6] min-h-screen antialiased flex flex-col transition-colors duration-300 bg-clouds bg-fixed">
            <Navbar />

            <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 space-y-8 mt-10">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
                            <span className="material-symbols-outlined text-sm">query_stats</span>
                            Subnet Fleet Intelligence
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight">
                            Global Subnet <span className="text-primary">Detailed Grid</span>
                        </h1>
                    </div>

                    <form onSubmit={handleSearch} className="w-full md:w-96 relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#4B5563] dark:text-[#9CA3AF]">search</span>
                        <input
                            className="bg-white/20 dark:bg-black/20 border border-white/40 dark:border-white/10 rounded-full px-6 py-2 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all w-full pl-12 text-sm"
                            placeholder="Inspect specific subnet ID or name..."
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="hidden">Search</button>
                    </form>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="glass-panel bg-white/40 dark:bg-[#1E1B4B]/40 border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-yellow-500/20 text-yellow-600 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">bolt</span>
                        </div>
                        <div>
                            <div className="text-lg font-black leading-tight">{stats.tps} TPS</div>
                            <div className="text-[10px] font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest">+12.4% avg</div>
                        </div>
                    </div>

                    <div className="glass-panel bg-white/40 dark:bg-[#1E1B4B]/40 border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">gas_meter</span>
                        </div>
                        <div>
                            <div className="text-lg font-black leading-tight">{stats.gas} nAVAX</div>
                            <div className="text-[10px] font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest">Base Fee</div>
                        </div>
                    </div>

                    <div className="glass-panel bg-white/40 dark:bg-[#1E1B4B]/40 border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">hub</span>
                        </div>
                        <div>
                            <div className="text-lg font-black leading-tight">{activeSubnets} Active</div>
                            <div className="text-[10px] font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest">Subnets</div>
                        </div>
                    </div>

                    <div className="glass-panel bg-white/40 dark:bg-[#1E1B4B]/40 border border-white/40 dark:border-white/10 rounded-2xl p-4 shadow-sm flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined">verified_user</span>
                        </div>
                        <div>
                            <div className="text-lg font-black leading-tight">{totalValidators.toLocaleString()} Nodes</div>
                            <div className="text-[10px] font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest">Validating</div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {subnets.map(subnet => (
                        <SubnetGridCard
                            key={subnet.id}
                            name={subnet.name}
                            type={subnet.type}
                            health={subnet.health}
                            statusIcon={subnet.statusIcon}
                            statusColor={subnet.statusColor}
                            latency={subnet.latency === -1 ? '--' : `${subnet.latency}ms`}
                            validators={subnet.validators}
                            tps={subnet.tps}
                            loadBalance={subnet.loadBalance}
                            loadColor={subnet.loadColor}
                            loadBars={subnet.loadBars}
                            url={subnet.url}
                            opacityClass={subnet.opacityClass ?? ''}
                            btnClass={subnet.btnClass}
                            btnText={subnet.btnText}
                            btnIcon={subnet.btnIcon}
                            grayscaleBars={subnet.grayscaleBars}
                        />
                    ))}
                </div>
            </main>

            <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 mb-20">
                <Footer />
            </div>

            <style jsx>{`
                .glass-panel {
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
                .bg-clouds {
                    background-image: radial-gradient(circle at 20% 30%, rgba(139, 130, 246, 0.15) 0%, transparent 40%),
                                      radial-gradient(circle at 80% 70%, rgba(232, 121, 249, 0.15) 0%, transparent 40%);
                }
            `}</style>
        </div>
    )
}

function SubnetGridCard({
    name, type, health, statusIcon, statusColor,
    latency, validators, tps = 0, loadBalance, loadColor,
    loadBars, url, opacityClass = "",
    btnClass = "bg-primary/10 border border-primary/20 py-3 rounded-2xl font-bold text-sm text-primary hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2",
    btnText = "Open Diagnostics", btnIcon = "open_in_new", grayscaleBars = false
}: {
    name: string; type: string; health: string; statusIcon: string; statusColor: string;
    latency: string; validators: number; tps: number; loadBalance: string; loadColor: string;
    loadBars: number[]; url: string; opacityClass?: string;
    btnClass?: string; btnText?: string; btnIcon?: string; grayscaleBars?: boolean;
}) {
    const isOffline = statusIcon === 'error';
    const isSyncing = statusIcon === 'hourglass_empty';
    const barBaseColor = (isOffline || grayscaleBars) ? 'bg-[#4B5563]/20' : 'bg-primary/30';
    const barPeakColor = isOffline ? 'bg-red-500' : 'bg-primary';
    const progressColor = isOffline ? 'bg-red-500' : isSyncing ? 'bg-primary/50' : 'bg-green-500';
    const healthWidth = (health === 'OFFLINE' || !health) ? '0%' : health;

    return (
        <div className={`glass-panel bg-white/40 dark:bg-[#1E1B4B]/40 border border-white/40 dark:border-white/10 rounded-3xl p-6 shadow-xl space-y-6 flex flex-col justify-between hover:scale-[1.02] transition-transform duration-300 ${opacityClass}`}>
            <div className="space-y-2">
                <div className="flex justify-between items-start">
                    <h3 className="text-2xl font-black">{name}</h3>
                    <span className={`material-symbols-outlined ${statusColor} ${isSyncing ? 'animate-spin' : isOffline ? 'animate-pulse' : ''}`}>{statusIcon}</span>
                </div>
                <p className="text-[10px] text-[#4B5563] dark:text-[#9CA3AF] uppercase tracking-widest font-bold">{type}</p>
            </div>

            <div className="space-y-4">
                <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10">
                    <div className="text-[10px] font-bold text-[#4B5563] dark:text-[#9CA3AF] uppercase mb-2">Health Index</div>
                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-2 bg-black/10 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor} rounded-full transition-all duration-700`} style={{ width: healthWidth }}></div>
                        </div>
                        <span className="text-sm font-bold">{health}</span>
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10 text-center">
                        <div className="text-[9px] font-bold text-[#4B5563] uppercase mb-1">Latency</div>
                        <div className={`text-sm font-black ${latency === '--' ? 'text-red-400 italic' : 'text-primary'}`}>{latency}</div>
                    </div>
                    <div className="p-3 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10 text-center">
                        <div className="text-[9px] font-bold text-[#4B5563] uppercase mb-1">Validators</div>
                        <div className={`text-sm font-black ${!validators ? 'text-[#4B5563]' : 'text-primary'}`}>{validators || '--'}</div>
                    </div>
                    <div className="p-3 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10 text-center">
                        <div className="text-[9px] font-bold text-[#4B5563] uppercase mb-1">TPS</div>
                        <div className={`text-sm font-black ${isOffline ? 'text-red-400' : 'text-green-400'}`}>{isOffline ? '--' : tps}</div>
                    </div>
                </div>

                <div className="p-4 bg-white/20 dark:bg-black/20 rounded-2xl border border-white/10">
                    <div className="flex justify-between items-center mb-3">
                        <div className="text-[10px] font-bold text-[#4B5563] uppercase">Load Balance</div>
                        <span className={`text-[10px] font-bold ${loadColor}`}>{loadBalance}</span>
                    </div>
                    <div className={`flex items-end gap-1 h-12 ${grayscaleBars ? 'grayscale opacity-50' : ''}`}>
                        {loadBars.map((height: number, i: number) => {
                            const isPeak = height >= 80 && !grayscaleBars;
                            return (
                                <div key={i} className={`flex-1 ${isPeak ? barPeakColor : barBaseColor} rounded-t-sm transition-all duration-500`} style={{ height: `${height}%` }}></div>
                            )
                        })}
                    </div>
                </div>
            </div>

            <a
                href={url && url.startsWith('https') ? url : undefined}
                target={url && url.startsWith('https') ? "_blank" : undefined}
                rel="noopener noreferrer"
                className={`w-full ${btnClass} cursor-pointer block text-center`}
                onClick={(e) => {
                    if (!url || !url.startsWith('https')) e.preventDefault();
                }}
            >
                <div className="flex items-center justify-center gap-2">
                    {btnText}
                    <span className="material-symbols-outlined text-sm">{btnIcon}</span>
                </div>
            </a>
        </div>
    )
}
