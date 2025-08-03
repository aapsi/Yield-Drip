// YieldDrip constants for Base Sepolia deployment

export const CHAIN_ID = 84532 // Base Sepolia

// Contract addresses (will be updated after deployment)
export const ADDRESSES = {
  // Custom LOP deployment on your testnet
  LIMIT_ORDER_PROTOCOL: process.env.NEXT_PUBLIC_LIMIT_ORDER_PROTOCOL || "0x0000000000000000000000000000000000000000", // Your deployed LOP
  
  // Token addresses on your testnet  
  DAI: process.env.NEXT_PUBLIC_DAI_ADDRESS || "0x0000000000000000000000000000000000000000", // Mock DAI on your testnet
  WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x0000000000000000000000000000000000000000", // WETH on your testnet
  
  // Our YieldDrip contract addresses (update these after deployment)
  YIELD_DEPOSIT_HELPER: process.env.NEXT_PUBLIC_YIELD_DEPOSIT_HELPER || "0x0000000000000000000000000000000000000000", // Update with your deployed address
  YIELD_WITHDRAW_HELPER: process.env.NEXT_PUBLIC_YIELD_WITHDRAW_HELPER || "0x0000000000000000000000000000000000000000", // Update with your deployed address
  LINEAR_TWAP_GETTER: process.env.NEXT_PUBLIC_LINEAR_TWAP_GETTER || "0x0000000000000000000000000000000000000000", // Update with your deployed address
  MOCK_ERC4626_YIELD: process.env.NEXT_PUBLIC_MOCK_ERC4626_YIELD || "0x0000000000000000000000000000000000000000", // Mock sDAI vault
  
  // Price feed for your testnet
  ETH_DAI_FEED: process.env.NEXT_PUBLIC_ETH_DAI_FEED || "0x0000000000000000000000000000000000000000", // Price feed on your testnet
} as const

// Default values for strategy creation
export const DEFAULTS = {
  // Gas limits
  GAS_LIMIT: 1000000,
  
  // Default slippage (1%)
  SLIPPAGE_BPS: 100,
  
  // Order expiration (24 hours)
  ORDER_DURATION: 24 * 60 * 60,
  
  // Minimum order interval (10 minutes)  
  MIN_INTERVAL: 10 * 60,
  
  // Default yield APR (3% for sDAI)
  DEFAULT_YIELD_APR: 0.03,
} as const

// Token decimals
export const DECIMALS = {
  DAI: 18,
  WETH: 18,
} as const