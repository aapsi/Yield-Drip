// TypeScript types for 1inch integration

import type { LimitOrder as SDKLimitOrder } from '@1inch/limit-order-sdk'

export interface YieldDripStrategy {
  // User preferences
  userAddress: string
  totalDAI: string // in wei
  targetETH: string // in wei
  duration: number // in seconds
  slices: number
  priceFloor?: string // max ETH price in USD (wei format)
  
  // Calculated values
  daiPerSlice: string // in wei
  ethPerSlice: string // in wei
  intervalSeconds: number
  startTime: number
  endTime: number
}

export interface SignedOrder {
  order: LimitOrder
  signature: string
  orderHash?: string
}

import type { LimitOrder } from '@1inch/limit-order-sdk'

export interface OrderSlice {
  sliceIndex: number
  executeAfter: number
  order: SDKLimitOrder
  signature?: string
  orderHash?: string
  status: 'pending' | 'signed' | 'submitted' | 'filled' | 'cancelled' | 'expired'
  txHash?: string
  fillTxHash?: string
  error?: string
}

export interface StrategyProgress {
  strategyId: string
  totalSlices: number
  completedSlices: number
  pendingSlices: number
  totalYieldEarned: string // in DAI wei
  estimatedYieldRemaining: string // in DAI wei
  nextExecutionTime?: number
  isComplete: boolean
  isPaused: boolean
}

export interface OrderCreationParams {
  strategy: YieldDripStrategy
  sliceIndex: number
  executeAfter: number
}

export interface ContractAddresses {
  limitOrderProtocol: string
  yieldDepositHelper: string
  yieldWithdrawHelper: string
  linearTwapGetter: string
  dai: string
  weth: string
}