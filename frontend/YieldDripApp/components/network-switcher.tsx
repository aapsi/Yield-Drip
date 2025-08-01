'use client'

import { useAccount } from 'wagmi'
import { Button } from '@/components/ui/button'
import { Network } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const SUPPORTED_CHAINS = [
  { id: 84532, name: 'Base Sepolia', icon: '🔵' },
]

export function NetworkSwitcher() {
  const { chain } = useAccount()

  const currentChain = SUPPORTED_CHAINS.find(c => c.id === chain?.id)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="px-3 py-1 rounded-full font-medium transition-all duration-300 border-[#00D1FF]/30 text-[#00D1FF] hover:bg-[#00D1FF]/10 hover:border-[#00D1FF]/50 bg-[#1A1A1F]/40 backdrop-blur-md"
        >
          <Network className="mr-1 h-3 w-3" />
          {currentChain ? currentChain.name : 'Base Sepolia'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48 bg-[#1A1A1F] border-[#2A2A2F]">
        {SUPPORTED_CHAINS.map((chainOption) => (
          <DropdownMenuItem
            key={chainOption.id}
            className="text-[#F2F2F2] hover:bg-[#00D1FF]/10 hover:text-[#00D1FF] cursor-pointer"
            disabled={chainOption.id === chain?.id}
          >
            <span className="mr-2">{chainOption.icon}</span>
            {chainOption.name}
            {chainOption.id === chain?.id && ' (current)'}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 