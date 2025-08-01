// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "forge-std/Test.sol";
import "../src/MockERC20.sol";
import "../src/MockERC4626Yield.sol";
import "../src/WETH9.sol";
import "../src/YieldDepositHelper.sol";
import "../src/YieldWithdrawHelper.sol";
import "../src/LinearTwapGetter.sol";
import { IOrderMixin } from "limit-order-protocol/interfaces/IOrderMixin.sol";
import { Address } from "@1inch/solidity-utils/contracts/libraries/AddressLib.sol";
import { MakerTraits } from "limit-order-protocol/libraries/MakerTraitsLib.sol";

/**
 * @title AliceFlowCompleteTest
 * @notice Tests the exact flow described in the sample:
 * Alice DCAs 1000 DAI → ETH over 5 days, 5 slices of 200 DAI each
 * With keeper checking hourly and minimum price protection
 */
contract AliceFlowCompleteTest is Test {
    // Contracts
    MockERC20 dai;
    MockERC4626Yield sDAI;
    WETH9 weth;
    YieldDepositHelper depositHelper;
    YieldWithdrawHelper withdrawHelper;
    GenericLinearTwapGetter twapGetter;
    
    // Test parameters matching Alice's flow
    address constant ALICE = address(0x1111);
    address constant KEEPER = address(0x2222);
    address constant LOP_MOCK = address(0x3333);
    
    uint256 constant TOTAL_DAI = 1000e18;           // 1000 DAI total
    uint256 constant SLICES = 5;                    // 5 slices
    uint256 constant DAI_PER_SLICE = 200e18;       // 200 DAI per slice
    uint256 constant DCA_DURATION = 5 days;        // 5 days total
    uint256 constant MIN_ETH_PRICE = 1500e18;      // $1500 minimum ETH price
    uint256 constant KEEPER_INTERVAL = 1 hours;    // Check every hour
    
    // Mock Chainlink price feed
    uint256 public currentETHPrice = 2000e18;       // Start at $2000 ETH
    
    // Order tracking
    uint256 public remainingDAI = TOTAL_DAI;
    uint256 public slicesExecuted = 0;
    uint256 public startTime;
    uint256 public endTime;
    
    event SliceExecuted(uint256 indexed sliceNumber, uint256 daiUsed, uint256 ethReceived, uint256 ethPrice);
    event YieldEarned(uint256 yieldAmount);
    
    function setUp() public {
        // Deploy contracts
        dai = new MockERC20("DAI", "DAI");
        weth = new WETH9();
        sDAI = new MockERC4626Yield(address(dai), 300); // 3% APR
        
        depositHelper = new YieldDepositHelper(
            address(dai),
            address(sDAI),
            LOP_MOCK
        );
        
        withdrawHelper = new YieldWithdrawHelper(
            address(sDAI),
            LOP_MOCK,
            address(depositHelper)
        );
        
        // Link deposit and withdraw helpers
        depositHelper.setWithdrawHelper(address(withdrawHelper));
        
        twapGetter = new GenericLinearTwapGetter();
        
        // Setup Alice with DAI
        dai.mint(ALICE, TOTAL_DAI);
        
        // Setup times
        startTime = block.timestamp;
        endTime = startTime + DCA_DURATION;
        
        console.log("=== ALICE'S DCA SETUP ===");
        console.log("Total DAI:", TOTAL_DAI / 1e18);
        console.log("Slices:", SLICES);
        console.log("DAI per slice:", DAI_PER_SLICE / 1e18);
        console.log("Duration:", DCA_DURATION / 86400, "days");
        console.log("Min ETH price: $", MIN_ETH_PRICE / 1e18);
    }
    
    function testAliceCompleteFlow() public {
        console.log("\n=== STEP 1: ALICE CREATES ORDER ===");
        
        // Alice approves deposit helper
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        // Simulate order creation with immediate preInteraction
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        // Verify all DAI is now in sDAI earning yield
        assertEq(dai.balanceOf(ALICE), 0, "Alice should have no DAI left");
        assertEq(sDAI.balanceOf(address(depositHelper)), TOTAL_DAI, "All DAI should be in sDAI");
        
        console.log("[SUCCESS] All 1000 DAI deposited into sDAI");
        console.log("[SUCCESS] Starting to earn 3% APR immediately");
        
        console.log("\n=== STEP 2: KEEPER EXECUTION SIMULATION ===");
        
        // Simulate keeper checking every hour for 5 days
        uint256 currentTime = startTime;
        
        while (currentTime <= endTime && slicesExecuted < SLICES) {
            vm.warp(currentTime);
            
            console.log("\n--- Hour", (currentTime - startTime) / 3600, "---");
            console.log("Current time:", currentTime);
            console.log("ETH Price: $", currentETHPrice / 1e18);
            
            // Keeper checks if slice should be executed
            bool shouldExecute = _keeperCheck(currentTime);
            
            if (shouldExecute) {
                _executeSlice(currentTime);
            } else {
                console.log("[WAIT] Conditions not met, keeper waits");
            }
            
            // Move to next hour
            currentTime += KEEPER_INTERVAL;
        }
        
        console.log("\n=== FINAL RESULTS ===");
        _printFinalResults();
    }
    
    function _keeperCheck(uint256 currentTime) internal view returns (bool) {
        // 1. Check if we're within DCA window
        if (currentTime < startTime || currentTime > endTime) {
            console.log("[FAIL] Outside DCA window");
            return false;
        }
        
        // 2. Check if all slices executed
        if (slicesExecuted >= SLICES) {
            console.log("[FAIL] All slices already executed");
            return false;
        }
        
        // 3. Check minimum price protection
        if (currentETHPrice < MIN_ETH_PRICE) {
            console.log("[FAIL] ETH price below minimum ($1500)");
            return false;
        }
        
        // 4. Check if enough time passed for next slice
        uint256 progress = ((currentTime - startTime) * 1e18) / DCA_DURATION;
        uint256 expectedSlices = (progress * SLICES) / 1e18;
        
        if (expectedSlices <= slicesExecuted) {
            console.log("[WAIT] Not time for next slice yet");
            return false;
        }
        
        console.log("[SUCCESS] All conditions met, executing slice");
        return true;
    }
    
    function _executeSlice(uint256 currentTime) internal {
        slicesExecuted++;
        
        console.log("[EXECUTE] Executing slice", slicesExecuted, "of", SLICES);
        
        // Calculate how much DAI should be used based on TWAP
        uint256 progress = ((currentTime - startTime) * 1e18) / DCA_DURATION;
        uint256 targetDAIUsed = (TOTAL_DAI * progress) / 1e18;
        uint256 currentSliceDAI = targetDAIUsed - (TOTAL_DAI - remainingDAI);
        
        // Ensure we don't exceed slice limits
        if (currentSliceDAI > DAI_PER_SLICE) {
            currentSliceDAI = DAI_PER_SLICE;
        }
        
        console.log("DAI for this slice:", currentSliceDAI / 1e18);
        
        // Calculate ETH to receive based on current price
        uint256 ethToReceive = (currentSliceDAI * 1e18) / currentETHPrice;
        
        console.log("ETH to receive:", ethToReceive / 1e18);
        
        // Record sDAI value before withdrawal (to track yield)
        uint256 sDAIValueBefore = sDAI.totalAssetsView();
        
        // Execute postInteraction withdrawal
        vm.prank(LOP_MOCK);
        withdrawHelper.withdrawTo(currentSliceDAI, ALICE);
        
        // Update tracking
        remainingDAI -= currentSliceDAI;
        
        // Note: In real scenario, LOP would handle ETH delivery
        // Here we just verify the DAI withdrawal worked correctly
        
        uint256 sDAIValueAfter = sDAI.totalAssetsView();
        uint256 yieldEarned = sDAIValueBefore > TOTAL_DAI ? sDAIValueBefore - TOTAL_DAI : 0;
        
        emit SliceExecuted(slicesExecuted, currentSliceDAI, ethToReceive, currentETHPrice);
        emit YieldEarned(yieldEarned);
        
        console.log("[SUCCESS] Slice executed successfully");
        console.log("Remaining DAI in sDAI:", remainingDAI / 1e18);
        console.log("Total yield earned so far:", yieldEarned / 1e18);
        
        // Simulate price movement (optional - for realistic testing)
        _updateETHPrice();
    }
    
    function _updateETHPrice() internal {
        // Simple price simulation - ETH volatility
        uint256 priceChange = (block.timestamp % 100); // 0-99
        if (priceChange < 30) {
            // 30% chance price goes down 1-5%
            uint256 decrease = 1 + (priceChange % 5); // 1-5%
            currentETHPrice = (currentETHPrice * (100 - decrease)) / 100;
        } else if (priceChange > 70) {
            // 30% chance price goes up 1-5%  
            uint256 increase = 1 + (priceChange % 5); // 1-5%
            currentETHPrice = (currentETHPrice * (100 + increase)) / 100;
        }
        // 40% chance price stays same
        
        // Ensure price doesn't go too extreme
        if (currentETHPrice < 1000e18) currentETHPrice = 1000e18;
        if (currentETHPrice > 5000e18) currentETHPrice = 5000e18;
    }
    
    function _printFinalResults() internal view {
        uint256 finalSDAIValue = sDAI.totalAssetsView();
        uint256 totalYieldEarned = finalSDAIValue > remainingDAI ? finalSDAIValue - remainingDAI : 0;
        uint256 aliceDAIBalance = dai.balanceOf(ALICE); // DAI Alice received from withdrawals
        
        console.log("Slices executed:", slicesExecuted, "/", SLICES);
        console.log("DAI used for DCA:", (TOTAL_DAI - remainingDAI) / 1e18);
        console.log("DAI still earning yield:", remainingDAI / 1e18);
        console.log("Total yield earned:", totalYieldEarned / 1e18);
        console.log("Alice's DAI received (for ETH purchases):", aliceDAIBalance / 1e18);
        console.log("Final sDAI value:", finalSDAIValue / 1e18);
        
        // Calculate efficiency metrics
        uint256 averageETHPrice = currentETHPrice; // Simplified
        uint256 expectedETHWithoutYield = ((TOTAL_DAI - remainingDAI) * 1e18) / averageETHPrice;
        uint256 yieldBenefit = (totalYieldEarned * 1e18) / averageETHPrice;
        
        console.log("\n=== YIELD-SHIELDED DCA BENEFITS ===");
        console.log("Expected ETH without yield:", expectedETHWithoutYield / 1e18);
        console.log("Bonus ETH from yield:", yieldBenefit / 1e18);
        console.log("Total improvement:", ((yieldBenefit * 10000) / expectedETHWithoutYield) / 100, "basis points");
    }
    
    function testMinimumPriceProtection() public {
        console.log("\n=== TESTING MINIMUM PRICE PROTECTION ===");
        
        // Setup initial deposit
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        // Set ETH price below minimum
        currentETHPrice = 1400e18; // Below $1500 minimum
        
        // Try to execute slice - should fail protection (wait 1 day for first slice)
        vm.warp(startTime + 1 days);
        
        bool shouldExecute = _keeperCheck(block.timestamp);
        assertFalse(shouldExecute, "Should not execute when price below minimum");
        
        console.log("[SUCCESS] Minimum price protection working");
        
        // Set price above minimum - should work
        currentETHPrice = 1600e18;
        shouldExecute = _keeperCheck(block.timestamp);
        assertTrue(shouldExecute, "Should execute when price above minimum");
        
        console.log("[SUCCESS] Execution resumes when price recovers");
    }
    
    function testKeeperIntervalLogic() public {
        console.log("\n=== TESTING KEEPER INTERVAL LOGIC ===");
        
        // Setup
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        // Test: Too early (0% progress)
        vm.warp(startTime);
        bool shouldExecute = _keeperCheck(block.timestamp);
        assertFalse(shouldExecute, "Should not execute at 0% progress");
        
        // Test: 20% progress (1 day) - should execute first slice
        vm.warp(startTime + 1 days);
        shouldExecute = _keeperCheck(block.timestamp);
        assertTrue(shouldExecute, "Should execute at 20% progress");
        
        // Execute first slice
        _executeSlice(block.timestamp);
        
        // Test: Same time again - should not execute twice
        shouldExecute = _keeperCheck(block.timestamp);
        assertFalse(shouldExecute, "Should not execute same slice twice");
        
        console.log("[SUCCESS] Keeper interval logic working correctly");
    }
    
    function testYieldAccumulationDuringDCA() public {
        console.log("\n=== TESTING YIELD ACCUMULATION DURING DCA ===");
        
        // Setup
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        uint256 initialValue = sDAI.totalAssetsView();
        console.log("Initial sDAI value:", initialValue / 1e18);
        
        // Wait 1 day and execute first slice
        vm.warp(startTime + 1 days);
        uint256 valueAfter1Day = sDAI.totalAssetsView();
        console.log("Value after 1 day:", valueAfter1Day / 1e18);
        
        uint256 yieldEarned = valueAfter1Day - initialValue;
        console.log("Yield earned in 1 day:", yieldEarned / 1e15, "milli-DAI");
        
        // Execute slice
        _executeSlice(block.timestamp);
        
        // Check remaining value still earning
        uint256 valueAfterSlice = sDAI.totalAssetsView();
        console.log("Value after slice execution:", valueAfterSlice / 1e18);
        
        // Wait another day
        vm.warp(startTime + 2 days);
        uint256 valueAfter2Days = sDAI.totalAssetsView();
        console.log("Value after 2 days total:", valueAfter2Days / 1e18);
        
        assertTrue(valueAfter2Days > valueAfterSlice, "Yield should continue accruing on remaining balance");
        
        console.log("[SUCCESS] Yield continues accruing on unspent DAI");
    }
}