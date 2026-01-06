// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title StakingRewards
 * @dev Contract cho phép user stake USDT và nhận rewards theo thời gian
 * @notice Rewards được tính theo APR và thời gian stake
 */
contract StakingRewards is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    // Token được stake
    IERC20 public immutable stakingToken;
    
    // Token dùng để trả rewards (có thể giống hoặc khác stakingToken)
    IERC20 public immutable rewardsToken;

    // Staking info
    struct StakeInfo {
        uint256 amount;           // Số lượng đã stake
        uint256 startTime;        // Thời gian bắt đầu stake
        uint256 lastClaimTime;    // Lần claim rewards cuối cùng
        uint256 totalRewardsClaimed; // Tổng rewards đã claim
    }

    // Mapping từ user address -> stake info
    mapping(address => StakeInfo) public stakes;

    // Pool statistics
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;

    // APR (Annual Percentage Rate) - basis points (10000 = 100%)
    // Ví dụ: 1200 = 12% APR
    uint256 public apr = 1200; // Default 12% APR

    // Minimum stake amount
    uint256 public minStakeAmount = 1e6; // 1 USDT (assuming 6 decimals)

    // Lock period (seconds) - thời gian tối thiểu phải stake
    uint256 public lockPeriod = 0; // 0 = no lock

    // Early withdrawal penalty (basis points)
    uint256 public earlyWithdrawalPenalty = 500; // 5%

    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 penalty, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount, uint256 timestamp);
    event AprUpdated(uint256 oldApr, uint256 newApr);
    event LockPeriodUpdated(uint256 oldPeriod, uint256 newPeriod);
    event MinStakeAmountUpdated(uint256 oldAmount, uint256 newAmount);
    event PenaltyUpdated(uint256 oldPenalty, uint256 newPenalty);
    event RewardsDeposited(uint256 amount);

    constructor(
        address _stakingToken,
        address _rewardsToken
    ) Ownable(msg.sender) {
        require(_stakingToken != address(0), "Invalid staking token");
        require(_rewardsToken != address(0), "Invalid rewards token");
        
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    // ============ Staking Functions ============

    /**
     * @dev Stake tokens
     * @param amount Số lượng token cần stake
     */
    function stake(uint256 amount) external nonReentrant whenNotPaused {
        require(amount >= minStakeAmount, "Amount below minimum");

        StakeInfo storage userStake = stakes[msg.sender];

        // Nếu đã có stake, claim rewards trước
        if (userStake.amount > 0) {
            _claimRewards(msg.sender);
        }

        // Transfer tokens từ user vào contract
        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        // Update stake info
        if (userStake.amount == 0) {
            userStake.startTime = block.timestamp;
            userStake.lastClaimTime = block.timestamp;
        }
        userStake.amount += amount;

        totalStaked += amount;

        emit Staked(msg.sender, amount, block.timestamp);
    }

    /**
     * @dev Unstake tokens
     * @param amount Số lượng token cần unstake
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient staked amount");
        require(amount > 0, "Amount must be greater than 0");

        // Claim rewards trước khi unstake
        _claimRewards(msg.sender);

        // Check lock period và tính penalty nếu cần
        uint256 amountToReturn = amount;
        uint256 penalty = 0;

        if (block.timestamp < userStake.startTime + lockPeriod) {
            penalty = (amount * earlyWithdrawalPenalty) / 10000;
            amountToReturn = amount - penalty;
        }

        // Update stake info
        userStake.amount -= amount;
        totalStaked -= amount;

        // Reset start time nếu unstake hết
        if (userStake.amount == 0) {
            userStake.startTime = 0;
            userStake.lastClaimTime = 0;
        }

        // Transfer tokens về user
        stakingToken.safeTransfer(msg.sender, amountToReturn);

        // Transfer penalty về owner nếu có
        if (penalty > 0) {
            stakingToken.safeTransfer(owner(), penalty);
        }

        emit Unstaked(msg.sender, amount, penalty, block.timestamp);
    }

    /**
     * @dev Unstake toàn bộ tokens
     */
    function unstakeAll() external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        uint256 amount = userStake.amount;
        require(amount > 0, "No staked amount");

        // Claim rewards
        _claimRewards(msg.sender);

        // Check lock period
        uint256 amountToReturn = amount;
        uint256 penalty = 0;

        if (block.timestamp < userStake.startTime + lockPeriod) {
            penalty = (amount * earlyWithdrawalPenalty) / 10000;
            amountToReturn = amount - penalty;
        }

        // Reset stake info
        userStake.amount = 0;
        userStake.startTime = 0;
        userStake.lastClaimTime = 0;
        totalStaked -= amount;

        // Transfer tokens
        stakingToken.safeTransfer(msg.sender, amountToReturn);
        
        if (penalty > 0) {
            stakingToken.safeTransfer(owner(), penalty);
        }

        emit Unstaked(msg.sender, amount, penalty, block.timestamp);
    }

    /**
     * @dev Claim rewards
     */
    function claimRewards() external nonReentrant whenNotPaused {
        _claimRewards(msg.sender);
    }

    /**
     * @dev Internal function để claim rewards
     */
    function _claimRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];
        uint256 rewards = calculateRewards(user);

        if (rewards > 0) {
            require(
                rewardsToken.balanceOf(address(this)) >= rewards,
                "Insufficient rewards in pool"
            );

            userStake.lastClaimTime = block.timestamp;
            userStake.totalRewardsClaimed += rewards;
            totalRewardsDistributed += rewards;

            rewardsToken.safeTransfer(user, rewards);

            emit RewardsClaimed(user, rewards, block.timestamp);
        }
    }

    // ============ View Functions ============

    /**
     * @dev Tính rewards hiện tại của user
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        
        if (userStake.amount == 0) {
            return 0;
        }

        uint256 stakingDuration = block.timestamp - userStake.lastClaimTime;
        
        // APR calculation: (amount * apr * duration) / (365 days * 10000)
        uint256 rewards = (userStake.amount * apr * stakingDuration) / (365 days * 10000);
        
        return rewards;
    }

    /**
     * @dev Lấy thông tin stake của user
     */
    function getStakeInfo(address user) external view returns (
        uint256 amount,
        uint256 startTime,
        uint256 lastClaimTime,
        uint256 totalRewardsClaimed,
        uint256 pendingRewards,
        bool isLocked
    ) {
        StakeInfo memory userStake = stakes[user];
        return (
            userStake.amount,
            userStake.startTime,
            userStake.lastClaimTime,
            userStake.totalRewardsClaimed,
            calculateRewards(user),
            block.timestamp < userStake.startTime + lockPeriod
        );
    }

    /**
     * @dev Kiểm tra xem stake có bị lock không
     */
    function isStakeLocked(address user) public view returns (bool) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return false;
        return block.timestamp < userStake.startTime + lockPeriod;
    }

    /**
     * @dev Lấy pool statistics
     */
    function getPoolStats() external view returns (
        uint256 _totalStaked,
        uint256 _totalRewardsDistributed,
        uint256 _availableRewards,
        uint256 _apr
    ) {
        return (
            totalStaked,
            totalRewardsDistributed,
            rewardsToken.balanceOf(address(this)),
            apr
        );
    }

    // ============ Admin Functions ============

    /**
     * @dev Update APR
     */
    function setApr(uint256 newApr) external onlyOwner {
        require(newApr <= 50000, "APR too high"); // Max 500%
        uint256 oldApr = apr;
        apr = newApr;
        emit AprUpdated(oldApr, newApr);
    }

    /**
     * @dev Update lock period
     */
    function setLockPeriod(uint256 newPeriod) external onlyOwner {
        require(newPeriod <= 365 days, "Lock period too long");
        uint256 oldPeriod = lockPeriod;
        lockPeriod = newPeriod;
        emit LockPeriodUpdated(oldPeriod, newPeriod);
    }

    /**
     * @dev Update minimum stake amount
     */
    function setMinStakeAmount(uint256 newAmount) external onlyOwner {
        uint256 oldAmount = minStakeAmount;
        minStakeAmount = newAmount;
        emit MinStakeAmountUpdated(oldAmount, newAmount);
    }

    /**
     * @dev Update early withdrawal penalty
     */
    function setEarlyWithdrawalPenalty(uint256 newPenalty) external onlyOwner {
        require(newPenalty <= 2000, "Penalty too high"); // Max 20%
        uint256 oldPenalty = earlyWithdrawalPenalty;
        earlyWithdrawalPenalty = newPenalty;
        emit PenaltyUpdated(oldPenalty, newPenalty);
    }

    /**
     * @dev Deposit rewards vào pool
     */
    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Amount must be greater than 0");
        rewardsToken.safeTransferFrom(msg.sender, address(this), amount);
        emit RewardsDeposited(amount);
    }

    /**
     * @dev Emergency withdraw (chỉ owner, chỉ dùng khi khẩn cấp)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
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
}
