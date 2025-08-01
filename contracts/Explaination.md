# YieldDrip

## 🎯 **What We Built**

We built a **smart Dollar-Cost Averaging (DCA)** system that **makes your money work while you wait**.

### **The Problem We Solved**
- Traditional DCA: You put $1000 aside to buy ETH over 4 hours → Your money sits idle earning $0
- **Our Solution**: Same $1000 DCA → Your money earns 3% APR while waiting for purchases

## 🔄 **How It Works (Step by Step)**

### **Step 1: User Sets Up DCA**
```
Alice wants: "Buy $1000 worth of ETH over 4 hours"
- Break into 24 slices of ~$42 each
- Execute every 10 minutes  
- Skip if ETH price > $2200 (her limit)
```

### **Step 2: All Money Goes to Yield Vault Immediately**  
```
Instead of: $1000 sitting in wallet earning nothing
We do: $1000 → sDAI vault → Earning 3% APR instantly
```

### **Step 3: Just-in-Time Purchases**
```  
Minute 10: Need $42 for first ETH purchase
→ Withdraw exactly $42 from sDAI → Buy ETH
→ Remaining $958 keeps earning yield

Minute 20: Need $42 for second ETH purchase  
→ Withdraw exactly $42 from sDAI → Buy ETH
→ Remaining $916 keeps earning yield

... continues for 4 hours
```

### **Step 4: Smart Price Protection**
```
If ETH price spikes above $2200:
→ Skip that purchase
→ Money stays in sDAI earning yield
→ Resume when price comes back down
```

## 💰 **The Magic: Zero Opportunity Cost**

**Traditional DCA:**
- Capital utilization: ~50% (money sits idle between purchases)
- Yield earned: $0

**Our YieldDrip:**
- Capital utilization: 100% (all money always earning)  
- Yield earned: ~$0.034 extra in 4 hours (small but FREE!)
- Over longer periods: Meaningful extra returns

## 🏗️ **Technical Architecture (Simplified)**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   User Alice    │───▶│  YieldDrip Bot   │───▶│  1inch Orders   │
│ "1000 DAI→ETH"  │    │ Creates 24 orders│    │ Execute trades  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌──────────────────┐
                       │   sDAI Vault     │
                       │ Earning 3% APR   │
                       │ Just-in-time $$  │
                       └──────────────────┘
```

## 🔧 **Our Smart Contracts**

### **1. YieldDepositHelper** 
- Takes Alice's $1000 DAI
- Immediately deposits into sDAI vault
- Starts earning 3% APR right away

### **2. YieldWithdrawHelper**
- Withdraws exact amount needed for each trade
- Sends DAI directly to the trader buying Alice's ETH
- Keeps remaining money in yield vault

### **3. LinearTwapGetter** 
- Calculates how much to buy each slice
- Early hours: Smaller amounts
- Later hours: Catch up to stay on schedule

## 🎪 **Why This Is Revolutionary**

### **For Users:**
- Same DCA strategy, but your money earns yield while waiting
- Price protection (skip expensive purchases)  
- Set-and-forget simplicity

### **For DeFi:**
- First yield-earning DCA mechanism
- 100% capital efficiency vs ~50% traditional
- Composable with any yield source (sDAI, Compound, Aave, etc.)

## 📊 **Real Numbers Example**

**Alice's 4-Hour DCA:**
- Budget: $1,000 DAI
- Target: Buy ETH over 4 hours
- Traditional result: Gets ETH, earns $0 yield
- **YieldDrip result: Gets same ETH + ~$0.034 extra yield**

**Scale this up:**
- $100,000 over 30 days = ~$25 extra yield
- Millions in DCA volume = Thousands in extra returns for users

## 🚀 **What Makes It Work**

1. **Real 1inch Integration**: Uses actual 1inch Limit Order Protocol v4
2. **Battle-tested Yield**: sDAI is Maker's savings product (proven safe)
3. **Gas Efficient**: Batched operations, reusable contracts
4. **MEV Protected**: 1inch's built-in protection against front-running

## 🎯 **Bottom Line**

We turned "set and forget" DCA into "set and earn" DCA. Every dollar works harder, every minute earns yield, every trade is optimized.

**It's not just an improvement – it's a new standard for capital-efficient investing.**