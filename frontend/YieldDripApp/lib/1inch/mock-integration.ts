import { ethers } from 'ethers';
import type { DCAStrategy, OrderData } from '../1inch-integration';

/**
 * Mock 1inch integration for testing without deployed contracts
 * This simulates the integration behavior for development
 */
export class MockYieldDrip1inchIntegration {
  private isInitialized = false;

  async initialize(signer: ethers.Signer) {
    console.log('Mock: Initializing 1inch integration');
    this.isInitialized = true;
  }

  async createDCAStrategy(strategy: Omit<DCAStrategy, 'id' | 'status'>): Promise<{
    strategyId: string;
    orders: OrderData[];
  }> {
    if (!this.isInitialized) {
      throw new Error('Mock: Integration not initialized');
    }

    console.log('Mock: Creating DCA strategy', strategy);

    // Generate mock strategy ID
    const strategyId = ethers.keccak256(
      ethers.toUtf8Bytes(`${strategy.name}-${Date.now()}`)
    );

    // Create mock orders
    const orders: OrderData[] = [];
    for (let i = 0; i < strategy.slicesCount; i++) {
      const orderHash = ethers.keccak256(
        ethers.toUtf8Bytes(`order-${strategyId}-${i}-${Date.now()}`)
      );

      orders.push({
        orderHash,
        order: {
          salt: ethers.keccak256(ethers.toUtf8Bytes(`salt-${i}`)),
          maker: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          taker: '0x0000000000000000000000000000000000000000',
          makerAsset: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
          takerAsset: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
          receiver: '0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6',
          makingAmount: ethers.parseEther((parseInt(strategy.totalDaiAmount) / strategy.slicesCount).toString()),
          takingAmount: 0n,
          thresholdAmount: 0n,
          target: '0x0000000000000000000000000000000000000000',
          predicate: '0x',
          permit: '0x',
          preInteraction: '0x',
          postInteraction: '0x',
          getter: '0x',
          extension: '0x'
        } as any,
        signature: `0x${'0'.repeat(130)}`, // Mock signature
        strategyId,
        sliceNumber: i,
        status: 'pending'
      });
    }

    console.log('Mock: Created strategy with orders', { strategyId, ordersCount: orders.length });

    return { strategyId, orders };
  }

  async checkOrderPredicate(order: any): Promise<boolean> {
    console.log('Mock: Checking order predicate');
    return true; // Mock: always return true
  }

  async executeOrder(order: any, signature: string): Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }> {
    console.log('Mock: Executing order');
    return {
      success: true,
      txHash: `0x${'0'.repeat(64)}` // Mock transaction hash
    };
  }

  async getOrderStatus(orderHash: string): Promise<'pending' | 'filled' | 'cancelled'> {
    console.log('Mock: Getting order status for', orderHash);
    return 'pending';
  }

  async getYieldInfo(strategyId: string) {
    console.log('Mock: Getting yield info for', strategyId);
    return {
      totalDeposited: '1000000000000000000000', // 1000 DAI
      totalWithdrawn: '500000000000000000000',  // 500 DAI
      currentYield: '25000000000000000000',     // 25 DAI yield
      yieldRate: '0.05' // 5% APR
    };
  }
}

// Export mock instance
export const mockYieldDrip1inch = new MockYieldDrip1inchIntegration(); 