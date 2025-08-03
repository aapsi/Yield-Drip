// Single-TX Magic: YieldDrip order builder using 1inch LOP hooks

import {
  LimitOrder,
  MakerTraits,
  Address,
  Sdk,
  randBigInt,
  HttpProviderConnector
} from '@1inch/limit-order-sdk'
import { ethers } from 'ethers'
import { ADDRESSES } from './constants'
import type { 
  YieldDripStrategy, 
  ContractAddresses 
} from './types'

const UINT_40_MAX = (1n << 48n) - 1n

export class YieldDripOrderBuilder {
  private sdk: Sdk
  private addresses: ContractAddresses

  constructor(
    addresses?: Partial<ContractAddresses>, 
    authKey?: string,
    networkId: number = 84532 // Base Sepolia
  ) {
    // Initialize 1inch SDK
    this.sdk = new Sdk({
      authKey: authKey || '', // Will need actual auth key for production
      networkId,
      httpConnector: new HttpProviderConnector()
    })

    // Merge provided addresses with defaults
    this.addresses = {
      limitOrderProtocol: ADDRESSES.LIMIT_ORDER_PROTOCOL,
      yieldDepositHelper: ADDRESSES.YIELD_DEPOSIT_HELPER,
      yieldWithdrawHelper: ADDRESSES.YIELD_WITHDRAW_HELPER,  
      linearTwapGetter: ADDRESSES.LINEAR_TWAP_GETTER,
      dai: ADDRESSES.DAI,
      weth: ADDRESSES.WETH,
      ...addresses
    }
  }

  /**
   * Creates the SINGLE YieldDrip order with "Single-TX Magic"
   * User signs once, LOP handles everything: deposit, TWAP, withdrawals
   */
  async createYieldDripOrder(strategy: YieldDripStrategy): Promise<LimitOrder> {
    // Generate unique salt and nonce for this strategy
    const salt = this.generateSalt(strategy.userAddress, strategy.startTime)
    const nonce = randBigInt(UINT_40_MAX)
    
    // Build maker traits for the comprehensive order
    const makerTraits = MakerTraits.default()
      .withExpiration(BigInt(strategy.endTime))
      .withNonce(nonce)
      // CRITICAL: Allow multiple fills for TWAP execution
      .allowMultipleFills(true)
      // Allow partial fills for progressive execution
      .allowPartialFill(true)
      // Enable pre-interaction for sDAI deposit
      .enablePreInteraction()
      // Enable post-interaction for just-in-time withdrawal
      .enablePostInteraction()

    // Build pre-interaction: deposit ALL DAI into sDAI vault immediately
    const depositKey = this.generateDepositKey(strategy.userAddress, salt)
    const preInteraction = this.buildDepositInteraction(
      strategy.userAddress,
      strategy.totalDAI,
      depositKey
    )

    // Build post-interaction: just-in-time DAI withdrawal (LOP overrides amounts)
    const postInteraction = this.buildWithdrawInteraction()

    // Encode strategy parameters for LinearTwapGetter
    const twapParams = this.encodeTwapParams(strategy)

    // Create the SINGLE comprehensive order
    const order = await this.sdk.createOrder({
      makerAsset: new Address(this.addresses.dai),
      takerAsset: new Address(this.addresses.weth),
      makingAmount: BigInt(strategy.totalDAI), // Total 1000 DAI
      takingAmount: BigInt(strategy.targetETH), // Total 0.5 ETH target
      maker: new Address(strategy.userAddress),
      salt,
      receiver: new Address(strategy.userAddress)
    }, makerTraits, {
      preInteraction,
      postInteraction,
      // LinearTwapGetter calculates progressive release: 1/24, 2/24, 3/24...
      makingAmountGetter: this.addresses.linearTwapGetter,
      // Pass strategy timing to LinearTwapGetter
      extension: twapParams
    })

    return order
  }

  /**
   * Signs the YieldDrip order using EIP-712 (SINGLE signature)
   */
  async signOrder(order: LimitOrder, signer: ethers.Signer): Promise<string> {
    const typedData = order.getTypedData()
    
    const signature = await signer.signTypedData(
      typedData.domain,
      { Order: typedData.types.Order },
      typedData.message
    )
    
    return signature
  }

  /**
   * Submits the signed order to 1inch network
   */
  async submitOrder(order: LimitOrder, signature: string): Promise<void> {
    await this.sdk.submitOrder(order, signature)
  }

  /**
   * Builds pre-interaction: depositFromMaker(maker, amount, depositKey)
   */
  private buildDepositInteraction(
    maker: string, 
    totalDAI: string, 
    depositKey: string
  ): string {
    const iface = new ethers.Interface([
      "function depositFromMaker(address maker, uint256 amount, bytes32 depositKey)"
    ])
    
    const calldata = iface.encodeFunctionData("depositFromMaker", [
      maker,
      totalDAI,
      depositKey
    ])
    
    // Pack: YieldDepositHelper address + calldata
    return ethers.solidityPacked(
      ["address", "bytes"],
      [this.addresses.yieldDepositHelper, calldata]
    )
  }

  /**
   * Builds post-interaction: withdrawTo(amount, taker)
   * LOP will override both parameters at execution time
   */
  private buildWithdrawInteraction(): string {
    const iface = new ethers.Interface([
      "function withdrawTo(uint256 amountDAI, address taker)"
    ])
    
    const calldata = iface.encodeFunctionData("withdrawTo", [
      "0", // Placeholder - LOP calculates actual amount needed
      "0x0000000000000000000000000000000000000000" // Placeholder - LOP fills with taker
    ])
    
    // Pack: YieldWithdrawHelper address + calldata
    return ethers.solidityPacked(
      ["address", "bytes"],
      [this.addresses.yieldWithdrawHelper, calldata]
    )
  }

  /**
   * Encodes strategy parameters for LinearTwapGetter
   * Format: (start, end, makeBase, takeBase)
   */
  private encodeTwapParams(strategy: YieldDripStrategy): string {
    return ethers.AbiCoder.defaultAbiCoder().encode(
      ["uint256", "uint256", "uint256", "uint256"],
      [
        strategy.startTime,      // start timestamp
        strategy.endTime,        // end timestamp  
        strategy.totalDAI,       // makeBase (1000 DAI)
        strategy.targetETH       // takeBase (0.5 ETH)
      ]
    )
  }

  /**
   * Generates unique deposit key for idempotency
   */
  private generateDepositKey(maker: string, salt: bigint): string {
    return ethers.keccak256(
      ethers.AbiCoder.defaultAbiCoder().encode(
        ["address", "uint256"],
        [maker, salt.toString()]
      )
    )
  }

  /**
   * Generates unique salt for the strategy
   */
  private generateSalt(userAddress: string, startTime: number): bigint {
    const data = ethers.solidityPacked(
      ["address", "uint256", "uint256"],
      [userAddress, startTime, Math.floor(Date.now() / 1000)]
    )
    const hash = ethers.keccak256(data)
    return BigInt(hash)
  }

  /**
   * Calculates strategy parameters from user inputs
   */
  public static calculateStrategy(
    userAddress: string,
    totalDAI: string,
    targetETH: string, 
    durationHours: number,
    priceFloor?: string
  ): YieldDripStrategy {
    const duration = durationHours * 3600 // Convert to seconds
    const intervalSeconds = 600 // 10-minute intervals (not used in single order)
    const slices = Math.floor(duration / intervalSeconds) // For reference only
    
    const startTime = Math.floor(Date.now() / 1000) + 60 // Start in 1 minute
    const endTime = startTime + duration
    
    return {
      userAddress,
      totalDAI,
      targetETH,
      duration,
      slices,
      priceFloor,
      daiPerSlice: (BigInt(totalDAI) / BigInt(slices)).toString(), // For reference
      ethPerSlice: (BigInt(targetETH) / BigInt(slices)).toString(), // For reference
      intervalSeconds,
      startTime,
      endTime
    }
  }

  /**
   * Updates contract addresses after deployment
   */
  public updateAddresses(newAddresses: Partial<ContractAddresses>) {
    this.addresses = { ...this.addresses, ...newAddresses }
  }

  /**
   * Gets current contract addresses
   */
  public getAddresses(): ContractAddresses {
    return { ...this.addresses }
  }
}