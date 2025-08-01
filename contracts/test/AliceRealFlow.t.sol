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
 * @title AliceRealFlowTest  
 * @notice Tests Alice's ACTUAL intended flow:
 * - 1,000 DAI over 4 hours (24 slices, 10-minute intervals)
 * - Target: ~0.5 ETH total
 * - Price floor protection (skip when ETH too expensive)
 * - Yield earning on unspent DAI
 * - Final claim of residual + yield
 */
contract AliceRealFlowTest is Test {
    // Contracts
    MockERC20 dai;
    MockERC4626Yield sDAI;
    WETH9 weth;
    YieldDepositHelper depositHelper;
    YieldWithdrawHelper withdrawHelper;
    GenericLinearTwapGetter twapGetter;
    
    // Alice's REAL DCA parameters
    address constant ALICE = address(0x1111);
    address constant KEEPER = address(0x2222);
    address constant LOP_MOCK = address(0x3333);
    
    uint256 constant TOTAL_DAI = 1000e18;           // 1,000 DAI budget
    uint256 constant ETH_TARGET = 0.5e18;          // ~0.5 ETH target
    uint256 constant DCA_DURATION = 4 hours;       // 4 hours total
    uint256 constant SLICE_INTERVAL = 10 minutes;  // 10-minute slices
    uint256 constant TOTAL_SLICES = 24;            // 4 hours / 10 min = 24 slices
    uint256 constant MAX_ETH_PRICE = 2200e18;      // Alice's price floor ($2200)
    
    // Tracking
    uint256 public currentETHPrice = 2000e18;      // Start at $2000
    uint256 public aliceETHBalance = 0;
    uint256 public slicesExecuted = 0;
    uint256 public totalDAISpent = 0;
    uint256 public startTime;
    uint256 public endTime;
    
    event SliceExecuted(uint256 sliceNum, uint256 daiSpent, uint256 ethBought, uint256 ethPrice);
    event SliceSkipped(uint256 sliceNum, uint256 ethPrice, string reason);
    event YieldClaimed(uint256 residualDAI, uint256 yieldEarned);
    
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
        
        depositHelper.setWithdrawHelper(address(withdrawHelper));
        twapGetter = new GenericLinearTwapGetter();
        
        // Setup Alice
        dai.mint(ALICE, TOTAL_DAI);
        startTime = block.timestamp;
        endTime = startTime + DCA_DURATION;
        
        console.log("=== ALICE'S REAL YIELD-SHIELDED DCA ===");
        console.log("Budget: 1,000 DAI");
        console.log("Target: 0.5 ETH");
        console.log("Duration: 4 hours (24 slices @ 10min each)");
        console.log("Price floor: $2,200 (skip if above)");
        console.log("Starting ETH price: $", currentETHPrice / 1e18);
    }
    
    function testAliceRealYieldDCA() public {
        console.log("\n=== STEP 1: DEPOSIT ALL DAI INTO sDAI ===");
        
        // Alice approves and deposits all DAI into sDAI immediately
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        assertEq(dai.balanceOf(ALICE), 0, "Alice should have no DAI left");
        assertEq(sDAI.balanceOf(address(depositHelper)), TOTAL_DAI, "All DAI in sDAI");
        
        console.log("[SUCCESS] All 1,000 DAI earning 3% APR in sDAI");
        
        console.log("\n=== STEP 2: DCA EXECUTION (4 HOURS) ===");
        
        // Simulate 24 slices over 4 hours
        for (uint256 slice = 1; slice <= TOTAL_SLICES; slice++) {
            uint256 currentTime = startTime + (slice * SLICE_INTERVAL);
            vm.warp(currentTime);
            
            console.log("=== Slice", slice, "===");
            console.log("Minutes elapsed:", (currentTime - startTime) / 60);
            console.log("ETH Price:", currentETHPrice / 1e18);
            
            // Check if we should execute this slice
            if (_shouldExecuteSlice(slice, currentTime)) {
                _executeSlice(slice, currentTime);
            } else {
                console.log("[SKIP] Conditions not met");
                emit SliceSkipped(slice, currentETHPrice, "Price too high or target reached");
            }
            
            // Simulate ETH price movement
            _updateETHPrice(slice);
            
            // Show current yield earnings
            _showYieldStatus();
        }
        
        console.log("\n=== STEP 3: FINAL CLAIM ===");
        _finalClaim();
        
        console.log("\n=== RESULTS ===");
        _printResults();
    }
    
    function _shouldExecuteSlice(uint256 slice, uint256 currentTime) internal view returns (bool) {
        // Don't execute if we've hit our ETH target
        if (aliceETHBalance >= ETH_TARGET) {
            return false;
        }
        
        // Don't execute if ETH price above Alice's floor
        if (currentETHPrice > MAX_ETH_PRICE) {
            return false;
        }
        
        // Don't execute if we're out of DAI
        uint256 availableDAI = sDAI.totalAssetsView();
        if (availableDAI < 10e18) { // Less than 10 DAI left
            return false;
        }
        
        return true;
    }
    
    function _executeSlice(uint256 slice, uint256 currentTime) internal {
        // Calculate how much ETH we want this slice
        uint256 progress = ((currentTime - startTime) * 1e18) / DCA_DURATION;
        uint256 targetETHSoFar = (ETH_TARGET * progress) / 1e18;
        uint256 ethNeededThisSlice = targetETHSoFar > aliceETHBalance ? 
            targetETHSoFar - aliceETHBalance : 0;
        
        // Don't buy more than we need
        if (ethNeededThisSlice > ETH_TARGET - aliceETHBalance) {
            ethNeededThisSlice = ETH_TARGET - aliceETHBalance;
        }
        
        // Calculate DAI needed for this ETH amount
        uint256 daiNeeded = (ethNeededThisSlice * currentETHPrice) / 1e18;
        
        // Check if we have enough DAI
        uint256 availableDAI = sDAI.totalAssetsView();
        if (daiNeeded > availableDAI) {
            daiNeeded = availableDAI;
            ethNeededThisSlice = (daiNeeded * 1e18) / currentETHPrice;
        }
        
        console.log("ETH needed this slice:", ethNeededThisSlice / 1e15);
        console.log("DAI needed:", daiNeeded / 1e18);
        
        // Execute withdrawal from sDAI
        vm.prank(LOP_MOCK);
        withdrawHelper.withdrawTo(daiNeeded, ALICE);
        
        // Simulate ETH purchase (Alice gets ETH, DAI goes to market)
        aliceETHBalance += ethNeededThisSlice;
        totalDAISpent += daiNeeded;
        slicesExecuted++;
        
        // Note: In real scenario, LOP would handle ETH delivery
        // Here we just track that DAI was withdrawn for the purchase
        
        console.log("[EXECUTE] Slice successful");
        console.log("Alice ETH balance:", aliceETHBalance / 1e15);
        console.log("Total DAI spent:", totalDAISpent / 1e18);
        
        emit SliceExecuted(slice, daiNeeded, ethNeededThisSlice, currentETHPrice);
    }
    
    function _updateETHPrice(uint256 slice) internal {
        // Simulate Alice's scenario: price spike in hour 2 (slices 7-12)
        if (slice >= 7 && slice <= 12) {
            // Hour 2: Price spikes above Alice's floor
            currentETHPrice = 2300e18 + (slice - 7) * 50e18; // $2300-$2550
        } else if (slice >= 13 && slice <= 18) {
            // Hour 3: Price gradually comes down  
            currentETHPrice = 2550e18 - (slice - 13) * 60e18; // $2550 -> $2250
        } else if (slice >= 19) {
            // Hour 4: Price settles around Alice's comfort zone
            currentETHPrice = 2100e18 + (slice % 3) * 25e18; // $2100-$2150
        }
        // Hour 1: Price stays around $2000 (no change needed)
    }
    
    function _showYieldStatus() internal view {
        uint256 currentValue = sDAI.totalAssetsView();
        uint256 originalRemaining = TOTAL_DAI - totalDAISpent;
        uint256 yieldEarned = currentValue > originalRemaining ? currentValue - originalRemaining : 0;
        
        if (yieldEarned > 0) {
            console.log("Yield earned so far:", yieldEarned / 1e15, "milli-DAI");
        }
    }
    
    function _finalClaim() internal {
        uint256 finalValue = sDAI.totalAssetsView();
        uint256 originalRemaining = TOTAL_DAI - totalDAISpent;
        uint256 yieldEarned = finalValue > originalRemaining ? finalValue - originalRemaining : 0;
        
        // Check remaining shares
        uint256 shares = sDAI.balanceOf(address(depositHelper));
        if (shares > 0) {
            // Redeem all remaining shares to avoid rounding issues
            vm.prank(LOP_MOCK);
            uint256 actualWithdrawn = withdrawHelper.redeemAllTo(ALICE);
            
            console.log("Residual DAI claimed:", originalRemaining / 1e18);
            console.log("Actual DAI claimed:", actualWithdrawn / 1e18);
            console.log("Yield claimed:", yieldEarned / 1e15, "milli-DAI");
            
            emit YieldClaimed(originalRemaining, yieldEarned);
        }
    }
    
    function _printResults() internal view {
        uint256 originalRemaining = TOTAL_DAI - totalDAISpent;
        uint256 finalDAIBalance = dai.balanceOf(ALICE);
        uint256 yieldEarned = finalDAIBalance > originalRemaining ? finalDAIBalance - originalRemaining : 0;
        
        console.log("Slices executed:", slicesExecuted, "/", TOTAL_SLICES);
        console.log("Alice's final ETH:", aliceETHBalance / 1e15, "milli-ETH"); 
        console.log("Alice's final DAI:", finalDAIBalance / 1e18, "(residual + yield)");
        console.log("Total DAI spent on ETH:", totalDAISpent / 1e18);
        console.log("Yield earned:", yieldEarned / 1e15, "milli-DAI");
        
        // Efficiency calculation
        uint256 averageETHPrice = 2000e18; // Simplified
        uint256 ethValueOfYield = (yieldEarned * 1e18) / averageETHPrice;
        
        console.log("\n=== YIELD-SHIELDED DCA BENEFIT ===");
        console.log("Traditional DCA: Would earn 0 yield");
        console.log("Yield-Shielded DCA: Earned", yieldEarned / 1e15, "milli-DAI");
        console.log("Equivalent ETH value:", ethValueOfYield / 1e15, "milli-ETH");
        console.log("Improvement:", ((ethValueOfYield * 10000) / aliceETHBalance) / 100, "basis points");
    }
    
    function testPriceFloorProtection() public {
        console.log("\n=== TESTING PRICE FLOOR PROTECTION ===");
        
        // Setup
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        // Set price above Alice's floor
        currentETHPrice = 2500e18; // Above $2200 limit
        
        vm.warp(startTime + 10 minutes);
        bool shouldExecute = _shouldExecuteSlice(1, block.timestamp);
        assertFalse(shouldExecute, "Should skip when price too high");
        
        console.log("[SUCCESS] Skipped slice when ETH = $2500 (above $2200 floor)");
        
        // Price comes back down
        currentETHPrice = 2100e18; // Below $2200 limit
        shouldExecute = _shouldExecuteSlice(1, block.timestamp);
        assertTrue(shouldExecute, "Should execute when price acceptable");
        
        console.log("[SUCCESS] Resumed when ETH = $2100 (below $2200 floor)");
    }
    
    function testYieldAccumulation() public {
        console.log("\n=== TESTING YIELD ACCUMULATION ===");
        
        // Setup
        vm.prank(ALICE);
        dai.approve(address(depositHelper), TOTAL_DAI);
        
        bytes32 depositKey = keccak256(abi.encode(ALICE, uint256(12345)));
        vm.prank(LOP_MOCK);
        depositHelper.depositFromMaker(ALICE, TOTAL_DAI, depositKey);
        
        uint256 initialValue = sDAI.totalAssetsView();
        console.log("Initial sDAI value:", initialValue / 1e18);
        
        // Wait 1 hour (6 slices worth of time)
        vm.warp(startTime + 1 hours);
        uint256 valueAfter1Hour = sDAI.totalAssetsView();
        uint256 yieldAfter1Hour = valueAfter1Hour - initialValue;
        
        console.log("Value after 1 hour:", valueAfter1Hour / 1e18);
        console.log("Yield earned:", yieldAfter1Hour / 1e15, "milli-DAI");
        
        assertTrue(yieldAfter1Hour > 0, "Should earn yield over time");
        
        // Execute one slice
        currentETHPrice = 2000e18;
        _executeSlice(1, block.timestamp);
        
        uint256 valueAfterSlice = sDAI.totalAssetsView();
        console.log("Value after slice:", valueAfterSlice / 1e18);
        
        // Wait another hour on remaining balance
        vm.warp(startTime + 2 hours);
        uint256 finalValue = sDAI.totalAssetsView();
        uint256 additionalYield = finalValue - valueAfterSlice;
        
        console.log("Additional yield on remaining:", additionalYield / 1e15, "milli-DAI");
        assertTrue(additionalYield > 0, "Should continue earning on remaining balance");
        
        console.log("[SUCCESS] Yield accumulates on unspent DAI throughout DCA period");
    }
}