// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import { IAmountGetter } from "limit-order-protocol/interfaces/IAmountGetter.sol";  
import { IOrderMixin } from "limit-order-protocol/interfaces/IOrderMixin.sol";

/// @title GenericLinearTwapGetter
/// @notice One deploy reused for all orders.
///         Per-order schedule is passed in `extraData = abi.encode(start, end, makeBase, takeBase)`.
/// @dev    IMPORTANT: Your order's predicate MUST include gteTimestamp(start),
///         otherwise getTakingAmount could divide by zero before start.
contract GenericLinearTwapGetter is IAmountGetter {

    // taker specifies takingAmount (e.g., ETH) → return required makingAmount (e.g., DAI)
    function getMakingAmount(
        IOrderMixin.Order calldata, /*order*/
        bytes calldata,          /*extension*/
        bytes32,                 /*orderHash*/
        address,                 /*taker*/
        uint256 takingAmount,
        uint256,                 /*remainingMakingAmount*/
        bytes calldata extraData
    ) external view override returns (uint256 makingAmount) {
        (uint256 start, uint256 end, uint256 makeBase, uint256 takeBase) =
            abi.decode(extraData, (uint256, uint256, uint256, uint256));

        uint256 pct = _progress(start, end); // 0..1e18
        // making = taking * (makeBase/takeBase) * pct
        makingAmount = (takingAmount * makeBase * pct) / (takeBase * 1e18);
    }

    // taker specifies makingAmount (e.g., DAI) → return required takingAmount (e.g., ETH)
    function getTakingAmount(
        IOrderMixin.Order calldata, /*order*/
        bytes calldata,          /*extension*/
        bytes32,                 /*orderHash*/
        address,                 /*taker*/
        uint256 makingAmount,
        uint256,                 /*remainingMakingAmount*/
        bytes calldata extraData
    ) external view override returns (uint256 takingAmount) {
        (uint256 start, uint256 end, uint256 makeBase, uint256 takeBase) =
            abi.decode(extraData, (uint256, uint256, uint256, uint256));

        uint256 pct = _progress(start, end); // 0..1e18
        // Guard: require start predicate to have been satisfied
        require(pct > 0, "TWAP:not-started");
        // taking = making * (takeBase/makeBase) / pct
        takingAmount = (makingAmount * takeBase * 1e18) / (makeBase * pct);
    }

    /// @return pct scaled by 1e18 (0 before start, 1e18 after end)
    function _progress(uint256 start, uint256 end) internal view returns (uint256) {
        if (block.timestamp <= start) return 0;
        if (block.timestamp >= end)   return 1e18;
        unchecked {
            uint256 elapsed = block.timestamp - start;
            uint256 window  = end - start;
            return (elapsed * 1e18) / window;
        }
    }
}
