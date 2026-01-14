// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title MultiTokenVault
 * @dev Vault contract cho phép deposit và withdraw MNT (native token) và USDT
 * @notice Contract này quản lý deposits của users và tracking balances
 */
contract MultiTokenVault is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // USDT token address trên Mantle testnet
    IERC20 public immutable usdtToken;

    // Tracking balances
    mapping(address => uint256) public mntBalances;
    mapping(address => uint256) public usdtBalances;

    // Total deposits
    uint256 public totalMntDeposits;
    uint256 public totalUsdtDeposits;

    // Withdrawal limits (optional security feature)
    uint256 public maxMntWithdrawal = type(uint256).max;
    uint256 public maxUsdtWithdrawal = type(uint256).max;

    // Events
    event MntDeposited(address indexed user, uint256 amount, uint256 timestamp);
    event MntWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event UsdtDeposited(address indexed user, uint256 amount, uint256 timestamp);
    event UsdtWithdrawn(address indexed user, uint256 amount, uint256 timestamp);
    event WithdrawalLimitsUpdated(uint256 maxMnt, uint256 maxUsdt);
    event EmergencyWithdrawal(address indexed token, address indexed to, uint256 amount);

    constructor(address _usdtToken) Ownable(msg.sender) {
        require(_usdtToken != address(0), "Invalid USDT address");
        usdtToken = IERC20(_usdtToken);
    }

    // ============ MNT Functions ============

    /**
     * @dev Deposit MNT (native token) vào vault
     */
    function depositMnt() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Amount must be greater than 0");

        mntBalances[msg.sender] += msg.value;
        totalMntDeposits += msg.value;

        emit MntDeposited(msg.sender, msg.value, block.timestamp);
    }

    /**
     * @dev Withdraw MNT từ vault
     * @param amount Số lượng MNT cần withdraw
     */
    function withdrawMnt(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(mntBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount <= maxMntWithdrawal, "Exceeds withdrawal limit");

        mntBalances[msg.sender] -= amount;
        totalMntDeposits -= amount;

        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "MNT transfer failed");

        emit MntWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw toàn bộ MNT của user
     */
    function withdrawAllMnt() external nonReentrant whenNotPaused {
        uint256 balance = mntBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        require(balance <= maxMntWithdrawal, "Exceeds withdrawal limit");

        mntBalances[msg.sender] = 0;
        totalMntDeposits -= balance;

        (bool success, ) = msg.sender.call{value: balance}("");
        require(success, "MNT transfer failed");

        emit MntWithdrawn(msg.sender, balance, block.timestamp);
    }

    // ============ USDT Functions ============

    /**
     * @dev Deposit USDT vào vault
     * @param amount Số lượng USDT cần deposit
     */
    function depositUsdt(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");

        usdtBalances[msg.sender] += amount;
        totalUsdtDeposits += amount;

        usdtToken.safeTransferFrom(msg.sender, address(this), amount);

        emit UsdtDeposited(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw USDT từ vault
     * @param amount Số lượng USDT cần withdraw
     */
    function withdrawUsdt(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Amount must be greater than 0");
        require(usdtBalances[msg.sender] >= amount, "Insufficient balance");
        require(amount <= maxUsdtWithdrawal, "Exceeds withdrawal limit");

        usdtBalances[msg.sender] -= amount;
        totalUsdtDeposits -= amount;

        usdtToken.safeTransfer(msg.sender, amount);

        emit UsdtWithdrawn(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Withdraw toàn bộ USDT của user
     */
    function withdrawAllUsdt() external nonReentrant whenNotPaused {
        uint256 balance = usdtBalances[msg.sender];
        require(balance > 0, "No balance to withdraw");
        require(balance <= maxUsdtWithdrawal, "Exceeds withdrawal limit");

        usdtBalances[msg.sender] = 0;
        totalUsdtDeposits -= balance;

        usdtToken.safeTransfer(msg.sender, balance);

        emit UsdtWithdrawn(msg.sender, balance, block.timestamp);
    }

    // ============ View Functions ============

    /**
     * @dev Lấy balance MNT của user
     */
    function getMntBalance(address user) external view returns (uint256) {
        return mntBalances[user];
    }

    /**
     * @dev Lấy balance USDT của user
     */
    function getUsdtBalance(address user) external view returns (uint256) {
        return usdtBalances[user];
    }

    /**
     * @dev Lấy tổng MNT trong vault
     */
    function getTotalMntInVault() external view returns (uint256) {
        return address(this).balance;
    }

    /**
     * @dev Lấy tổng USDT trong vault
     */
    function getTotalUsdtInVault() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }

    // ============ Admin Functions ============

    /**
     * @dev Set withdrawal limits
     */
    function setWithdrawalLimits(uint256 _maxMnt, uint256 _maxUsdt) external onlyOwner {
        maxMntWithdrawal = _maxMnt;
        maxUsdtWithdrawal = _maxUsdt;
        emit WithdrawalLimitsUpdated(_maxMnt, _maxUsdt);
    }

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

    /**
     * @dev Emergency withdrawal by owner (chỉ dùng khi cần thiết)
     */
    function emergencyWithdrawMnt(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        (bool success, ) = to.call{value: amount}("");
        require(success, "Transfer failed");
        emit EmergencyWithdrawal(address(0), to, amount);
    }

    /**
     * @dev Emergency withdrawal USDT by owner
     */
    function emergencyWithdrawUsdt(address to, uint256 amount) external onlyOwner {
        require(to != address(0), "Invalid address");
        usdtToken.safeTransfer(to, amount);
        emit EmergencyWithdrawal(address(usdtToken), to, amount);
    }

    // Receive MNT
    receive() external payable {
        emit MntDeposited(msg.sender, msg.value, block.timestamp);
    }
}
