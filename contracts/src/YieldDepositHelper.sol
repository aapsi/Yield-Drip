// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20}   from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC4626} from "@openzeppelin/contracts/interfaces/IERC4626.sol";

/// @title YieldDepositHelper (preInteraction, idempotent)
/// @notice Pulls maker's DAI once and deposits into ERC-4626 vault. Subsequent calls are no-ops.
contract YieldDepositHelper {
    address public immutable DAI;
    address public immutable VAULT; // ERC-4626-like vault (e.g., sDAI adapter)
    address public immutable LOP;
    address public withdrawHelper; // Address allowed to withdraw our shares
    // depositKey => done?
    mapping(bytes32 => bool) public deposited;

    event Deposited(address indexed maker, uint256 amount, uint256 shares, bytes32 depositKey);
    event Skipped(bytes32 depositKey);


    constructor(address dai_, address vault_, address lop_) {
        require(dai_ != address(0) && vault_ != address(0) && lop_ != address(0), "DEP:zero");
        DAI = dai_;
        VAULT = vault_;
        LOP = lop_;
        IERC20(DAI).approve(VAULT, type(uint256).max);
    }
    
    function setWithdrawHelper(address withdrawHelper_) external {
        require(withdrawHelper == address(0), "DEP:already set");
        require(withdrawHelper_ != address(0), "DEP:zero");
        withdrawHelper = withdrawHelper_;
    }


    modifier onlyLOP() { require(msg.sender == LOP, "DEP:only LOP"); _; }


    /// @notice Called by LOP as preInteraction.
    /// @param maker      order.maker
    /// @param amount     total DAI to deposit for this order
    /// @param depositKey idempotency key (e.g. keccak256(abi.encode(maker, salt)))
    function depositFromMaker(address maker, uint256 amount, bytes32 depositKey) external onlyLOP {
        if (deposited[depositKey]) {
            emit Skipped(depositKey);
            return; // idempotent: do nothing after first time
        }

        require(IERC20(DAI).transferFrom(maker, address(this), amount), "DEP:xferFrom");
        uint256 shares = IERC4626(VAULT).deposit(amount, address(this));
        deposited[depositKey] = true;
        emit Deposited(maker, amount, shares, depositKey);
    }
    
    /// @notice Allows withdraw helper to withdraw DAI from vault
    function withdrawTo(uint256 amountDAI, address to) external {
        require(msg.sender == withdrawHelper, "DEP:only withdraw helper");
        IERC4626(VAULT).withdraw(amountDAI, to, address(this));
    }
    
    /// @notice Allows withdraw helper to redeem all remaining shares
    function redeemAllTo(address to) external returns (uint256 assets) {
        require(msg.sender == withdrawHelper, "DEP:only withdraw helper");
        uint256 shares = IERC4626(VAULT).balanceOf(address(this));
        if (shares > 0) {
            assets = IERC4626(VAULT).redeem(shares, to, address(this));
        }
    }
}
