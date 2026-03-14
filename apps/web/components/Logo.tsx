import Link from 'next/link'

interface LogoProps {
    className?: string
    iconSize?: string
    textSize?: string
    color?: string
}

export default function Logo({
    className = "",
    iconSize = "text-xl",
    textSize = "text-xl",
    color = "text-white"
}: LogoProps) {
    return (
        <Link href="/" className={`flex items-center gap-2 group transition-all active:scale-95 ${className}`}>
            <span className={`material-icons ${color} ${iconSize} group-hover:rotate-12 transition-transform`}>
                layers
            </span>
            <span className={`font-bold font-outfit ${textSize} ${color} tracking-tight`}>
                AVAXVERSE
            </span>
        </Link>
    )
}
