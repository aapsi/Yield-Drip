// React hook for YieldDrip order management using 1inch SDK

import { useState, useCallback, useMemo } from 'react'
import { useAccount, useWalletClient } from 'wagmi'
import { ethers } from 'ethers'
import { yieldDrip1inch, type DCAStrategy, type OrderData } from '@/lib/1inch-integration'
import type { 
  SignedOrder, 
  OrderSlice,
  ContractAddresses 
} from '@/lib/1inch/types'

interface UseYieldDripOrdersProps {
  contractAddresses?: Partial<ContractAddresses>
}

export function useYieldDripOrders({ contractAddresses }: UseYieldDripOrdersProps = {}) {
  const { address } = useAccount()
  const { data: walletClient } = useWalletClient()
  
  const [isCreatingOrders, setIsCreatingOrders] = useState(false)
  const [isSigningOrders, setIsSigningOrders] = useState(false)
  const [orderSlices, setOrderSlices] = useState<OrderSlice[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isInitialized, setIsInitialized] = useState(false)

  // Initialize 1inch integration
  const initializeIntegration = useCallback(async () => {
    if (!walletClient || !address) return
    
    try {
      // Create a signer from wallet client
      const signer = await walletClient.getSigner()
      await yieldDrip1inch.initialize(signer)
      setIsInitialized(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize')
    }
  }, [walletClient, address])

  // Auto-initialize when wallet client is available
  useMemo(() => {
    if (walletClient && address && !isInitialized) {
      initializeIntegration()
    }
  }, [walletClient, address, isInitialized, initializeIntegration])

  /**
   * Creates a complete YieldDrip strategy with all order slices
   */
  const createStrategy = useCallback(async (
    totalDAI: string,
    targetETH: string,
    durationHours: number,
    intervalMinutes: number = 10,
    priceFloor?: string
  ): Promise<OrderSlice[]> => {
    if (!address || !isInitialized) {
      throw new Error('Wallet not connected or 1inch integration not ready')
    }

    setIsCreatingOrders(true)
    setError(null)

    try {
      // Calculate timing
      const now = Math.floor(Date.now() / 1000)
      const endTime = now + (durationHours * 3600)
      const slicesCount = Math.floor((durationHours * 60) / intervalMinutes)

      const strategy: Omit<DCAStrategy, 'id' | 'status'> = {
        name: `DCA Strategy ${Date.now()}`,
        totalDaiAmount: totalDAI,
        periodHours: durationHours,
        slicesCount: slicesCount,
        priceFloorWei: priceFloor || ethers.parseEther("1500").toString(),
        startTime: now,
        endTime: endTime,
      }

      // Create strategy using 1inch integration
      const result = await yieldDrip1inch.createDCAStrategy(strategy)

      // Convert to OrderSlice format
      const slices: OrderSlice[] = result.orders.map((orderData, index) => ({
        sliceIndex: index,
        executeAfter: strategy.startTime + (index * (strategy.endTime - strategy.startTime) / strategy.slicesCount),
        order: orderData.order,
        signature: orderData.signature,
        orderHash: orderData.orderHash,
        status: 'pending'
      }))

      setOrderSlices(slices)
      return slices
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create strategy'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsCreatingOrders(false)
    }
  }, [address, isInitialized])

  /**
   * Signs all pending order slices
   */
  const signAllOrders = useCallback(async (): Promise<SignedOrder[]> => {
    if (!address || !isInitialized) {
      throw new Error('Wallet not connected or 1inch integration not ready')
    }

    const pendingSlices = orderSlices.filter(slice => slice.status === 'pending')
    if (pendingSlices.length === 0) {
      throw new Error('No pending orders to sign')
    }

    setIsSigningOrders(true)
    setError(null)

    try {
      const signedOrders: SignedOrder[] = []

      for (const slice of pendingSlices) {
        // Orders are already signed when created with the new 1inch integration
        const signedOrder: SignedOrder = {
          order: slice.order as any, // Type conversion needed
          signature: slice.signature || '',
          orderHash: slice.orderHash
        }

        signedOrders.push(signedOrder)

        // Update slice status
        slice.status = 'signed'
      }

      // Update state with signed orders
      setOrderSlices([...orderSlices])
      
      return signedOrders
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sign orders'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsSigningOrders(false)
    }
  }, [address, orderSlices, isInitialized])

  /**
   * Updates contract addresses (useful after deployment)
   */
  const updateContractAddresses = useCallback((newAddresses: Partial<ContractAddresses>) => {
    // This would update the 1inch integration addresses if needed
    console.log('Updating contract addresses:', newAddresses)
  }, [])

  /**
   * Gets the current strategy progress
   */
  const getStrategyProgress = useCallback(() => {
    if (orderSlices.length === 0) return null

    const completedSlices = orderSlices.filter(s => s.status === 'filled').length
    const pendingSlices = orderSlices.filter(s => s.status === 'pending' || s.status === 'signed').length
    
    const nextExecution = orderSlices
      .filter(s => s.status === 'signed' || s.status === 'pending')
      .sort((a, b) => a.executeAfter - b.executeAfter)[0]

    return {
      totalSlices: orderSlices.length,
      completedSlices,
      pendingSlices,
      nextExecutionTime: nextExecution?.executeAfter,
      isComplete: completedSlices === orderSlices.length,
      isPaused: false // TODO: Implement pause functionality
    }
  }, [orderSlices])

  /**
   * Clears all orders and resets state
   */
  const clearStrategy = useCallback(() => {
    setOrderSlices([])
    setError(null)
  }, [])

  return {
    // State
    orderSlices,
    isCreatingOrders,
    isSigningOrders,
    error,
    
    // Actions
    createStrategy,
    signAllOrders,
    updateContractAddresses,
    clearStrategy,
    
    // Computed
    strategyProgress: getStrategyProgress(),
    hasOrders: orderSlices.length > 0,
    isReady: address && contractAddresses?.limitOrderProtocol
  }
}