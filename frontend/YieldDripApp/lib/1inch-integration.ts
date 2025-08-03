import { 
  LimitOrder, 
  MakerTraits, 
  Address, 
  randBigInt
} from '@1inch/limit-order-sdk';
import { ethers } from 'ethers';
import { createCustomSDK } from './1inch/custom-sdk';

// Helper function to validate addresses
function isValidAddress(address: string): boolean {
  return ethers.isAddress(address) && address !== '0x0000000000000000000000000000000000000000';
}

// Contract addresses (update these with your deployed addresses)
const CONTRACT_ADDRESSES = {
  // Mainnet addresses (update for your target network)
  DAI: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
  WETH: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  SDAI: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
  LOP: '0x1111111254EEB25477B68fb85Ed929f73A960582',
  
  // Your deployed contract addresses (update these)
  YIELD_DEPOSIT_HELPER: '0x0000000000000000000000000000000000000000', // Update with your deployed address
  YIELD_WITHDRAW_HELPER: '0x0000000000000000000000000000000000000000', // Update with your deployed address
  LINEAR_TWAP_GETTER: '0x0000000000000000000000000000000000000000', // Update with your deployed address
  
  // Chainlink price feeds
  ETH_DAI_FEED: '0x773616E4d11A78F511299002da53A1B9E02518a7', // Mainnet ETH/DAI
} as const;

// Network configuration
const NETWORK_CONFIG = {
  chainId: 1, // Mainnet (change to 11155111 for Sepolia)
  rpcUrl: process.env.NEXT_PUBLIC_RPC_URL || 'https://eth.llamarpc.com',
} as const;

export interface DCAStrategy {
  id: string;
  name: string;
  totalDaiAmount: string;
  periodHours: number;
  slicesCount: number;
  priceFloorWei: string;
  startTime: number;
  endTime: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
}

export interface OrderData {
  orderHash: string;
  order: LimitOrder;
  signature: string;
  strategyId: string;
  sliceNumber: number;
  status: 'pending' | 'filled' | 'cancelled';
}

export interface OrderExecution {
  orderHash: string;
  executionHash: string;
  daiAmount: string;
  ethAmount: string;
  executedAt: number;
}

export class YieldDrip1inchIntegration {
  private sdk: any; // Custom SDK
  private signer: ethers.Signer | null = null;
  private provider: ethers.Provider;

  constructor() {
    this.provider = new ethers.JsonRpcProvider(NETWORK_CONFIG.rpcUrl);
    this.sdk = createCustomSDK(this.provider, NETWORK_CONFIG.chainId);
  }

  /**
   * Initialize the integration with a wallet signer
   */
  async initialize(signer: ethers.Signer) {
    this.signer = signer;
  }

  /**
   * Create a complete DCA strategy with multiple orders
   */
  async createDCAStrategy(strategy: Omit<DCAStrategy, 'id' | 'status'>): Promise<{
    strategyId: string;
    orders: OrderData[];
  }> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    const strategyId = ethers.keccak256(
      ethers.toUtf8Bytes(`${strategy.name}-${Date.now()}`)
    );

    const orders: OrderData[] = [];
    const totalDaiWei = ethers.parseEther(strategy.totalDaiAmount);
    const daiPerSlice = totalDaiWei / BigInt(strategy.slicesCount);
    const timePerSlice = (strategy.endTime - strategy.startTime) / strategy.slicesCount;

    for (let i = 0; i < strategy.slicesCount; i++) {
      const sliceStartTime = strategy.startTime + (i * timePerSlice);
      const sliceEndTime = sliceStartTime + timePerSlice;

      const order = await this.buildYieldDripOrder({
        maker: await this.signer.getAddress(),
        totalDaiAmount: totalDaiWei,
        sliceNumber: i,
        sliceStartTime,
        sliceEndTime,
        priceFloorWei: strategy.priceFloorWei,
        daiPerSlice
      });

      orders.push({
        orderHash: order.orderHash,
        order: order.order,
        signature: order.signature,
        strategyId,
        sliceNumber: i,
        status: 'pending'
      });
    }

    return { strategyId, orders };
  }

  /**
   * Build a single YieldDrip order with yield integration
   */
  private async buildYieldDripOrder(params: {
    maker: string;
    totalDaiAmount: bigint;
    sliceNumber: number;
    sliceStartTime: number;
    sliceEndTime: number;
    priceFloorWei: string;
    daiPerSlice: bigint;
  }): Promise<{
    orderHash: string;
    order: LimitOrder;
    signature: string;
  }> {
    const {
      maker,
      totalDaiAmount,
      sliceNumber,
      sliceStartTime,
      sliceEndTime,
      priceFloorWei,
      daiPerSlice
    } = params;

    // Generate unique salt and nonce
    const salt = this.generateSalt(maker, sliceNumber);
    const nonce = randBigInt(BigInt((1 << 48) - 1));
    const expiresIn = BigInt(24 * 60 * 60); // 24 hours
    const expiration = BigInt(Math.floor(Date.now() / 1000)) + expiresIn;

    // Build maker traits
    const makerTraits = MakerTraits.default()
      .withExpiration(expiration)
      .withNonce(nonce)
      .allowMultipleFills()
      .allowPartialFills();

    // Encode pre-interaction (deposit DAI into sDAI)
    const preInteractionData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['address', 'uint256'],
      [maker, totalDaiAmount]
    );

    const preInteraction = ethers.solidityPacked(
      ['address', 'bytes4', 'bytes'],
      [CONTRACT_ADDRESSES.YIELD_DEPOSIT_HELPER, '0x58ad1d3a', preInteractionData]
    );

    // Encode post-interaction (withdraw DAI for this slice)
    const postInteractionData = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'address'],
      [0, ethers.ZeroAddress]
    );

    const postInteraction = ethers.solidityPacked(
      ['address', 'bytes4', 'bytes'],
      [CONTRACT_ADDRESSES.YIELD_WITHDRAW_HELPER, '0x0dfe1681', postInteractionData]
    );

    // Encode extra data for LinearTwapGetter
    const extension = ethers.AbiCoder.defaultAbiCoder().encode(
      ['uint256', 'uint256', 'uint256', 'uint256'],
      [sliceStartTime, sliceEndTime, totalDaiAmount, daiPerSlice]
    );

    // Create order using SDK
    const order = await this.sdk.createOrder({
      makerAsset: new Address(CONTRACT_ADDRESSES.DAI),
      takerAsset: new Address(CONTRACT_ADDRESSES.WETH),
      makingAmount: daiPerSlice, // Amount for this slice
      takingAmount: 0n, // Will be calculated by getter
      maker: new Address(maker),
      salt,
      receiver: new Address(maker)
    }, makerTraits, {
      preInteraction,
      postInteraction,
      makingAmountGetter: new Address(CONTRACT_ADDRESSES.LINEAR_TWAP_GETTER),
      extension
    });

    // Sign the order
    const typedData = order.getTypedData();
    const signature = await this.signer!.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    );

    // Calculate order hash
    const orderHash = order.getOrderHash(NETWORK_CONFIG.chainId);

    return {
      orderHash,
      order,
      signature
    };
  }

  /**
   * Generate unique salt for order
   */
  private generateSalt(maker: string, sliceNumber: number): bigint {
    const hash = ethers.keccak256(
      ethers.toUtf8Bytes(`${maker}-${sliceNumber}-${Date.now()}`)
    );
    return BigInt(hash);
  }

  /**
   * Check if an order can be executed
   */
  async checkOrderPredicate(order: LimitOrder): Promise<boolean> {
    try {
      // Use SDK to check order validity
      const orderHash = order.getOrderHash(NETWORK_CONFIG.chainId);
      const orderInfo = await this.sdk.getOrderByHash(orderHash);
      return orderInfo && orderInfo.status === 'active';
    } catch (error) {
      console.error('Order check failed:', error);
      return false;
    }
  }

  /**
   * Execute an order (for keeper simulation)
   */
  async executeOrder(order: LimitOrder, signature: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    if (!this.signer) {
      throw new Error('Signer not initialized');
    }

    try {
      // Submit order using SDK
      await this.sdk.submitOrder(order, signature);
      
      return {
        success: true,
        txHash: order.getOrderHash(NETWORK_CONFIG.chainId)
      };
    } catch (error) {
      console.error('Order execution failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Get order status from blockchain
   */
  async getOrderStatus(orderHash: string): Promise<'pending' | 'filled' | 'cancelled'> {
    try {
      // Use SDK to get order status
      const orderInfo = await this.sdk.getOrderByHash(orderHash);
      
      if (!orderInfo) {
        return 'pending';
      }

      switch (orderInfo.status) {
        case 'filled':
          return 'filled';
        case 'cancelled':
          return 'cancelled';
        default:
          return 'pending';
      }
    } catch (error) {
      console.error('Error checking order status:', error);
      return 'pending';
    }
  }

  /**
   * Get yield information for a strategy
   */
  async getYieldInfo(strategyId: string): Promise<{
    totalDeposited: string;
    totalWithdrawn: string;
    currentYield: string;
    yieldRate: string;
  }> {
    // This would interact with your sDAI vault to get yield information
    // For now, returning mock data
    return {
      totalDeposited: '1000000000000000000000', // 1000 DAI
      totalWithdrawn: '500000000000000000000',  // 500 DAI
      currentYield: '25000000000000000000',     // 25 DAI yield
      yieldRate: '0.05' // 5% APR
    };
  }
}

// Export singleton instance
export const yieldDrip1inch = new YieldDrip1inchIntegration(); 