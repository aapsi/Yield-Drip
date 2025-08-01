'use client'

import { useState, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Wallet } from 'lucide-react'

export function WalletConnect() {
  const [mounted, setMounted] = useState(false)
  const { address, isConnected } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()

  useEffect(() => {
    setMounted(true)
  }, [])

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  // Show loading state during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <Button
        variant="primary"
        className="px-6 py-2 rounded-full font-medium transition-all duration-300"
        disabled
      >
        <Wallet className="mr-2 h-4 w-4" />
        Connect Wallet
      </Button>
    )
  }

  if (isConnected) {
    return (
      <Button
        onClick={() => disconnect()}
        variant="outline"
        className="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105 border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 bg-[#1A1A1F]/40 backdrop-blur-md"
      >
        {address ? formatAddress(address) : "Connected"}
      </Button>
    )
  }

  return (
    <Button
      onClick={() => connect({ connector: connectors[0] })}
      variant="primary"
      className="px-6 py-2 rounded-full font-medium transition-all duration-300 hover:scale-105"
      disabled={isPending}
    >
      <Wallet className="mr-2 h-4 w-4" />
      {isPending ? 'Connecting...' : 'Connect Wallet'}
    </Button>
  )
} 