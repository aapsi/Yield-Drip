#!/bin/bash

# YieldDrip Testnet Deployment Script

echo "🚀 Deploying YieldDrip contracts to Base Sepolia..."

# Check if .env exists
if [ ! -f .env ]; then
    echo "❌ .env file not found!"
    echo "Please create .env with your PRIVATE_KEY"
    echo "Example: echo 'PRIVATE_KEY=your_key_here' > .env"
    exit 1
fi

# Deploy contracts
echo "📦 Deploying contracts..."
forge script script/DeployLOP.s.sol \
    --rpc-url https://sepolia.base.org \
    --broadcast \
    --verify

echo "✅ Deployment complete!"
echo ""
echo "📋 Copy the contract addresses above to your frontend .env.local file"
echo "🌐 Then start your frontend: cd ../frontend/YieldDripApp && npm run dev" 