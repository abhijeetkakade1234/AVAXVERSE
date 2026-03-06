import "./globals.css"
import { Web3Provider } from "@/components/Web3Provider"
import OnboardingRedirect from "@/components/OnboardingRedirect"
import { SnackbarProvider } from "@/context/SnackbarContext"

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
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#7B61FF" />
      </head>
      <body className="font-display">
        <Web3Provider>
          <SnackbarProvider>
            <OnboardingRedirect />
            {children}
          </SnackbarProvider>
        </Web3Provider>
      </body>
    </html>
  )
}