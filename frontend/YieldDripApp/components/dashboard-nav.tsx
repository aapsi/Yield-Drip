'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  Activity, 
  Settings,
  Plus,
  Wallet
} from 'lucide-react'

export function DashboardNav() {
  const router = useRouter()
  const { isConnected } = useAccount()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render anything during SSR to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  if (!isConnected) {
    return null
  }

  return (
    <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-30">
      <div className="bg-[#1A1A1F]/80 backdrop-blur-md border border-[#2A2A2F] rounded-full px-4 py-2 shadow-lg">
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/yield-drip/strategies')}
            className="text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-full"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Strategies
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/yield-drip/yield-farming')}
            className="text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-full"
          >
            <Activity className="h-4 w-4 mr-2" />
            Yield
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/yield-drip/activity')}
            className="text-[#A6A6A6] hover:text-[#00D1FF] hover:bg-[#00D1FF]/10 rounded-full"
          >
            <Settings className="h-4 w-4 mr-2" />
            Activity
          </Button>
        </div>
      </div>
    </div>
  )
} 