import { useState, useEffect, useCallback } from 'react';
import { useAccount, useWalletClient } from 'wagmi';
import { ethers } from 'ethers';
import { yieldDrip1inch, type DCAStrategy, type OrderData } from '@/lib/1inch-integration';
import { mockYieldDrip1inch } from '@/lib/1inch/mock-integration';

export interface Use1inchIntegrationReturn {
  // State
  isInitialized: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  initialize: () => Promise<void>;
  createStrategy: (strategy: Omit<DCAStrategy, 'id' | 'status'>) => Promise<{
    strategyId: string;
    orders: OrderData[];
  } | null>;
  checkOrderPredicate: (orderData: string) => Promise<boolean>;
  executeOrder: (orderData: string, signature: string) => Promise<{
    success: boolean;
    txHash?: string;
    error?: string;
  }>;
  getOrderStatus: (orderHash: string) => Promise<'pending' | 'filled' | 'cancelled'>;
  getYieldInfo: (strategyId: string) => Promise<{
    totalDeposited: string;
    totalWithdrawn: string;
    currentYield: string;
    yieldRate: string;
  }>;
  
  // Utility
  resetError: () => void;
}

export function use1inchIntegration(useMock: boolean = false): Use1inchIntegrationReturn {
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Choose integration based on useMock flag
  const integration = useMock ? mockYieldDrip1inch : yieldDrip1inch;

  // Initialize the integration when wallet client is available
  const initialize = useCallback(async () => {
    if (!walletClient || !address) {
      setError('Wallet not connected');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      if (useMock) {
        // For mock integration, we don't need a real signer
        await integration.initialize({} as ethers.Signer);
      } else {
        // Create a signer from wallet client for real integration
        const signer = await walletClient.getSigner();
        await integration.initialize(signer);
      }
      
      setIsInitialized(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize 1inch integration');
      setIsInitialized(false);
    } finally {
      setIsLoading(false);
    }
  }, [walletClient, address, integration, useMock]);

  // Auto-initialize when wallet client becomes available
  useEffect(() => {
    if (walletClient && address && !isInitialized && !isLoading) {
      initialize();
    }
  }, [walletClient, address, isInitialized, isLoading, initialize]);

  const createStrategy = useCallback(async (strategy: Omit<DCAStrategy, 'id' | 'status'>) => {
    if (!isInitialized) {
      setError('1inch integration not initialized');
      return null;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await integration.createDCAStrategy(strategy);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create strategy');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, integration]);

  const checkOrderPredicate = useCallback(async (order: any): Promise<boolean> => {
    if (!isInitialized) {
      setError('1inch integration not initialized');
      return false;
    }

    try {
      setError(null);
      return await integration.checkOrderPredicate(order);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check order predicate');
      return false;
    }
  }, [isInitialized, integration]);

  const executeOrder = useCallback(async (order: any, signature: string) => {
    if (!isInitialized) {
      setError('1inch integration not initialized');
      return { success: false, error: 'Integration not initialized' };
    }

    try {
      setIsLoading(true);
      setError(null);
      
      const result = await integration.executeOrder(order, signature);
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute order';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized, integration]);

  const getOrderStatus = useCallback(async (orderHash: string): Promise<'pending' | 'filled' | 'cancelled'> => {
    if (!isInitialized) {
      setError('1inch integration not initialized');
      return 'pending';
    }

    try {
      setError(null);
      return await integration.getOrderStatus(orderHash);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get order status');
      return 'pending';
    }
  }, [isInitialized, integration]);

  const getYieldInfo = useCallback(async (strategyId: string) => {
    if (!isInitialized) {
      setError('1inch integration not initialized');
      return {
        totalDeposited: '0',
        totalWithdrawn: '0',
        currentYield: '0',
        yieldRate: '0'
      };
    }

    try {
      setError(null);
      return await integration.getYieldInfo(strategyId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get yield info');
      return {
        totalDeposited: '0',
        totalWithdrawn: '0',
        currentYield: '0',
        yieldRate: '0'
      };
    }
  }, [isInitialized, integration]);

  const resetError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isInitialized,
    isLoading,
    error,
    initialize,
    createStrategy,
    checkOrderPredicate,
    executeOrder,
    getOrderStatus,
    getYieldInfo,
    resetError
  };
} 