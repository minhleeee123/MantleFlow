// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

interface ISimpleDEXV2 {
    function swapMntForUsdt(uint256 minUsdtOut) external payable;
    function swapUsdtForMnt(uint256 usdtAmount, uint256 minMntOut) external;
    function getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256);
    function mntReserve() external view returns (uint256);
    function usdtReserve() external view returns (uint256);
}

/**
 * @title VaultWithSwap
 * @dev Vault với tích hợp swap qua DEX
 */
contract VaultWithSwap is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable usdt;
    ISimpleDEXV2 public dex;
    
    // User balances
    mapping(address => uint256) public mntBalances;
    mapping(address => uint256) public usdtBalances;
    
    // Stats
    uint256 public totalMntDeposited;
    uint256 public totalUsdtDeposited;
    
    // ============ Bot Authorization ============
    // Mapping: user => bot => authorized
    mapping(address => mapping(address => bool)) public userAuthorizedBots;
    
    event MntDeposited(address indexed user, uint256 amount);
    event MntWithdrawn(address indexed user, uint256 amount);
    event UsdtDeposited(address indexed user, uint256 amount);
    event UsdtWithdrawn(address indexed user, uint256 amount);
    event Swapped(address indexed user, bool mntToUsdt, uint256 amountIn, uint256 amountOut);
    event BotAuthorized(address indexed user, address indexed bot, bool status);
    event SwappedByBot(address indexed user, address indexed bot, bool mntToUsdt, uint256 amountIn, uint256 amountOut);

    constructor(address _usdt, address _dex) Ownable(msg.sender) {
        require(_usdt != address(0), "Invalid USDT");
        require(_dex != address(0), "Invalid DEX");
        usdt = IERC20(_usdt);
        dex = ISimpleDEXV2(_dex);
    }

    // ============ Deposit Functions ============

    /**
     * @dev Deposit MNT vào vault
     */
    function depositMnt() external payable nonReentrant {
        require(msg.value > 0, "Must deposit MNT");
        
        mntBalances[msg.sender] += msg.value;
        totalMntDeposited += msg.value;
        
        emit MntDeposited(msg.sender, msg.value);
    }

    /**
     * @dev Deposit USDT vào vault
     * @param amount Số lượng USDT
     */
    function depositUsdt(uint256 amount) external nonReentrant {
        require(amount > 0, "Must deposit USDT");
        
        usdtBalances[msg.sender] += amount;
        totalUsdtDeposited += amount;
        
        usdt.safeTransferFrom(msg.sender, address(this), amount);
        
        emit UsdtDeposited(msg.sender, amount);
    }

    // ============ Withdraw Functions ============

    /**
     * @dev Rút MNT từ vault
     * @param amount Số lượng MNT muốn rút
     */
    function withdrawMnt(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(mntBalances[msg.sender] >= amount, "Insufficient balance");
        
        mntBalances[msg.sender] -= amount;
        totalMntDeposited -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "MNT transfer failed");
        
        emit MntWithdrawn(msg.sender, amount);
    }

    /**
     * @dev Rút USDT từ vault
     * @param amount Số lượng USDT muốn rút
     */
    function withdrawUsdt(uint256 amount) external nonReentrant {
        require(amount > 0, "Invalid amount");
        require(usdtBalances[msg.sender] >= amount, "Insufficient balance");
        
        usdtBalances[msg.sender] -= amount;
        totalUsdtDeposited -= amount;
        
        usdt.safeTransfer(msg.sender, amount);
        
        emit UsdtWithdrawn(msg.sender, amount);
    }

    // ============ Swap Functions ============

    /**
     * @dev Swap MNT trong vault thành USDT qua DEX
     * @param mntAmount Số lượng MNT muốn swap
     * @param minUsdtOut Minimum USDT to receive (slippage protection)
     */
    function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external nonReentrant {
        require(mntAmount > 0, "Invalid amount");
        require(mntBalances[msg.sender] >= mntAmount, "Insufficient MNT balance");
        
        // Trừ MNT balance
        mntBalances[msg.sender] -= mntAmount;
        totalMntDeposited -= mntAmount;
        
        // Get USDT balance trước swap
        uint256 usdtBefore = usdt.balanceOf(address(this));
        
        // Swap qua DEX
        dex.swapMntForUsdt{value: mntAmount}(minUsdtOut);
        
        // Tính USDT nhận được
        uint256 usdtAfter = usdt.balanceOf(address(this));
        uint256 usdtReceived = usdtAfter - usdtBefore;
        
        require(usdtReceived >= minUsdtOut, "Slippage too high");
        
        // Cộng USDT vào balance
        usdtBalances[msg.sender] += usdtReceived;
        totalUsdtDeposited += usdtReceived;
        
        emit Swapped(msg.sender, true, mntAmount, usdtReceived);
    }

    /**
     * @dev Swap USDT trong vault thành MNT qua DEX
     * @param usdtAmount Số lượng USDT muốn swap
     * @param minMntOut Minimum MNT to receive (slippage protection)
     */
    function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external nonReentrant {
        require(usdtAmount > 0, "Invalid amount");
        require(usdtBalances[msg.sender] >= usdtAmount, "Insufficient USDT balance");
        
        // Trừ USDT balance
        usdtBalances[msg.sender] -= usdtAmount;
        totalUsdtDeposited -= usdtAmount;
        
        // Get MNT balance trước swap
        uint256 mntBefore = address(this).balance;
        
        // Approve USDT cho DEX
        usdt.safeIncreaseAllowance(address(dex), usdtAmount);
        
        // Swap qua DEX
        dex.swapUsdtForMnt(usdtAmount, minMntOut);
        
        // Tính MNT nhận được
        uint256 mntAfter = address(this).balance;
        uint256 mntReceived = mntAfter - mntBefore;
        
        require(mntReceived >= minMntOut, "Slippage too high");
        
        // Cộng MNT vào balance
        mntBalances[msg.sender] += mntReceived;
        totalMntDeposited += mntReceived;
        
        emit Swapped(msg.sender, false, usdtAmount, mntReceived);
    }

    // ============ View Functions ============

    /**
     * @dev Get user's balances
     */
    function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt_) {
        mnt = mntBalances[user];
        usdt_ = usdtBalances[user];
    }

    /**
     * @dev Estimate swap output
     * @param mntToUsdt true = MNT->USDT, false = USDT->MNT
     * @param amountIn Input amount
     */
    function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256 amountOut) {
        uint256 mntReserve = dex.mntReserve();
        uint256 usdtReserve = dex.usdtReserve();
        
        if (mntToUsdt) {
            amountOut = dex.getAmountOut(amountIn, mntReserve, usdtReserve);
        } else {
            amountOut = dex.getAmountOut(amountIn, usdtReserve, mntReserve);
        }
    }

    /**
     * @dev Get total deposits
     */
    function getTotalDeposits() external view returns (uint256 mnt, uint256 usdt_) {
        mnt = totalMntDeposited;
        usdt_ = totalUsdtDeposited;
    }

    // ============ Admin Functions ============

    /**
     * @dev Update DEX address (owner only)
     */
    function setDex(address _dex) external onlyOwner {
        require(_dex != address(0), "Invalid DEX");
        dex = ISimpleDEXV2(_dex);
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

    // ============ Bot Authorization Functions ============

    /**
     * @dev User authorize bot to swap on their behalf
     * @param bot Bot address to authorize
     * @param status true = authorize, false = revoke
     */
    function authorizeBot(address bot, bool status) external {
        require(bot != address(0), "Invalid bot address");
        userAuthorizedBots[msg.sender][bot] = status;
        emit BotAuthorized(msg.sender, bot, status);
    }

    /**
     * @dev Check if bot is authorized by user
     */
    function isBotAuthorized(address user, address bot) external view returns (bool) {
        return userAuthorizedBots[user][bot];
    }

    // ============ Bot Swap Functions ============

    /**
     * @dev Bot swap MNT to USDT for user
     * @param user User address to swap for
     * @param mntAmount Amount of MNT to swap
     * @param minUsdtOut Minimum USDT to receive (slippage protection)
     */
    function executeSwapMntToUsdtForUser(
        address user,
        uint256 mntAmount,
        uint256 minUsdtOut
    ) external nonReentrant {
        require(userAuthorizedBots[user][msg.sender], "Bot not authorized");
        require(mntAmount > 0, "Invalid amount");
        require(mntBalances[user] >= mntAmount, "Insufficient MNT balance");
        
        // Trừ MNT balance của USER
        mntBalances[user] -= mntAmount;
        totalMntDeposited -= mntAmount;
        
        // Get USDT balance trước swap
        uint256 usdtBefore = usdt.balanceOf(address(this));
        
        // Swap qua DEX
        dex.swapMntForUsdt{value: mntAmount}(minUsdtOut);
        
        // Tính USDT nhận được
        uint256 usdtAfter = usdt.balanceOf(address(this));
        uint256 usdtReceived = usdtAfter - usdtBefore;
        
        require(usdtReceived >= minUsdtOut, "Slippage too high");
        
        // Cộng USDT vào balance của USER
        usdtBalances[user] += usdtReceived;
        totalUsdtDeposited += usdtReceived;
        
        emit SwappedByBot(user, msg.sender, true, mntAmount, usdtReceived);
        emit Swapped(user, true, mntAmount, usdtReceived);
    }

    /**
     * @dev Bot swap USDT to MNT for user
     * @param user User address to swap for
     * @param usdtAmount Amount of USDT to swap
     * @param minMntOut Minimum MNT to receive (slippage protection)
     */
    function executeSwapUsdtToMntForUser(
        address user,
        uint256 usdtAmount,
        uint256 minMntOut
    ) external nonReentrant {
        require(userAuthorizedBots[user][msg.sender], "Bot not authorized");
        require(usdtAmount > 0, "Invalid amount");
        require(usdtBalances[user] >= usdtAmount, "Insufficient USDT balance");
        
        // Trừ USDT balance của USER
        usdtBalances[user] -= usdtAmount;
        totalUsdtDeposited -= usdtAmount;
        
        // Get MNT balance trước swap
        uint256 mntBefore = address(this).balance;
        
        // Approve USDT cho DEX
        usdt.safeIncreaseAllowance(address(dex), usdtAmount);
        
        // Swap qua DEX
        dex.swapUsdtForMnt(usdtAmount, minMntOut);
        
        // Tính MNT nhận được
        uint256 mntAfter = address(this).balance;
        uint256 mntReceived = mntAfter - mntBefore;
        
        require(mntReceived >= minMntOut, "Slippage too high");
        
        // Cộng MNT vào balance của USER
        mntBalances[user] += mntReceived;
        totalMntDeposited += mntReceived;
        
        emit SwappedByBot(user, msg.sender, false, usdtAmount, mntReceived);
        emit Swapped(user, false, usdtAmount, mntReceived);
    }

    receive() external payable {}
}
