# YieldDrip Deployment Guide

## Overview

This guide helps you deploy YieldDrip with your own LOP (Limit Order Protocol) contract on your testnet, bypassing the need for the mainnet 1inch LOP.

## Prerequisites

1. **Foundry installed** - for contract deployment
2. **Testnet RPC URL** - for your chosen testnet
3. **Deployer private key** - with testnet ETH for gas
4. **Environment setup** - for contract addresses

## Step 1: Deploy Contracts

### 1.1 Set up environment variables

Create a `.env` file in the `contracts/` directory:

```bash
# Deployer private key (with testnet ETH)
PRIVATE_KEY=0x...

# Network configuration
NETWORK=sepolia  # or your testnet
RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Optional: Chain ID
CHAIN_ID=11155111  # Sepolia
```

### 1.2 Deploy all contracts

```bash
cd contracts/

# Deploy all contracts
forge script script/DeployLOP.s.sol:DeployYieldDrip \
  --rpc-url $RPC_URL \
  --broadcast \
  --verify
```

### 1.3 Save deployment addresses

The deployment script will output all contract addresses. Save these for the next step.

## Step 2: Configure Frontend

### 2.1 Update environment variables

Create a `.env.local` file in the `frontend/YieldDripApp/` directory:

```bash
# Contract addresses from deployment
NEXT_PUBLIC_DAI_ADDRESS=0x...  # From deployment
NEXT_PUBLIC_WETH_ADDRESS=0x... # From deployment
NEXT_PUBLIC_YIELD_DEPOSIT_HELPER=0x... # From deployment
NEXT_PUBLIC_YIELD_WITHDRAW_HELPER=0x... # From deployment
NEXT_PUBLIC_LINEAR_TWAP_GETTER=0x... # From deployment
NEXT_PUBLIC_MOCK_ERC4626_YIELD=0x... # From deployment

# Network configuration
NEXT_PUBLIC_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
NEXT_PUBLIC_CHAIN_ID=11155111

# Optional: 1inch auth key (not needed for custom deployment)
NEXT_PUBLIC_1INCH_AUTH_KEY=
```

### 2.2 Update constants

The frontend will automatically use the environment variables, but you can also update `frontend/YieldDripApp/lib/1inch/constants.ts` directly:

```typescript
export const ADDRESSES = {
  LIMIT_ORDER_PROTOCOL: process.env.NEXT_PUBLIC_LIMIT_ORDER_PROTOCOL || "0x...",
  DAI: process.env.NEXT_PUBLIC_DAI_ADDRESS || "0x...",
  WETH: process.env.NEXT_PUBLIC_WETH_ADDRESS || "0x...",
  // ... other addresses
} as const;
```

## Step 3: Test the Integration

### 3.1 Start the frontend

```bash
cd frontend/YieldDripApp/
npm run dev
```

### 3.2 Test the integration

1. Visit `http://localhost:3000/test-1inch`
2. Connect your wallet
3. Click "Run 1inch Integration Test"
4. Verify orders are created successfully

## Step 4: Deploy LOP Contract (Optional)

If you want to deploy your own LOP contract instead of using the mainnet one:

### 4.1 Get LOP contract

```bash
# Clone 1inch LOP contracts
git clone https://github.com/1inch/limit-order-protocol.git
cd limit-order-protocol
```

### 4.2 Deploy LOP

```bash
# Deploy using Foundry
forge create LimitOrderProtocol \
  --rpc-url $RPC_URL \
  --private-key $PRIVATE_KEY
```

### 4.3 Update addresses

Update your deployment script and frontend configuration with the new LOP address.

## Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │   Custom SDK    │    │   Your LOP      │
│                 │───▶│                 │───▶│   Contract      │
│ - React App     │    │ - Order Builder │    │ - Order Exec    │
│ - 1inch SDK     │    │ - Signing       │    │ - Yield Int.    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   YieldDrip     │    │   YieldDrip     │    │   YieldDrip     │
│   Contracts     │    │   Contracts     │    │   Contracts     │
│                 │    │                 │    │                 │
│ - DepositHelper │    │ - WithdrawHelper│    │ - LinearTwap    │
│ - Mock sDAI     │    │ - Mock Tokens   │    │ - Mock Vault    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Key Differences from Mainnet

1. **Custom LOP**: Uses your deployed LOP instead of mainnet 1inch
2. **Mock Tokens**: DAI and WETH are mock contracts for testing
3. **Mock Yield**: sDAI vault is a mock implementation
4. **Custom SDK**: Bypasses 1inch API, works directly with your contract

## Testing Checklist

- [ ] Contracts deploy successfully
- [ ] Frontend connects to testnet
- [ ] Wallet connection works
- [ ] Order creation succeeds
- [ ] Order signing works
- [ ] Order submission to contract works
- [ ] Yield integration functions properly

## Troubleshooting

### Common Issues

1. **"Contract not found"**: Check RPC URL and contract addresses
2. **"Insufficient gas"**: Ensure deployer has testnet ETH
3. **"Invalid signature"**: Check chain ID and contract addresses match
4. **"Order creation failed"**: Verify all contract addresses are correct

### Debug Commands

```bash
# Check contract deployment
forge verify-contract --chain-id 11155111

# Test contract interactions
forge test

# Check frontend logs
npm run dev
```

## Next Steps

1. **Backend Integration**: Connect to your backend for order management
2. **Keeper Service**: Implement automated order execution
3. **Real Tokens**: Replace mocks with real tokens on mainnet
4. **Production**: Deploy to mainnet with real contracts

## Support

For issues with:
- **Contract deployment**: Check Foundry documentation
- **Frontend integration**: Check browser console for errors
- **1inch SDK**: Refer to [1inch SDK docs](https://github.com/1inch/limit-order-sdk) 