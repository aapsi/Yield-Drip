// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title MockERC4626Yield
/// @notice Minimal ERC-4626-like vault with ~3% APR (lazy accrual).
contract MockERC4626Yield {
    string public name = "Mock sDAI";
    string public symbol = "sDAI";
    uint8  public constant decimals = 18;

    address public immutable ASSET; // DAI
    uint256 public totalSupply;     // shares
    mapping(address => uint256) public balanceOf;

    // underlying accounting
    uint256 public totalAssets;         // virtual assets backing
    uint256 public lastAccrual;         // timestamp of last accrual
    uint256 public immutable ratePerSec; // 3% APR ≈ 0.03 / 365d

    event Transfer(address indexed from, address indexed to, uint256 amount);
    event Approval(address indexed owner, address indexed spender, uint256 amount);
    
    mapping(address => mapping(address => uint256)) public allowance;

    constructor(address asset_, uint256 aprBps) {
        require(asset_ != address(0), "VAULT:asset");
        ASSET = asset_;
        // aprBps = 300 for 3.00% = 3% = 0.03
        // Convert to rate per second: (aprBps/10000) * 1e18 / secondsPerYear
        ratePerSec = (uint256(aprBps) * 1e18) / (10000 * 31_536_000); // Correct: 3% per year
        lastAccrual = block.timestamp;
    }

    // --- 4626-ish views ---

    function asset() external view returns (address) { return ASSET; }

    function _accrued(uint256 _totalAssets) internal view returns (uint256) {
        if (_totalAssets == 0) return 0;
        uint256 dt = block.timestamp - lastAccrual;
        // simple linear accrual: assets += assets * ratePerSec * dt / 1e18
        return (_totalAssets * ratePerSec * dt) / 1e18;
    }

    function totalAssetsView() public view returns (uint256) {
        return totalAssets + _accrued(totalAssets);
    }

    function convertToShares(uint256 assets) public view returns (uint256) {
        uint256 ta = totalAssetsView();
        if (ta == 0 || totalSupply == 0) return assets; // 1:1 on first deposit
        return (assets * totalSupply) / ta;
    }

    function convertToAssets(uint256 shares) public view returns (uint256) {
        uint256 ta = totalAssetsView();
        if (totalSupply == 0) return shares;
        return (shares * ta) / totalSupply;
    }

    // --- accrual mutator ---

    function _accrue() internal {
        uint256 add = _accrued(totalAssets);
        if (add > 0) {
            totalAssets += add;
        }
        lastAccrual = block.timestamp;
    }

    // --- minimal ERC-4626 surface ---

    function deposit(uint256 assets, address receiver) external returns (uint256 shares) {
        _accrue();
        require(IERC20(ASSET).transferFrom(msg.sender, address(this), assets), "xferFrom");
        totalAssets += assets;
        shares = convertToShares(assets);
        require(shares > 0, "zero-shares");
        totalSupply += shares;
        balanceOf[receiver] += shares;
        emit Transfer(address(0), receiver, shares);
    }

    function withdraw(uint256 assets, address receiver, address owner) external returns (uint256 shares) {
        _accrue();
        shares = convertToShares(assets);
        require(balanceOf[owner] >= shares, "shares");
        balanceOf[owner] -= shares;
        totalSupply -= shares;
        emit Transfer(owner, address(0), shares);
        require(totalAssets >= assets, "assets");
        totalAssets -= assets;
        require(IERC20(ASSET).transfer(receiver, assets), "xfer");
    }
    
    function redeem(uint256 shares, address receiver, address owner) external returns (uint256 assets) {
        _accrue();
        require(balanceOf[owner] >= shares, "shares");
        assets = convertToAssets(shares);
        
        // Be conservative - don't try to transfer more than we have
        uint256 actualBalance = IERC20(ASSET).balanceOf(address(this));
        if (assets > actualBalance) {
            assets = actualBalance;
        }
        
        balanceOf[owner] -= shares;
        totalSupply -= shares;
        emit Transfer(owner, address(0), shares);
        totalAssets -= assets;
        require(IERC20(ASSET).transfer(receiver, assets), "xfer");
    }
    
    // ERC20-like transfer methods for shares
    function transfer(address to, uint256 amount) external returns (bool) {
        require(balanceOf[msg.sender] >= amount, "insufficient balance");
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        emit Transfer(msg.sender, to, amount);
        return true;
    }
    
    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        emit Approval(msg.sender, spender, amount);
        return true;
    }
    
    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        uint256 a = allowance[from][msg.sender];
        require(a >= amount, "insufficient allowance");
        require(balanceOf[from] >= amount, "insufficient balance");
        if (a != type(uint256).max) allowance[from][msg.sender] = a - amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        emit Transfer(from, to, amount);
        return true;
    }
}
