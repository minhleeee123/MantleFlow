// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title SimpleDEX
 * @dev Simple Automated Market Maker (AMM) để swap giữa MNT và USDT
 * @notice Sử dụng constant product formula: x * y = k
 */
contract SimpleDEX is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token; // USDT token
    
    // Liquidity pool reserves
    uint256 public mntReserve;
    uint256 public tokenReserve;
    
    // Liquidity providers
    mapping(address => uint256) public liquidityBalance;
    uint256 public totalLiquidity;
    
    // Swap fee: 0.3% (30 basis points)
    uint256 public constant FEE_PERCENT = 30;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // Events
    event LiquidityAdded(address indexed provider, uint256 mntAmount, uint256 tokenAmount, uint256 liquidity);
    event LiquidityRemoved(address indexed provider, uint256 mntAmount, uint256 tokenAmount, uint256 liquidity);
    event Swap(address indexed user, address indexed tokenIn, uint256 amountIn, uint256 amountOut);
    event FeeCollected(uint256 mntFee, uint256 tokenFee);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token address");
        token = IERC20(_token);
    }

    // ============ Liquidity Functions ============

    /**
     * @dev Thêm liquidity vào pool
     * @param tokenAmount Số lượng USDT muốn thêm
     */
    function addLiquidity(uint256 tokenAmount) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (uint256 liquidity) 
    {
        require(msg.value > 0, "Must send MNT");
        require(tokenAmount > 0, "Must send tokens");

        if (totalLiquidity == 0) {
            // First liquidity provider
            liquidity = sqrt(msg.value * tokenAmount);
            require(liquidity > 0, "Insufficient liquidity minted");
        } else {
            // Calculate liquidity based on ratio
            uint256 mntLiquidity = (msg.value * totalLiquidity) / mntReserve;
            uint256 tokenLiquidity = (tokenAmount * totalLiquidity) / tokenReserve;
            liquidity = mntLiquidity < tokenLiquidity ? mntLiquidity : tokenLiquidity;
        }

        require(liquidity > 0, "Insufficient liquidity minted");

        liquidityBalance[msg.sender] += liquidity;
        totalLiquidity += liquidity;

        mntReserve += msg.value;
        tokenReserve += tokenAmount;

        token.safeTransferFrom(msg.sender, address(this), tokenAmount);

        emit LiquidityAdded(msg.sender, msg.value, tokenAmount, liquidity);
    }

    /**
     * @dev Rút liquidity từ pool
     * @param liquidity Số lượng liquidity tokens cần rút
     */
    function removeLiquidity(uint256 liquidity) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 mntAmount, uint256 tokenAmount) 
    {
        require(liquidity > 0, "Invalid liquidity amount");
        require(liquidityBalance[msg.sender] >= liquidity, "Insufficient liquidity balance");

        mntAmount = (liquidity * mntReserve) / totalLiquidity;
        tokenAmount = (liquidity * tokenReserve) / totalLiquidity;

        require(mntAmount > 0 && tokenAmount > 0, "Insufficient liquidity burned");

        liquidityBalance[msg.sender] -= liquidity;
        totalLiquidity -= liquidity;

        mntReserve -= mntAmount;
        tokenReserve -= tokenAmount;

        (bool success, ) = msg.sender.call{value: mntAmount}("");
        require(success, "MNT transfer failed");
        
        token.safeTransfer(msg.sender, tokenAmount);

        emit LiquidityRemoved(msg.sender, mntAmount, tokenAmount, liquidity);
    }

    // ============ Swap Functions ============

    /**
     * @dev Swap MNT sang USDT
     * @param minTokenOut Số lượng USDT tối thiểu nhận được
     */
    function swapMntForToken(uint256 minTokenOut) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
        returns (uint256 tokenOut) 
    {
        require(msg.value > 0, "Must send MNT");
        require(tokenReserve > 0, "Insufficient liquidity");

        tokenOut = getAmountOut(msg.value, mntReserve, tokenReserve);
        require(tokenOut >= minTokenOut, "Slippage too high");
        require(tokenOut < tokenReserve, "Insufficient token reserve");

        mntReserve += msg.value;
        tokenReserve -= tokenOut;

        token.safeTransfer(msg.sender, tokenOut);

        emit Swap(msg.sender, address(0), msg.value, tokenOut);
    }

    /**
     * @dev Swap USDT sang MNT
     * @param tokenIn Số lượng USDT để swap
     * @param minMntOut Số lượng MNT tối thiểu nhận được
     */
    function swapTokenForMnt(uint256 tokenIn, uint256 minMntOut) 
        external 
        nonReentrant 
        whenNotPaused 
        returns (uint256 mntOut) 
    {
        require(tokenIn > 0, "Must send tokens");
        require(mntReserve > 0, "Insufficient liquidity");

        mntOut = getAmountOut(tokenIn, tokenReserve, mntReserve);
        require(mntOut >= minMntOut, "Slippage too high");
        require(mntOut < mntReserve, "Insufficient MNT reserve");

        tokenReserve += tokenIn;
        mntReserve -= mntOut;

        token.safeTransferFrom(msg.sender, address(this), tokenIn);
        
        (bool success, ) = msg.sender.call{value: mntOut}("");
        require(success, "MNT transfer failed");

        emit Swap(msg.sender, address(token), tokenIn, mntOut);
    }

    // ============ View Functions ============

    /**
     * @dev Tính amount out cho swap với fee 0.3%
     */
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) 
        public 
        pure 
        returns (uint256) 
    {
        require(amountIn > 0, "Invalid input amount");
        require(reserveIn > 0 && reserveOut > 0, "Insufficient liquidity");

        uint256 amountInWithFee = amountIn * (FEE_DENOMINATOR - FEE_PERCENT);
        uint256 numerator = amountInWithFee * reserveOut;
        uint256 denominator = (reserveIn * FEE_DENOMINATOR) + amountInWithFee;

        return numerator / denominator;
    }

    /**
     * @dev Get quote để swap MNT -> USDT
     */
    function getQuoteMntToToken(uint256 mntAmount) external view returns (uint256) {
        if (mntReserve == 0 || tokenReserve == 0) return 0;
        return getAmountOut(mntAmount, mntReserve, tokenReserve);
    }

    /**
     * @dev Get quote để swap USDT -> MNT
     */
    function getQuoteTokenToMnt(uint256 tokenAmount) external view returns (uint256) {
        if (mntReserve == 0 || tokenReserve == 0) return 0;
        return getAmountOut(tokenAmount, tokenReserve, mntReserve);
    }

    /**
     * @dev Get pool reserves
     */
    function getReserves() external view returns (uint256, uint256) {
        return (mntReserve, tokenReserve);
    }

    /**
     * @dev Get user liquidity info
     */
    function getUserLiquidity(address user) 
        external 
        view 
        returns (uint256 liquidity, uint256 mntShare, uint256 tokenShare) 
    {
        liquidity = liquidityBalance[user];
        if (totalLiquidity > 0) {
            mntShare = (liquidity * mntReserve) / totalLiquidity;
            tokenShare = (liquidity * tokenReserve) / totalLiquidity;
        }
    }

    /**
     * @dev Get current price (token per MNT)
     */
    function getPrice() external view returns (uint256) {
        if (mntReserve == 0) return 0;
        return (tokenReserve * 1e18) / mntReserve;
    }

    // ============ Admin Functions ============

    /**
     * @dev Pause contract
     */
    function pause() external onlyOwner {
        _pause();
    }

    /**
     * @dev Unpause contract
     */
    function unpause() external onlyOwner {
        _unpause();
    }

    // ============ Helper Functions ============

    /**
     * @dev Square root function (Babylonian method)
     */
    function sqrt(uint256 x) internal pure returns (uint256) {
        if (x == 0) return 0;
        uint256 z = (x + 1) / 2;
        uint256 y = x;
        while (z < y) {
            y = z;
            z = (x / z + z) / 2;
        }
        return y;
    }

    // Receive MNT
    receive() external payable {}
}
