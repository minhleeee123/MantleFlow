// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title ReferralRewards
 * @dev Referral program với multi-level commission
 * @notice Users nhận rewards khi giới thiệu người khác stake/deposit
 */
contract ReferralRewards is Ownable, ReentrancyGuard {
    
    // Commission rates (basis points)
    uint256 public level1Commission = 500;  // 5% cho người giới thiệu trực tiếp
    uint256 public level2Commission = 200;  // 2% cho level 2
    uint256 public level3Commission = 100;  // 1% cho level 3
    uint256 public constant COMMISSION_DENOMINATOR = 10000;

    struct Referrer {
        address referrer;           // Người đã giới thiệu
        uint256 totalReferred;      // Tổng số người đã giới thiệu
        uint256 totalEarned;        // Tổng rewards đã nhận
        uint256 pendingRewards;     // Rewards chưa claim
    }

    mapping(address => Referrer) public referrers;
    mapping(address => address[]) public referredUsers; // Danh sách người được giới thiệu
    
    uint256 public totalReferrals;
    uint256 public totalRewardsDistributed;

    // Events
    event ReferralRegistered(address indexed user, address indexed referrer);
    event RewardEarned(address indexed referrer, address indexed user, uint256 amount, uint256 level);
    event RewardClaimed(address indexed user, uint256 amount);
    event CommissionRatesUpdated(uint256 level1, uint256 level2, uint256 level3);

    constructor() Ownable(msg.sender) {}

    // ============ Registration ============

    /**
     * @dev Register với referral code (address của người giới thiệu)
     */
    function registerReferral(address referrerAddress) external {
        require(referrerAddress != address(0), "Invalid referrer");
        require(referrerAddress != msg.sender, "Cannot refer yourself");
        require(referrers[msg.sender].referrer == address(0), "Already registered");

        referrers[msg.sender].referrer = referrerAddress;
        referrers[referrerAddress].totalReferred++;
        referredUsers[referrerAddress].push(msg.sender);
        totalReferrals++;

        emit ReferralRegistered(msg.sender, referrerAddress);
    }

    /**
     * @dev Check nếu user đã có referrer
     */
    function hasReferrer(address user) public view returns (bool) {
        return referrers[user].referrer != address(0);
    }

    // ============ Reward Distribution ============

    /**
     * @dev Distribute referral rewards (được gọi bởi các contracts khác)
     * @param user User thực hiện action (stake/deposit)
     * @param amount Số lượng action
     */
    function distributeRewards(address user, uint256 amount) external payable nonReentrant {
        require(msg.value > 0, "Must send rewards");
        
        address level1 = referrers[user].referrer;
        if (level1 == address(0)) return; // Không có referrer

        // Level 1 Commission
        uint256 level1Reward = (amount * level1Commission) / COMMISSION_DENOMINATOR;
        if (level1Reward > 0 && msg.value >= level1Reward) {
            referrers[level1].pendingRewards += level1Reward;
            referrers[level1].totalEarned += level1Reward;
            emit RewardEarned(level1, user, level1Reward, 1);
        }

        // Level 2 Commission
        address level2 = referrers[level1].referrer;
        if (level2 != address(0)) {
            uint256 level2Reward = (amount * level2Commission) / COMMISSION_DENOMINATOR;
            if (level2Reward > 0 && msg.value >= level1Reward + level2Reward) {
                referrers[level2].pendingRewards += level2Reward;
                referrers[level2].totalEarned += level2Reward;
                emit RewardEarned(level2, user, level2Reward, 2);
            }

            // Level 3 Commission
            address level3 = referrers[level2].referrer;
            if (level3 != address(0)) {
                uint256 level3Reward = (amount * level3Commission) / COMMISSION_DENOMINATOR;
                if (level3Reward > 0 && msg.value >= level1Reward + level2Reward + level3Reward) {
                    referrers[level3].pendingRewards += level3Reward;
                    referrers[level3].totalEarned += level3Reward;
                    emit RewardEarned(level3, user, level3Reward, 3);
                }
            }
        }

        totalRewardsDistributed += msg.value;
    }

    /**
     * @dev Claim pending rewards
     */
    function claimRewards() external nonReentrant {
        uint256 pending = referrers[msg.sender].pendingRewards;
        require(pending > 0, "No pending rewards");
        require(address(this).balance >= pending, "Insufficient contract balance");

        referrers[msg.sender].pendingRewards = 0;

        (bool success, ) = msg.sender.call{value: pending}("");
        require(success, "Transfer failed");

        emit RewardClaimed(msg.sender, pending);
    }

    // ============ View Functions ============

    /**
     * @dev Get user referral info
     */
    function getUserInfo(address user) 
        external 
        view 
        returns (
            address referrer,
            uint256 totalReferred,
            uint256 totalEarned,
            uint256 pendingRewards,
            address[] memory referred
        ) 
    {
        Referrer memory ref = referrers[user];
        return (
            ref.referrer,
            ref.totalReferred,
            ref.totalEarned,
            ref.pendingRewards,
            referredUsers[user]
        );
    }

    /**
     * @dev Get referral chain (3 levels)
     */
    function getReferralChain(address user) 
        external 
        view 
        returns (address level1, address level2, address level3) 
    {
        level1 = referrers[user].referrer;
        if (level1 != address(0)) {
            level2 = referrers[level1].referrer;
            if (level2 != address(0)) {
                level3 = referrers[level2].referrer;
            }
        }
    }

    /**
     * @dev Get total referral statistics
     */
    function getStats() 
        external 
        view 
        returns (
            uint256 _totalReferrals,
            uint256 _totalRewardsDistributed,
            uint256 contractBalance
        ) 
    {
        return (
            totalReferrals,
            totalRewardsDistributed,
            address(this).balance
        );
    }

    /**
     * @dev Get commission rates
     */
    function getCommissionRates() 
        external 
        view 
        returns (uint256 level1, uint256 level2, uint256 level3) 
    {
        return (level1Commission, level2Commission, level3Commission);
    }

    // ============ Admin Functions ============

    /**
     * @dev Update commission rates
     */
    function setCommissionRates(uint256 _level1, uint256 _level2, uint256 _level3) 
        external 
        onlyOwner 
    {
        require(_level1 <= 1000, "Level 1 too high"); // Max 10%
        require(_level2 <= 500, "Level 2 too high");  // Max 5%
        require(_level3 <= 300, "Level 3 too high");  // Max 3%

        level1Commission = _level1;
        level2Commission = _level2;
        level3Commission = _level3;

        emit CommissionRatesUpdated(_level1, _level2, _level3);
    }

    /**
     * @dev Deposit rewards pool (owner)
     */
    function depositRewardsPool() external payable onlyOwner {
        require(msg.value > 0, "Must send MNT");
    }

    /**
     * @dev Emergency withdraw
     */
    function emergencyWithdraw(uint256 amount) external onlyOwner {
        require(amount <= address(this).balance, "Insufficient balance");
        (bool success, ) = owner().call{value: amount}("");
        require(success, "Transfer failed");
    }

    // Receive MNT
    receive() external payable {}
}
