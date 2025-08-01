import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { WagmiConfigProvider } from "@/components/providers/wagmi-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yield Drip - Because your money should work while it waits",
  description:
    "A yield-shielded TWAP accumulator that combines dollar-cost averaging with yield farming. Earn yield on idle DCA funds while your money works for you.",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <WagmiConfigProvider>
          {children}
        </WagmiConfigProvider>
      </body>
    </html>
  )
}
