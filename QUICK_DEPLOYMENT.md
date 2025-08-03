# 🚀 QUICK DEPLOYMENT FOR SUBMISSION

## 1. Deploy Contracts (5 minutes)

```bash
cd contracts

# Set your private key
echo "PRIVATE_KEY=your_private_key_here" > .env
echo "NETWORK=sepolia" >> .env

# Deploy all contracts
forge script script/DeployLOP.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_INFURA_KEY --broadcast --verify
```

## 2. Update Frontend Environment (2 minutes)

Create `.env.local` in `frontend/YieldDripApp/`:

```env
# Copy the addresses from deployment output
NEXT_PUBLIC_DAI_ADDRESS=0x...
NEXT_PUBLIC_WETH_ADDRESS=0x...
NEXT_PUBLIC_YIELD_DEPOSIT_HELPER=0x...
NEXT_PUBLIC_YIELD_WITHDRAW_HELPER=0x...
NEXT_PUBLIC_LINEAR_TWAP_GETTER=0x...
NEXT_PUBLIC_MOCK_ERC4626_YIELD=0x...
NEXT_PUBLIC_LIMIT_ORDER_PROTOCOL=0x1111111254EEB25477B68fb85Ed929f73A960582
```

## 3. Start Frontend

```bash
cd frontend/YieldDripApp
npm run dev
```

## 4. Test the Real System

1. Connect wallet
2. Go to `/yield-drip/strategies`
3. Create a strategy
4. Verify orders are created and signed

## 🎯 SUBMISSION READY FEATURES:

✅ **Real 1inch SDK Integration**
✅ **Smart Contract Deployment**
✅ **DCA Strategy Creation**
✅ **Order Signing & Management**
✅ **Yield Tracking**
✅ **Modern UI/UX**

## 📝 SUBMISSION CHECKLIST:

- [ ] Contracts deployed on Sepolia
- [ ] Frontend environment configured
- [ ] Strategy creation working
- [ ] Order signing working
- [ ] UI responsive and modern
- [ ] Demo video recorded
- [ ] README updated
- [ ] Devpost submission ready

## 🚨 URGENT: If you need the 1inch LOP contract deployed:

The deployment script assumes you're using the official 1inch LOP. If you need to deploy your own:

```bash
# Deploy 1inch LOP first, then update the address in DeployLOP.s.sol
# Then run the deployment script
```

## 💡 DEMO SCRIPT:

1. "Connect wallet" - Show wallet connection
2. "Create strategy" - Show DCA strategy creation
3. "Sign orders" - Show EIP-712 signing
4. "Track yield" - Show yield accumulation
5. "Execute orders" - Show order execution

**TOTAL TIME: ~10 minutes to get everything working!** 