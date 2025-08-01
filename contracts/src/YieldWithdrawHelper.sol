// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";
import "./YieldDepositHelper.sol";

/// @title YieldWithdrawHelper (postInteraction)
/// @notice Withdraws `amount` DAI from the vault and sends directly to `taker`.
/// @dev LOP overrides arg0=amount and arg1=taker at execution time.
contract YieldWithdrawHelper {
    address public immutable VAULT; // ERC-4626-like vault
    address public immutable LOP; // your deployed LOP
    address public immutable DEPOSIT_HELPER; // Contract that holds the sDAI shares

    event Withdrawn(uint256 amount, address indexed to);

    modifier onlyLOP() { require(msg.sender == LOP, "WDR:only LOP"); _; }

    constructor(address vault_, address lop_, address depositHelper_) {
        require(vault_ != address(0) && lop_ != address(0) && depositHelper_ != address(0), "WDR:zero");
        VAULT = vault_;
        LOP = lop_;
        DEPOSIT_HELPER = depositHelper_;
    }

    /// @notice postInteraction target
    /// @param amountDAI exact DAI to withdraw for this slice (overridden by LOP)
    /// @param taker recipient of DAI (overridden by LOP)
    function withdrawTo(uint256 amountDAI, address taker) external onlyLOP {
        // Call deposit helper to withdraw DAI (it holds the shares)
        YieldDepositHelper(DEPOSIT_HELPER).withdrawTo(amountDAI, taker);
        emit Withdrawn(amountDAI, taker);
    }
    
    /// @notice Redeem all remaining shares - useful for final cleanup
    function redeemAllTo(address taker) external onlyLOP returns (uint256 assets) {
        assets = YieldDepositHelper(DEPOSIT_HELPER).redeemAllTo(taker);
        emit Withdrawn(assets, taker);
    }
}
