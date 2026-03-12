import { ACTIVE_CHAIN } from '@/lib/config'

export function getDeliverableHref(value: string) {
    const v = value.trim()
    if (!v) return null
    if (/^https?:\/\//i.test(v)) return v
    if (/^ipfs:\/\//i.test(v)) return `https://ipfs.io/ipfs/${v.replace(/^ipfs:\/\//i, '')}`
    if (/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/.test(v) || /^bafy[a-z0-9]{20,}$/i.test(v)) return `https://ipfs.io/ipfs/${v}`
    if (/^0x([A-Fa-f0-9]{64})$/.test(v)) {
        const explorer = ACTIVE_CHAIN.blockExplorers?.default?.url || 'https://snowtrace.io'
        return `${explorer}/tx/${v}`
    }
    return null
}

export function shortAddr(addr: string) {
    if (!addr || addr.length < 12) return addr
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`
}
