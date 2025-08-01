"use client"

import { WalletConnect } from "@/components/wallet-connect"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import { useRouter } from "next/navigation"

export function Header() {
  const router = useRouter()

  const handleHelp = () => {
    router.push("/learn-more")
  }

  return (
    <header className="relative z-20 border-b border-[#2A2A2F] backdrop-blur-md bg-[#0B0B0F]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <span className="text-2xl">💧</span>
              <div>
                <h1 className="text-xl font-bold text-[#F2F2F2]">
                  Yield <span className="text-[#00FFB2]">Drip</span>
                </h1>
                <p className="text-xs text-[#A6A6A6] -mt-1 font-mono">Because your money should work while it waits</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Button
              onClick={handleHelp}
              variant="ghost"
              className="text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-full"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help
            </Button>
            <NetworkSwitcher />
            <WalletConnect />
          </div>
        </div>
      </div>
    </header>
  )
}
