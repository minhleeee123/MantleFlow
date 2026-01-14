// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title SimpleDEXV2
 * @dev DEX đơn giản cho MNT/USDT swap với liquidity pool
 */
contract SimpleDEXV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdt;
    
    // Reserves
    uint256 public mntReserve;
    uint256 public usdtReserve;
    
    // Liquidity tracking
    uint256 public totalLiquidity;
    mapping(address => uint256) public liquidityBalance;
    
    // Fee: 0.3%
    uint256 public constant FEE_PERCENT = 30;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    event LiquidityAdded(address indexed provider, uint256 mntAmount, uint256 usdtAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 mntAmount, uint256 usdtAmount, uint256 liquidity);
    event Swap(address indexed user, bool mntToUsdt, uint256 amountIn, uint256 amountOut);

    constructor(address _usdt) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT address");
        usdt = IERC20(_usdt);
    }

    /**
     * @dev Thêm liquidity vào pool
     * @param usdtAmount Số lượng USDT
     */
    function addLiquidity(uint256 usdtAmount) external payable nonReentrant {
        require(msg.value > 0, "Must provide MNT");
        require(usdtAmount > 0, "Must provide USDT");

        uint256 liquidity;
        
        if (totalLiquidity == 0) {
            // First liquidity provider
            liquidity = msg.value; // Use MNT amount as initial liquidity
            mntReserve = msg.value;
            usdtReserve = usdtAmount;
        } else {
            // Subsequent providers: maintain price ratio
            uint256 mntLiquidity = (msg.value * totalLiquidity) / mntReserve;
            uint256 usdtLiquidity = (usdtAmount * totalLiquidity) / usdtReserve;
            
            // Use the smaller to maintain balance
            liquidity = mntLiquidity < usdtLiquidity ? mntLiquidity : usdtLiquidity;
            
            uint256 requiredUsdt = (msg.value * usdtReserve) / mntReserve;
            require(usdtAmount >= requiredUsdt, "Insufficient USDT for ratio");
            
            mntReserve += msg.value;
            usdtReserve += requiredUsdt;
            
            // Refund excess USDT
            if (usdtAmount > requiredUsdt) {
                usdt.safeTransfer(msg.sender, usdtAmount - requiredUsdt);
            }
            usdtAmount = requiredUsdt;
        }
        
        totalLiquidity += liquidity;
        liquidityBalance[msg.sender] += liquidity;
        
        // Transfer USDT to contract
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        
        emit LiquidityAdded(msg.sender, msg.value, usdtAmount, liquidity);
    }

    /**
     * @dev Remove liquidity
     * @param liquidity Liquidity tokens to burn
     */
    function removeLiquidity(uint256 liquidity) external nonReentrant {
        require(liquidity > 0, "Invalid liquidity");
        require(liquidityBalance[msg.sender] >= liquidity, "Insufficient liquidity");
        
        uint256 mntAmount = (liquidity * mntReserve) / totalLiquidity;
        uint256 usdtAmount = (liquidity * usdtReserve) / totalLiquidity;
        
        liquidityBalance[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;
        mntReserve -= mntAmount;
        usdtReserve -= usdtAmount;
        
        // Transfer tokens back
        usdt.safeTransfer(msg.sender, usdtAmount);
        (bool success, ) = msg.sender.call{value: mntAmount}("");
        require(success, "MNT transfer failed");
        
        emit LiquidityRemoved(msg.sender, mntAmount, usdtAmount, liquidity);
    }

    /**
     * @dev Swap MNT cho USDT
     * @param minUsdtOut Minimum USDT to receive
     */
    function swapMntForUsdt(uint256 minUsdtOut) external payable nonReentrant {
        require(msg.value > 0, "Must send MNT");
        require(mntReserve > 0 && usdtReserve > 0, "No liquidity");
        
        uint256 usdtOut = getAmountOut(msg.value, mntReserve, usdtReserve);
        require(usdtOut >= minUsdtOut, "Slippage too high");
        require(usdtOut < usdtReserve, "Insufficient liquidity");
        
        mntReserve += msg.value;
        usdtReserve -= usdtOut;
        
        usdt.safeTransfer(msg.sender, usdtOut);
        
        emit Swap(msg.sender, true, msg.value, usdtOut);
    }

    /**
     * @dev Swap USDT cho MNT
     * @param usdtAmount USDT to swap
     * @param minMntOut Minimum MNT to receive
     */
    function swapUsdtForMnt(uint256 usdtAmount, uint256 minMntOut) external nonReentrant {
        require(usdtAmount > 0, "Must send USDT");
        require(mntReserve > 0 && usdtReserve > 0, "No liquidity");
        
        uint256 mntOut = getAmountOut(usdtAmount, usdtReserve, mntReserve);
        require(mntOut >= minMntOut, "Slippage too high");
        require(mntOut < mntReserve, "Insufficient liquidity");
        
        usdtReserve += usdtAmount;
        mntReserve -= mntOut;
        
        usdt.safeTransferFrom(msg.sender, address(this), usdtAmount);
        (bool success, ) = msg.sender.call{value: mntOut}("");
        require(success, "MNT transfer failed");
        
        emit Swap(msg.sender, false, usdtAmount, mntOut);
    }

    /**
     * @dev Calculate output amount with 0.3% fee
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256) 
    {
        require(amountIn > 0, "Invalid input");
        require(reserveIn > 0 && reserveOut > 0, "Invalid reserves");
        
        // Apply 0.3% fee
        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;
        
        return numerator / denominator;
    }

    /**
     * @dev Get current price: MNT per USDT
     */
    function getPrice() external view returns (uint256 mntPerUsdt, uint256 usdtPerMnt) {
        require(mntReserve > 0 && usdtReserve > 0, "No liquidity");
        
        // Price với 6 decimals (USDT decimals)
        mntPerUsdt = (mntReserve * 1e6) / usdtReserve;
        usdtPerMnt = (usdtReserve * 1e18) / mntReserve;
    }

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw() external onlyOwner {
        uint256 usdtBal = usdt.balanceOf(address(this));
        if (usdtBal > 0) {
            usdt.safeTransfer(owner(), usdtBal);
        }
        
        uint256 mntBal = address(this).balance;
        if (mntBal > 0) {
            (bool success, ) = owner().call{value: mntBal}("");
            require(success, "Transfer failed");
        }
    }

    receive() external payable {}
}
