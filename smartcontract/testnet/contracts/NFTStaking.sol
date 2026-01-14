// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title NFTStaking
 * @dev Stake NFTs để nhận rewards theo thời gian
 * @notice Support multiple NFT collections với different reward rates
 */
contract NFTStaking is Ownable, ReentrancyGuard, Pausable, ERC721Holder {
    using SafeERC20 for IERC20;

    IERC20 public immutable rewardsToken; // USDT rewards

    struct StakedNFT {
        address nftContract;
        uint256 tokenId;
        uint256 stakedAt;
        uint256 lastClaimTime;
        uint256 accruedRewards;
    }

    struct NFTCollection {
        bool isSupported;
        uint256 rewardRate; // Rewards per day (với 6 decimals cho USDT)
        uint256 totalStaked;
    }

    // NFT collections supported
    mapping(address => NFTCollection) public nftCollections;
    
    // User stakes: user => nft contract => token id => stake info
    mapping(address => mapping(address => mapping(uint256 => StakedNFT))) public stakes;
    
    // User's staked NFTs list
    mapping(address => address[]) public userNFTContracts;
    mapping(address => mapping(address => uint256[])) public userStakedTokenIds;

    uint256 public totalNFTsStaked;
    uint256 public totalRewardsDistributed;

    // Events
    event NFTStaked(address indexed user, address indexed nftContract, uint256 tokenId);
    event NFTUnstaked(address indexed user, address indexed nftContract, uint256 tokenId);
    event RewardsClaimed(address indexed user, uint256 amount);
    event CollectionAdded(address indexed nftContract, uint256 rewardRate);
    event CollectionUpdated(address indexed nftContract, uint256 newRewardRate);

    constructor(address _rewardsToken) Ownable(msg.sender) {
        require(_rewardsToken != address(0), "Invalid token");
        rewardsToken = IERC20(_rewardsToken);
    }

    // ============ Staking Functions ============

    /**
     * @dev Stake NFT
     */
    function stakeNFT(address nftContract, uint256 tokenId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(nftCollections[nftContract].isSupported, "Collection not supported");
        require(stakes[msg.sender][nftContract][tokenId].stakedAt == 0, "Already staked");

        IERC721 nft = IERC721(nftContract);
        require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");

        stakes[msg.sender][nftContract][tokenId] = StakedNFT({
            nftContract: nftContract,
            tokenId: tokenId,
            stakedAt: block.timestamp,
            lastClaimTime: block.timestamp,
            accruedRewards: 0
        });

        // Add to user's list
        if (userStakedTokenIds[msg.sender][nftContract].length == 0) {
            userNFTContracts[msg.sender].push(nftContract);
        }
        userStakedTokenIds[msg.sender][nftContract].push(tokenId);

        nftCollections[nftContract].totalStaked++;
        totalNFTsStaked++;

        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        emit NFTStaked(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Stake multiple NFTs
     */
    function stakeMultipleNFTs(address nftContract, uint256[] calldata tokenIds) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(nftCollections[nftContract].isSupported, "Collection not supported");
        
        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(stakes[msg.sender][nftContract][tokenId].stakedAt == 0, "Already staked");

            IERC721 nft = IERC721(nftContract);
            require(nft.ownerOf(tokenId) == msg.sender, "Not token owner");

            stakes[msg.sender][nftContract][tokenId] = StakedNFT({
                nftContract: nftContract,
                tokenId: tokenId,
                stakedAt: block.timestamp,
                lastClaimTime: block.timestamp,
                accruedRewards: 0
            });

            if (i == 0 && userStakedTokenIds[msg.sender][nftContract].length == 0) {
                userNFTContracts[msg.sender].push(nftContract);
            }
            userStakedTokenIds[msg.sender][nftContract].push(tokenId);

            nft.safeTransferFrom(msg.sender, address(this), tokenId);
            emit NFTStaked(msg.sender, nftContract, tokenId);
        }

        nftCollections[nftContract].totalStaked += tokenIds.length;
        totalNFTsStaked += tokenIds.length;
    }

    /**
     * @dev Unstake NFT và claim rewards
     */
    function unstakeNFT(address nftContract, uint256 tokenId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        StakedNFT storage stakedNFT = stakes[msg.sender][nftContract][tokenId];
        require(stakedNFT.stakedAt > 0, "NFT not staked");

        // Calculate và claim rewards
        uint256 rewards = calculatePendingRewards(msg.sender, nftContract, tokenId);
        if (rewards > 0) {
            stakedNFT.accruedRewards += rewards;
            _claimRewards(msg.sender, nftContract, tokenId);
        }

        // Remove from user's list
        _removeFromUserList(msg.sender, nftContract, tokenId);

        nftCollections[nftContract].totalStaked--;
        totalNFTsStaked--;

        delete stakes[msg.sender][nftContract][tokenId];

        IERC721(nftContract).safeTransferFrom(address(this), msg.sender, tokenId);

        emit NFTUnstaked(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Claim rewards cho 1 NFT
     */
    function claimRewards(address nftContract, uint256 tokenId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        StakedNFT storage stakedNFT = stakes[msg.sender][nftContract][tokenId];
        require(stakedNFT.stakedAt > 0, "NFT not staked");

        uint256 rewards = calculatePendingRewards(msg.sender, nftContract, tokenId);
        require(rewards > 0, "No rewards to claim");

        stakedNFT.accruedRewards += rewards;
        _claimRewards(msg.sender, nftContract, tokenId);
    }

    /**
     * @dev Claim rewards cho tất cả NFTs
     */
    function claimAllRewards() external nonReentrant whenNotPaused {
        uint256 totalRewards = 0;

        address[] memory contracts = userNFTContracts[msg.sender];
        for (uint256 i = 0; i < contracts.length; i++) {
            address nftContract = contracts[i];
            uint256[] memory tokenIds = userStakedTokenIds[msg.sender][nftContract];
            
            for (uint256 j = 0; j < tokenIds.length; j++) {
                uint256 tokenId = tokenIds[j];
                StakedNFT storage stakedNFT = stakes[msg.sender][nftContract][tokenId];
                
                if (stakedNFT.stakedAt > 0) {
                    uint256 rewards = calculatePendingRewards(msg.sender, nftContract, tokenId);
                    if (rewards > 0) {
                        stakedNFT.accruedRewards += rewards;
                        stakedNFT.lastClaimTime = block.timestamp;
                        totalRewards += stakedNFT.accruedRewards;
                        stakedNFT.accruedRewards = 0;
                    }
                }
            }
        }

        require(totalRewards > 0, "No rewards to claim");
        require(rewardsToken.balanceOf(address(this)) >= totalRewards, "Insufficient rewards");

        totalRewardsDistributed += totalRewards;
        rewardsToken.safeTransfer(msg.sender, totalRewards);

        emit RewardsClaimed(msg.sender, totalRewards);
    }

    // ============ Internal Functions ============

    function _claimRewards(address user, address nftContract, uint256 tokenId) internal {
        StakedNFT storage stakedNFT = stakes[user][nftContract][tokenId];
        uint256 amount = stakedNFT.accruedRewards;

        if (amount > 0) {
            require(rewardsToken.balanceOf(address(this)) >= amount, "Insufficient rewards");
            
            stakedNFT.accruedRewards = 0;
            stakedNFT.lastClaimTime = block.timestamp;
            totalRewardsDistributed += amount;

            rewardsToken.safeTransfer(user, amount);
            emit RewardsClaimed(user, amount);
        }
    }

    function _removeFromUserList(address user, address nftContract, uint256 tokenId) internal {
        uint256[] storage tokenIds = userStakedTokenIds[user][nftContract];
        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (tokenIds[i] == tokenId) {
                tokenIds[i] = tokenIds[tokenIds.length - 1];
                tokenIds.pop();
                break;
            }
        }
    }

    // ============ View Functions ============

    /**
     * @dev Calculate pending rewards
     */
    function calculatePendingRewards(address user, address nftContract, uint256 tokenId) 
        public 
        view 
        returns (uint256) 
    {
        StakedNFT memory stakedNFT = stakes[user][nftContract][tokenId];
        if (stakedNFT.stakedAt == 0) return 0;

        uint256 rewardRate = nftCollections[nftContract].rewardRate;
        uint256 duration = block.timestamp - stakedNFT.lastClaimTime;
        
        return (rewardRate * duration) / 1 days;
    }

    /**
     * @dev Get user's total pending rewards
     */
    function getUserTotalPendingRewards(address user) external view returns (uint256 total) {
        address[] memory contracts = userNFTContracts[user];
        for (uint256 i = 0; i < contracts.length; i++) {
            address nftContract = contracts[i];
            uint256[] memory tokenIds = userStakedTokenIds[user][nftContract];
            
            for (uint256 j = 0; j < tokenIds.length; j++) {
                total += calculatePendingRewards(user, nftContract, tokenIds[j]);
                total += stakes[user][nftContract][tokenIds[j]].accruedRewards;
            }
        }
    }

    /**
     * @dev Get user's staked NFTs
     */
    function getUserStakedNFTs(address user) 
        external 
        view 
        returns (address[] memory nftContracts, uint256[][] memory tokenIds) 
    {
        nftContracts = userNFTContracts[user];
        tokenIds = new uint256[][](nftContracts.length);
        
        for (uint256 i = 0; i < nftContracts.length; i++) {
            tokenIds[i] = userStakedTokenIds[user][nftContracts[i]];
        }
    }

    // ============ Admin Functions ============

    /**
     * @dev Add NFT collection
     */
    function addNFTCollection(address nftContract, uint256 rewardRate) external onlyOwner {
        require(nftContract != address(0), "Invalid address");
        require(!nftCollections[nftContract].isSupported, "Already added");

        nftCollections[nftContract] = NFTCollection({
            isSupported: true,
            rewardRate: rewardRate,
            totalStaked: 0
        });

        emit CollectionAdded(nftContract, rewardRate);
    }

    /**
     * @dev Update reward rate
     */
    function updateRewardRate(address nftContract, uint256 newRate) external onlyOwner {
        require(nftCollections[nftContract].isSupported, "Collection not supported");
        
        nftCollections[nftContract].rewardRate = newRate;
        emit CollectionUpdated(nftContract, newRate);
    }

    /**
     * @dev Deposit rewards
     */
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
