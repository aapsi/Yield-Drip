'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { WagmiProvider, createConfig, http } from 'wagmi'
import { injected } from '@wagmi/connectors'

const config = createConfig({
  chains: [
    { 
      id: 84532, 
      name: 'Base Sepolia', 
      nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: {
        default: { http: ['https://sepolia.base.org'] }
      }
    }
  ],
  connectors: [
    injected(),
  ],
  transports: {
    84532: http(),
  },
})

const queryClient = new QueryClient()

export function WagmiConfigProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  )
} 