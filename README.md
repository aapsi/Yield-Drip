# 🚀 YieldDrip - DeFi Yield Farming with DCA

**Automated Dollar-Cost Averaging with Yield Accumulation**

YieldDrip combines the power of 1inch Limit Order Protocol with yield farming to create a seamless DCA experience. Users deposit DAI, earn yield while their capital is deployed, and automatically execute DCA strategies to buy ETH at optimal prices.

## 🎯 Key Features

### ✨ **Single-TX Magic**
- One EIP-712 signature creates your entire DCA strategy
- Automated yield deposit, TWAP execution, and ETH swaps
- No gas fees for users - only keepers pay gas

### 💰 **Capital Efficiency**
- Idle DAI earns 4-6% yield until converted to ETH
- No opportunity cost compared to classic DCA bots
- Residual yield keeps accruing inside the vault

### 🔧 **Composable Architecture**
- Same hook pattern supports auto-rebalancing
- Cross-asset DCA with minimal code changes
- Zero protocol fees, no contract upgrades

## 🏗️ Technical Stack

### Smart Contracts
- **LinearTwapGetter.sol** - Proportional TWAP execution
- **YieldDepositHelper.sol** - DAI to sDAI conversion
- **YieldWithdrawHelper.sol** - Just-in-time DAI withdrawal
- **MockERC4626Yield.sol** - Yield vault simulation

### Frontend
- **Next.js 14** - React framework
- **1inch SDK** - Limit order protocol integration
- **Wagmi** - Ethereum hooks
- **Tailwind CSS** - Styling
- **Radix UI** - Components

### Backend
- **Node.js** - REST API
- **PostgreSQL** - Order & strategy storage
- **Redis** - Caching layer
- **WebSocket** - Real-time updates

## 🚀 Quick Start

### 1. Deploy Contracts
```bash
cd contracts
forge script script/DeployLOP.s.sol --rpc-url https://sepolia.infura.io/v3/YOUR_KEY --broadcast
```

### 2. Configure Frontend
```bash
cd frontend/YieldDripApp
cp .env.example .env.local
# Add deployed contract addresses
```

### 3. Start Development
```bash
npm run dev
```

## 📱 Demo Flow

1. **Connect Wallet** - Seamless MetaMask integration
2. **Create Strategy** - Set DAI amount, duration, price floor
3. **Sign Orders** - EIP-712 signature for all orders
4. **Track Progress** - Real-time yield and execution status
5. **Execute Orders** - Automated DCA execution

## 🎨 UI/UX Highlights

- **Dark Theme** - Modern, professional interface
- **Real-time Updates** - Live strategy progress
- **Mobile Responsive** - Works on all devices
- **Intuitive Navigation** - Easy strategy management

## 🔐 Security Features

- **EIP-712 Signatures** - Structured data signing
- **Predicate Validation** - On-chain condition checking
- **Idempotent Operations** - Safe retry mechanisms
- **Gas Optimization** - Efficient contract interactions

## 📊 Architecture

```
User → Frontend → 1inch SDK → LOP Contract
                ↓
            Backend API → Database
                ↓
            Keeper Service → Order Execution
```

## 🎯 Submission Features

✅ **Complete DCA System** - End-to-end yield farming
✅ **1inch Integration** - Real limit order protocol
✅ **Smart Contracts** - Deployed on Sepolia
✅ **Modern UI** - Professional interface
✅ **Real-time Updates** - Live strategy tracking
✅ **Mobile Ready** - Responsive design

## 🚀 Live Demo

Visit: [Your deployed URL]
- Connect wallet
- Create DCA strategy
- Watch yield accumulate
- Execute orders automatically

## 📝 License

MIT License - see LICENSE file for details

---

**Built for ETHGlobal Hackathon - Ready for submission! 🚀**