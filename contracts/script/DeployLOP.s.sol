// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Script.sol";
import "../src/UniswapV2Factory.sol";
import "../src/UniswapV2Router.sol";
import "../src/MockERC20.sol";
import "../src/MockERC4626Yield.sol";
import "../src/YieldDepositHelper.sol";
import "../src/YieldWithdrawHelper.sol";
import "../src/LinearTwapGetter.sol";

/**
 * @title YieldDrip Deployment Script
 * @notice Deploys all contracts needed for YieldDrip on your testnet
 */
contract DeployYieldDrip is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        vm.startBroadcast(deployer);

        console.log("Deploying YieldDrip contracts...");
        console.log("Deployer:", deployer);

        // 1. Deploy mock tokens
        console.log("\n1. Deploying mock tokens...");
        MockERC20 dai = new MockERC20("DAI", "DAI", 18);
        MockERC20 weth = new MockERC20("Wrapped Ether", "WETH", 18);
        
        console.log("DAI deployed at:", address(dai));
        console.log("WETH deployed at:", address(weth));

        // 2. Deploy mock yield vault
        console.log("\n2. Deploying mock yield vault...");
        MockERC4626Yield yieldVault = new MockERC4626Yield(dai, "Mock sDAI", "msDAI");
        console.log("Yield vault deployed at:", address(yieldVault));

        // 3. Deploy YieldDrip contracts
        console.log("\n3. Deploying YieldDrip contracts...");
        
        // Deploy LinearTwapGetter
        LinearTwapGetter twapGetter = new LinearTwapGetter();
        console.log("LinearTwapGetter deployed at:", address(twapGetter));

        // Deploy YieldDepositHelper
        YieldDepositHelper depositHelper = new YieldDepositHelper(
            address(dai),
            address(yieldVault),
            address(0x1111111254EEB25477B68fb85Ed929f73A960582) // LOP address (update for your deployment)
        );
        console.log("YieldDepositHelper deployed at:", address(depositHelper));

        // Deploy YieldWithdrawHelper
        YieldWithdrawHelper withdrawHelper = new YieldWithdrawHelper(
            address(yieldVault),
            address(0x1111111254EEB25477B68fb85Ed929f73A960582), // LOP address
            address(depositHelper)
        );
        console.log("YieldWithdrawHelper deployed at:", address(withdrawHelper));

        // Set withdraw helper in deposit helper
        depositHelper.setWithdrawHelper(address(withdrawHelper));

        // 4. Deploy Uniswap V2 (for testing)
        console.log("\n4. Deploying Uniswap V2 for testing...");
        UniswapV2Factory factory = new UniswapV2Factory(deployer);
        UniswapV2Router router = new UniswapV2Router(address(factory), address(weth));
        console.log("UniswapV2Factory deployed at:", address(factory));
        console.log("UniswapV2Router deployed at:", address(router));

        // 5. Create DAI/WETH pair and add liquidity
        console.log("\n5. Setting up DAI/WETH pair...");
        factory.createPair(address(dai), address(weth));
        address pair = factory.getPair(address(dai), address(weth));
        console.log("DAI/WETH pair created at:", pair);

        // Mint tokens to deployer
        dai.mint(deployer, 1000000 * 10**18); // 1M DAI
        weth.mint(deployer, 1000 * 10**18);   // 1000 WETH

        // Add liquidity to pair
        dai.approve(address(router), type(uint256).max);
        weth.approve(address(router), type(uint256).max);
        
        router.addLiquidity(
            address(dai),
            address(weth),
            100000 * 10**18, // 100k DAI
            50 * 10**18,     // 50 WETH
            0, 0,
            deployer,
            block.timestamp
        );

        vm.stopBroadcast();

        // 6. Print deployment summary
        console.log("\n" + string(50, "="));
        console.log("DEPLOYMENT SUMMARY");
        console.log(string(50, "="));
        console.log("Network:", vm.envString("NETWORK"));
        console.log("Deployer:", deployer);
        console.log("");
        console.log("Token Addresses:");
        console.log("  DAI:", address(dai));
        console.log("  WETH:", address(weth));
        console.log("");
        console.log("YieldDrip Contracts:");
        console.log("  LinearTwapGetter:", address(twapGetter));
        console.log("  YieldDepositHelper:", address(depositHelper));
        console.log("  YieldWithdrawHelper:", address(withdrawHelper));
        console.log("  MockERC4626Yield:", address(yieldVault));
        console.log("");
        console.log("Uniswap V2:");
        console.log("  Factory:", address(factory));
        console.log("  Router:", address(router));
        console.log("  DAI/WETH Pair:", pair);
        console.log("");
        console.log("Environment Variables for Frontend:");
        console.log("NEXT_PUBLIC_DAI_ADDRESS=" + address(dai));
        console.log("NEXT_PUBLIC_WETH_ADDRESS=" + address(weth));
        console.log("NEXT_PUBLIC_YIELD_DEPOSIT_HELPER=" + address(depositHelper));
        console.log("NEXT_PUBLIC_YIELD_WITHDRAW_HELPER=" + address(withdrawHelper));
        console.log("NEXT_PUBLIC_LINEAR_TWAP_GETTER=" + address(twapGetter));
        console.log("NEXT_PUBLIC_MOCK_ERC4626_YIELD=" + address(yieldVault));
        console.log("NEXT_PUBLIC_LIMIT_ORDER_PROTOCOL=0x1111111254EEB25477B68fb85Ed929f73A960582");
        console.log("NEXT_PUBLIC_CHAIN_ID=84532");
        console.log("NEXT_PUBLIC_NETWORK=base-sepolia");
        console.log("NEXT_PUBLIC_RPC_URL=https://sepolia.base.org");
        console.log(string(50, "="));
    }
} 