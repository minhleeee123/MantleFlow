// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title AutoCompoundStaking
 * @dev Staking với tự động compound rewards
 * @notice Rewards tự động được reinvest vào stake
 */
contract AutoCompoundStaking is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable stakingToken;
    IERC20 public immutable rewardsToken;

    struct StakeInfo {
        uint256 amount;
        uint256 startTime;
        uint256 lastCompoundTime;
        uint256 totalCompounded;
        uint256 manualRewardsClaimed;
        bool autoCompound;
    }

    mapping(address => StakeInfo) public stakes;

    uint256 public totalStaked;
    uint256 public totalCompounded;
    uint256 public apr = 1200; // 12% APR
    uint256 public minStakeAmount = 1e6; // 1 USDT

    // Auto-compound settings
    uint256 public compoundFrequency = 1 days; // Compound mỗi ngày
    uint256 public compoundBonus = 200; // 2% bonus cho auto-compound

    // Events
    event Staked(address indexed user, uint256 amount, bool autoCompound);
    event Unstaked(address indexed user, uint256 amount, uint256 rewards);
    event Compounded(address indexed user, uint256 rewards);
    event AutoCompoundToggled(address indexed user, bool enabled);
    event ManualRewardsClaimed(address indexed user, uint256 amount);

    constructor(address _stakingToken, address _rewardsToken) Ownable(msg.sender) {
        require(_stakingToken != address(0) && _rewardsToken != address(0), "Invalid tokens");
        stakingToken = IERC20(_stakingToken);
        rewardsToken = IERC20(_rewardsToken);
    }

    // ============ Staking Functions ============

    /**
     * @dev Stake với option auto-compound
     */
    function stake(uint256 amount, bool enableAutoCompound) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(amount >= minStakeAmount, "Amount below minimum");

        StakeInfo storage userStake = stakes[msg.sender];

        // Nếu đã có stake, compound/claim trước
        if (userStake.amount > 0) {
            if (userStake.autoCompound) {
                _autoCompound(msg.sender);
            } else {
                _accrueRewards(msg.sender);
            }
        } else {
            // New stake
            userStake.startTime = block.timestamp;
            userStake.lastCompoundTime = block.timestamp;
            userStake.autoCompound = enableAutoCompound;
        }

        userStake.amount += amount;
        totalStaked += amount;

        stakingToken.safeTransferFrom(msg.sender, address(this), amount);

        emit Staked(msg.sender, amount, enableAutoCompound);
    }

    /**
     * @dev Toggle auto-compound on/off
     */
    function toggleAutoCompound() external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");

        // Process pending rewards trước
        if (userStake.autoCompound) {
            _autoCompound(msg.sender);
        } else {
            _accrueRewards(msg.sender);
        }

        userStake.autoCompound = !userStake.autoCompound;
        userStake.lastCompoundTime = block.timestamp;

        emit AutoCompoundToggled(msg.sender, userStake.autoCompound);
    }

    /**
     * @dev Manual compound (ai cũng có thể gọi)
     */
    function compound() external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");
        require(userStake.autoCompound, "Auto-compound not enabled");

        _autoCompound(msg.sender);
    }

    /**
     * @dev Unstake và claim tất cả rewards
     */
    function unstake(uint256 amount) external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount >= amount, "Insufficient stake");

        // Calculate rewards
        uint256 rewards;
        if (userStake.autoCompound) {
            _autoCompound(msg.sender);
            rewards = 0; // Đã compound rồi
        } else {
            rewards = calculateRewards(msg.sender);
        }

        userStake.amount -= amount;
        totalStaked -= amount;

        // Transfer stake back
        stakingToken.safeTransfer(msg.sender, amount);

        // Transfer rewards if any
        if (rewards > 0) {
            require(rewardsToken.balanceOf(address(this)) >= rewards, "Insufficient rewards");
            rewardsToken.safeTransfer(msg.sender, rewards);
            userStake.manualRewardsClaimed += rewards;
        }

        // Reset if unstaked all
        if (userStake.amount == 0) {
            delete stakes[msg.sender];
        } else {
            userStake.lastCompoundTime = block.timestamp;
        }

        emit Unstaked(msg.sender, amount, rewards);
    }

    /**
     * @dev Claim rewards (chỉ cho non-auto-compound)
     */
    function claimRewards() external nonReentrant whenNotPaused {
        StakeInfo storage userStake = stakes[msg.sender];
        require(userStake.amount > 0, "No active stake");
        require(!userStake.autoCompound, "Auto-compound enabled");

        uint256 rewards = calculateRewards(msg.sender);
        require(rewards > 0, "No rewards");
        require(rewardsToken.balanceOf(address(this)) >= rewards, "Insufficient rewards");

        userStake.lastCompoundTime = block.timestamp;
        userStake.manualRewardsClaimed += rewards;

        rewardsToken.safeTransfer(msg.sender, rewards);

        emit ManualRewardsClaimed(msg.sender, rewards);
    }

    // ============ Internal Functions ============

    function _autoCompound(address user) internal {
        StakeInfo storage userStake = stakes[user];
        
        uint256 rewards = calculateRewardsWithBonus(user);
        if (rewards == 0) return;

        // Check if enough time has passed
        if (block.timestamp < userStake.lastCompoundTime + compoundFrequency) {
            return;
        }

        // Add rewards to stake
        userStake.amount += rewards;
        userStake.totalCompounded += rewards;
        userStake.lastCompoundTime = block.timestamp;
        totalStaked += rewards;
        totalCompounded += rewards;

        emit Compounded(user, rewards);
    }

    function _accrueRewards(address user) internal {
        StakeInfo storage userStake = stakes[user];
        uint256 rewards = calculateRewards(user);
        
        if (rewards > 0) {
            userStake.lastCompoundTime = block.timestamp;
        }
    }

    // ============ View Functions ============

    /**
     * @dev Calculate rewards (standard APR)
     */
    function calculateRewards(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 duration = block.timestamp - userStake.lastCompoundTime;
        return (userStake.amount * apr * duration) / (365 days * 10000);
    }

    /**
     * @dev Calculate rewards với bonus (cho auto-compound)
     */
    function calculateRewardsWithBonus(address user) public view returns (uint256) {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        uint256 duration = block.timestamp - userStake.lastCompoundTime;
        uint256 effectiveAPR = apr + compoundBonus;
        return (userStake.amount * effectiveAPR * duration) / (365 days * 10000);
    }

    /**
     * @dev Get projected value after time (với auto-compound)
     */
    function getProjectedValue(address user, uint256 daysAhead) 
        external 
        view 
        returns (uint256 projected) 
    {
        StakeInfo memory userStake = stakes[user];
        if (userStake.amount == 0) return 0;

        if (!userStake.autoCompound) {
            // Simple interest
            uint256 rewards = (userStake.amount * apr * daysAhead) / (365 * 10000);
            return userStake.amount + rewards;
        } else {
            // Compound interest (daily compounding)
            projected = userStake.amount;
            uint256 dailyRate = (apr + compoundBonus) * 1e18 / (365 * 10000);
            
            for (uint256 i = 0; i < daysAhead; i++) {
                projected = projected + (projected * dailyRate / 1e18);
            }
        }
    }

    /**
     * @dev Get user stake info
     */
    function getUserInfo(address user) 
        external 
        view 
        returns (
            uint256 stakedAmount,
            uint256 pendingRewards,
            uint256 totalCompounded,
            uint256 manualClaimed,
            bool autoCompoundEnabled,
            uint256 stakingDuration
        ) 
    {
        StakeInfo memory userStake = stakes[user];
        
        uint256 rewards = userStake.autoCompound 
            ? calculateRewardsWithBonus(user)
            : calculateRewards(user);

        return (
            userStake.amount,
            rewards,
            userStake.totalCompounded,
            userStake.manualRewardsClaimed,
            userStake.autoCompound,
            block.timestamp - userStake.startTime
        );
    }

    /**
     * @dev Get pool stats
     */
    function getPoolStats() 
        external 
        view 
        returns (
            uint256 _totalStaked,
            uint256 _totalCompounded,
            uint256 _apr,
            uint256 _compoundBonus,
            uint256 availableRewards
        ) 
    {
        return (
            totalStaked,
            totalCompounded,
            apr,
            compoundBonus,
            rewardsToken.balanceOf(address(this))
        );
    }

    // ============ Admin Functions ============

    function setAPR(uint256 newAPR) external onlyOwner {
        require(newAPR <= 50000, "APR too high");
        apr = newAPR;
    }

    function setCompoundBonus(uint256 newBonus) external onlyOwner {
        require(newBonus <= 1000, "Bonus too high"); // Max 10%
        compoundBonus = newBonus;
    }

    function setCompoundFrequency(uint256 newFrequency) external onlyOwner {
        require(newFrequency >= 1 hours, "Frequency too short");
        compoundFrequency = newFrequency;
    }

    function setMinStakeAmount(uint256 newAmount) external onlyOwner {
        minStakeAmount = newAmount;
    }

    function depositRewards(uint256 amount) external onlyOwner {
        require(amount > 0, "Invalid amount");
        rewardsToken.safeTransferFrom(msg.sender, address(this), amount);
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }
}
