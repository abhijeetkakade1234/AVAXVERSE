import "./globals.css"
import { Web3Provider } from "@/components/Web3Provider"

export const metadata = {
  title: "AVAXVERSE",
  description: "Avalanche Operating Layer",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="font-display">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}