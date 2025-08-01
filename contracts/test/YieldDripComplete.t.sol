// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/MockERC20.sol";
import "../src/MockERC4626Yield.sol";
import "../src/WETH9.sol";
import "../src/UniswapV2Factory.sol";
import "../src/UniswapV2Router.sol";
import "../src/UniswapV2Pair.sol";
import "../src/YieldDepositHelper.sol";
import "../src/YieldWithdrawHelper.sol";
import "../src/LinearTwapGetter.sol";
import { IOrderMixin } from "limit-order-protocol/interfaces/IOrderMixin.sol";
import { Address } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import { MakerTraits } from "limit-order-protocol/libraries/MakerTraitsLib.sol";

contract YieldDripCompleteTest is Test {
    MockERC20 dai;
    MockERC4626Yield vault;
    WETH9 weth;
    UniswapV2Factory factory;
    UniswapV2Router router;
    UniswapV2Pair pair;
    YieldDepositHelper depositHelper;
    YieldWithdrawHelper withdrawHelper;
    GenericLinearTwapGetter twapGetter;
    
    address constant LOP_MOCK = address(0x1111111254EEB25477B68fb85Ed929f73A960582);
    
    address deployer = address(this);
    address maker = address(0x123);
    address taker = address(0x456);
    address keeper = address(0x789);
    
    uint256 constant INITIAL_DAI_LIQUIDITY = 100_000 * 1e18; // 100k DAI
    uint256 constant INITIAL_WETH_LIQUIDITY = 50 * 1e18;     // 50 WETH
    uint256 constant MAKER_DAI_BALANCE = 10_000 * 1e18;      // 10k DAI for DCA
    
    function setUp() public {
        // Deploy all contracts
        dai = new MockERC20("Dai Stablecoin", "DAI");
        vault = new MockERC4626Yield(address(dai), 300); // 3% APR
        weth = new WETH9();
        factory = new UniswapV2Factory(deployer);
        router = new UniswapV2Router(address(factory), payable(address(weth)));
        
        depositHelper = new YieldDepositHelper(address(dai), address(vault), LOP_MOCK);
        withdrawHelper = new YieldWithdrawHelper(address(vault), LOP_MOCK, address(depositHelper));
        depositHelper.setWithdrawHelper(address(withdrawHelper));
        twapGetter = new GenericLinearTwapGetter();
        
        // Create DAI/WETH pair
        address pairAddr = factory.createPair(address(dai), address(weth));
        pair = UniswapV2Pair(pairAddr);
        
        // Setup liquidity pool
        dai.mint(deployer, INITIAL_DAI_LIQUIDITY);
        weth.deposit{value: INITIAL_WETH_LIQUIDITY}();
        
        dai.approve(address(router), INITIAL_DAI_LIQUIDITY);
        weth.approve(address(router), INITIAL_WETH_LIQUIDITY);
        
        router.addLiquidity(
            address(dai),
            address(weth),
            INITIAL_DAI_LIQUIDITY,
            INITIAL_WETH_LIQUIDITY,
            INITIAL_DAI_LIQUIDITY * 95 / 100,
            INITIAL_WETH_LIQUIDITY * 95 / 100,
            deployer,
            block.timestamp + 1000
        );
        
        // Setup maker with DAI for DCA
        dai.mint(maker, MAKER_DAI_BALANCE);
        
        // Setup keeper with WETH for buying
        weth.deposit{value: 10 * 1e18}(); // 10 WETH for keeper
        weth.transfer(keeper, 10 * 1e18);
    }
    
    function testDeploymentSetup() public {
        // Verify all contracts deployed correctly
        assertTrue(address(dai) != address(0));
        assertTrue(address(vault) != address(0));
        assertTrue(address(weth) != address(0));
        assertTrue(address(factory) != address(0));
        assertTrue(address(router) != address(0));
        assertTrue(address(pair) != address(0));
        assertTrue(address(depositHelper) != address(0));
        assertTrue(address(withdrawHelper) != address(0));
        assertTrue(address(twapGetter) != address(0));
        
        // Verify liquidity pool setup
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        assertTrue(reserve0 > 0 && reserve1 > 0, "Pool should have liquidity");
        
        // Verify maker has DAI
        assertEq(dai.balanceOf(maker), MAKER_DAI_BALANCE);
        
        // Verify keeper has WETH
        assertEq(weth.balanceOf(keeper), 10 * 1e18);
    }
    
    function testVaultYieldAccrual() public {
        uint256 depositAmount = 1000 * 1e18;
        
        // Deposit DAI into vault
        dai.mint(address(this), depositAmount);
        dai.approve(address(vault), depositAmount);
        uint256 shares = vault.deposit(depositAmount, address(this));
        
        assertEq(vault.balanceOf(address(this)), shares);
        assertEq(vault.totalAssetsView(), depositAmount);
        
        // Fast forward 1 year to see yield
        vm.warp(block.timestamp + 365 days);
        
        // Should have ~3% yield
        uint256 assetsAfterYear = vault.totalAssetsView();
        uint256 expectedYield = depositAmount * 3 / 100; // 3%
        
        // Allow for some precision loss, should be close to 3%
        assertApproxEqRel(assetsAfterYear, depositAmount + expectedYield, 0.01e18); // 1% tolerance
    }
    
    function testDepositHelperIdempotency() public {
        uint256 depositAmount = 1000 * 1e18;
        bytes32 depositKey = keccak256(abi.encode(maker, uint256(12345)));
        
        // Setup maker approval
        vm.prank(maker);
        dai.approve(address(depositHelper), depositAmount);
        
        // First deposit should work
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(maker, depositAmount, depositKey);
        
        assertTrue(depositHelper.deposited(depositKey));
        assertEq(dai.balanceOf(maker), MAKER_DAI_BALANCE - depositAmount);
        
        // Second deposit should be skipped (idempotent)
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(maker, depositAmount, depositKey);
        
        // Balances shouldn't change
        assertEq(dai.balanceOf(maker), MAKER_DAI_BALANCE - depositAmount);
    }
    
    function testWithdrawHelper() public {
        uint256 depositAmount = 1000 * 1e18;
        uint256 withdrawAmount = 100 * 1e18;
        
        // First deposit some DAI into vault via deposit helper
        bytes32 depositKey = keccak256(abi.encode(maker, uint256(12345)));
        vm.prank(maker);
        dai.approve(address(depositHelper), depositAmount);
        
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(maker, depositAmount, depositKey);
        
        // Check vault has shares (in deposit helper)
        uint256 vaultShares = vault.balanceOf(address(depositHelper));
        assertTrue(vaultShares > 0);
        
        // Test withdrawal (withdraw helper delegates to deposit helper)
        vm.prank(LOP_MOCK);
        withdrawHelper.withdrawTo(withdrawAmount, taker);
        
        assertEq(dai.balanceOf(taker), withdrawAmount);
    }
    
    function testTwapGetterLinearProgression() public {
        uint256 start = block.timestamp;
        uint256 end = start + 1000; // 1000 seconds
        uint256 makeBase = 2000 * 1e18; // 2000 DAI
        uint256 takeBase = 1 * 1e18;    // 1 WETH
        
        bytes memory extraData = abi.encode(start, end, makeBase, takeBase);
        
        // At start: should return 0 making amount (0% progress)
        uint256 takingAmount = 0.5 * 1e18; // 0.5 WETH
        uint256 makingAmount = twapGetter.getMakingAmount(
            IOrderMixin.Order({
                salt: 0, 
                maker: Address.wrap(uint256(uint160(address(0)))), 
                receiver: Address.wrap(uint256(uint160(address(0)))), 
                makerAsset: Address.wrap(uint256(uint160(address(0)))),
                takerAsset: Address.wrap(uint256(uint160(address(0)))), 
                makingAmount: 0, 
                takingAmount: 0, 
                makerTraits: MakerTraits.wrap(0)
            }),
            "",
            bytes32(0),
            address(0),
            takingAmount,
            0,
            extraData
        );
        assertEq(makingAmount, 0);
        
        // At 50% progress
        vm.warp(start + 500);
        makingAmount = twapGetter.getMakingAmount(
            IOrderMixin.Order({
                salt: 0, 
                maker: Address.wrap(uint256(uint160(address(0)))), 
                receiver: Address.wrap(uint256(uint160(address(0)))), 
                makerAsset: Address.wrap(uint256(uint160(address(0)))),
                takerAsset: Address.wrap(uint256(uint160(address(0)))), 
                makingAmount: 0, 
                takingAmount: 0, 
                makerTraits: MakerTraits.wrap(0)
            }),
            "",
            bytes32(0),
            address(0),
            takingAmount,
            0,
            extraData
        );
        
        // Should be 50% of (takingAmount * makeBase / takeBase)
        uint256 expected = (takingAmount * makeBase * 5e17) / (takeBase * 1e18); // 50%
        assertEq(makingAmount, expected);
        
        // At 100% progress
        vm.warp(end);
        makingAmount = twapGetter.getMakingAmount(
            IOrderMixin.Order({
                salt: 0, 
                maker: Address.wrap(uint256(uint160(address(0)))), 
                receiver: Address.wrap(uint256(uint160(address(0)))), 
                makerAsset: Address.wrap(uint256(uint160(address(0)))),
                takerAsset: Address.wrap(uint256(uint160(address(0)))), 
                makingAmount: 0, 
                takingAmount: 0, 
                makerTraits: MakerTraits.wrap(0)
            }),
            "",
            bytes32(0),
            address(0),
            takingAmount,
            0,
            extraData
        );
        
        // Should be 100% of (takingAmount * makeBase / takeBase)
        expected = (takingAmount * makeBase) / takeBase;
        assertEq(makingAmount, expected);
    }
    
    function testPoolPriceCalculation() public {
        // Get current reserves
        (uint112 reserve0, uint112 reserve1,) = pair.getReserves();
        
        // Calculate which token is which
        bool isDai0 = address(dai) < address(weth);
        uint256 daiReserve = isDai0 ? reserve0 : reserve1;
        uint256 wethReserve = isDai0 ? reserve1 : reserve0;
        
        // Calculate price: DAI per WETH
        uint256 daiPerWeth = (daiReserve * 1e18) / wethReserve;
        
        // Should be roughly 2000 DAI per WETH (100k DAI / 50 WETH = 2000)
        assertApproxEqRel(daiPerWeth, 2000 * 1e18, 0.01e18); // 1% tolerance
        
        console.log("DAI per WETH:", daiPerWeth / 1e18);
        console.log("DAI Reserve:", daiReserve / 1e18);
        console.log("WETH Reserve:", wethReserve / 1e18);
    }
    
    function testCompleteSliceSimulation() public {
        // Setup DCA parameters
        uint256 start = block.timestamp;
        uint256 end = start + 1 hours;
        uint256 totalDai = 1000 * 1e18; // 1000 DAI total
        uint256 targetWeth = 0.5 * 1e18; // Want 0.5 WETH total
        bytes32 depositKey = keccak256(abi.encode(maker, uint256(12345)));
        
        // 1. Maker approves deposit helper
        vm.prank(maker);
        dai.approve(address(depositHelper), totalDai);
        
        // 2. Simulate LOP calling depositFromMaker (preInteraction)
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(maker, totalDai, depositKey);
        
        // Verify deposit worked
        assertTrue(depositHelper.deposited(depositKey));
        assertEq(dai.balanceOf(maker), MAKER_DAI_BALANCE - totalDai);
        
        // 3. Fast forward to 50% completion
        vm.warp(start + 30 minutes);
        
        // 4. Simulate keeper filling a slice
        uint256 takingWeth = 0.05 * 1e18; // 0.05 WETH slice
        bytes memory extraData = abi.encode(start, end, totalDai, targetWeth);
        
        // Calculate expected making amount using TWAP getter
        uint256 expectedMaking = twapGetter.getMakingAmount(
            IOrderMixin.Order({
                salt: 0, 
                maker: Address.wrap(uint256(uint160(address(0)))), 
                receiver: Address.wrap(uint256(uint160(address(0)))), 
                makerAsset: Address.wrap(uint256(uint160(address(0)))),
                takerAsset: Address.wrap(uint256(uint160(address(0)))), 
                makingAmount: 0, 
                takingAmount: 0, 
                makerTraits: MakerTraits.wrap(0)
            }),
            "",
            bytes32(0),
            address(0),
            takingWeth,
            0,
            extraData
        );
        
        console.log("Expected DAI for 0.05 WETH at 50% progress:", expectedMaking / 1e18);
        
        // 5. Transfer vault shares to withdraw helper for the slice
        uint256 vaultShares = vault.balanceOf(address(depositHelper));
        vm.prank(address(depositHelper));
        vault.transfer(address(withdrawHelper), vaultShares / 20); // 5% of shares for 5% slice
        
        // 6. Simulate LOP calling withdrawTo (postInteraction)
        vm.prank(LOP_MOCK);
        withdrawHelper.withdrawTo(expectedMaking, taker);
        
        // Verify taker received DAI
        assertEq(dai.balanceOf(taker), expectedMaking);
        
        console.log("Slice executed successfully!");
        console.log("Taker received DAI:", dai.balanceOf(taker) / 1e18);
    }
    
    function testYieldAccumulation() public {
        uint256 depositAmount = 1000 * 1e18;
        bytes32 depositKey = keccak256(abi.encode(maker, uint256(12345)));
        
        // Initial deposit
        vm.prank(maker);
        dai.approve(address(depositHelper), depositAmount);
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(maker, depositAmount, depositKey);
        
        uint256 initialShares = vault.balanceOf(address(depositHelper));
        uint256 initialAssets = vault.convertToAssets(initialShares);
        
        // Fast forward 6 months
        vm.warp(block.timestamp + 180 days);
        
        // Check accumulated yield
        uint256 currentAssets = vault.convertToAssets(initialShares);
        uint256 yieldEarned = currentAssets - initialAssets;
        
        // Should have earned ~1.5% in 6 months (3% APR / 2)
        uint256 expectedYield = depositAmount * 15 / 1000; // 1.5%
        
        console.log("Initial assets:", initialAssets / 1e18);
        console.log("Current assets:", currentAssets / 1e18);
        console.log("Yield earned:", yieldEarned / 1e18);
        console.log("Expected yield:", expectedYield / 1e18);
        
        // Allow for some precision difference
        assertApproxEqRel(yieldEarned, expectedYield, 0.05e18); // 5% tolerance
    }
    
    receive() external payable {}
}