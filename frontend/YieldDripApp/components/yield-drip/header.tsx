"use client"

import { useRouter } from "next/navigation"
import { WalletConnect } from "@/components/wallet-connect"
import { NetworkSwitcher } from "@/components/network-switcher"
import { Button } from "@/components/ui/button"
import { HelpCircle, TrendingUp, Activity, Settings } from "lucide-react"

interface YieldDripHeaderProps {
  currentPage?: string
}

export function YieldDripHeader({ currentPage }: YieldDripHeaderProps) {
  const router = useRouter()

  const navItems = [
    { label: "Strategies", path: "/yield-drip/strategies", key: "strategies" },
    { label: "Yield Farming", path: "/yield-drip/yield-farming", key: "yield-farming" },
    { label: "Activity", path: "/yield-drip/activity", key: "activity" },
  ]

  const handleHelp = () => {
    router.push("/learn-more")
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#2A2A2F] backdrop-blur-md bg-[#0B0B0F]/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 font-mono">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => router.push("/")}>
              <span className="text-2xl">💧</span>
              <div>
                <h1 className="text-xl font-bold text-[#F2F2F2]">
                  Yield <span className="text-[#00FFB2]">Drip</span>
                </h1>
                <p className="text-xs text-[#A6A6A6] -mt-1 font-mono">Because your money should work while it waits</p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/yield-drip/strategies')}
              className={`rounded-full transition-all duration-300 ${
                currentPage === 'strategies' 
                  ? "text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/30" 
                  : "text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
              }`}
            >
              <TrendingUp className="h-4 w-4 mr-2" />
              Strategies
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/yield-drip/yield-farming')}
              className={`rounded-full transition-all duration-300 ${
                currentPage === 'yield-farming' 
                  ? "text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/30" 
                  : "text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
              }`}
            >
              <Activity className="h-4 w-4 mr-2" />
              Yield
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/yield-drip/activity')}
              className={`rounded-full transition-all duration-300 ${
                currentPage === 'activity' 
                  ? "text-[#00D1FF] bg-[#00D1FF]/10 border-[#00D1FF]/30" 
                  : "text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10"
              }`}
            >
              <Settings className="h-4 w-4 mr-2" />
              Activity
            </Button>
          </nav>

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
