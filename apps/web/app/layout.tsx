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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
      </head>
      <body className="font-display">
        <Web3Provider>
          {children}
        </Web3Provider>
      </body>
    </html>
  )
}