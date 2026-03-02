import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Web3Provider } from '@/components/Web3Provider'
import { Navbar } from '@/components/Navbar'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

export const metadata: Metadata = {
  title: 'AVAXVERSE – Avalanche Web3 Super App',
  description:
    'A unified on-chain operating layer for identity, freelance work, and governance on Avalanche.',
  keywords: ['Avalanche', 'Web3', 'DeFi', 'Freelance', 'DAO', 'Identity'],
  openGraph: {
    title: 'AVAXVERSE',
    description: 'Work, earn, and govern on-chain on Avalanche.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-gray-950 text-white antialiased">
        <Web3Provider>
          <Navbar />
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}
