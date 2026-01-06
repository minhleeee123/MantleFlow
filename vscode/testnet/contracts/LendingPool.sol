// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";

/**
 * @title LendingPool
 * @dev Lending và borrowing pool cho MNT và USDT
 * @notice Cho phép users deposit để earn interest và borrow với collateral
 */
contract LendingPool is Ownable, ReentrancyGuard, Pausable {
    using SafeERC20 for IERC20;

    IERC20 public immutable token; // USDT

    // Interest rates (basis points per year)
    uint256 public mntSupplyAPR = 500;    // 5% APR cho lenders
    uint256 public mntBorrowAPR = 800;    // 8% APR cho borrowers
    uint256 public tokenSupplyAPR = 600;  // 6% APR
    uint256 public tokenBorrowAPR = 900;  // 9% APR

    // Collateral ratio: 150% (need 1.5x collateral value)
    uint256 public collateralRatio = 15000; // 150%
    uint256 public constant RATIO_DENOMINATOR = 10000;

    // Liquidation threshold: 120%
    uint256 public liquidationThreshold = 12000; // 120%

    struct Supply {
        uint256 amount;
        uint256 timestamp;
        uint256 accruedInterest;
    }

    struct Borrow {
        uint256 amount;
        uint256 collateral;
        uint256 timestamp;
        uint256 accruedInterest;
        bool isToken; // true = borrowed token, false = borrowed MNT
    }

    // User supplies
    mapping(address => Supply) public mntSupplies;
    mapping(address => Supply) public tokenSupplies;

    // User borrows
    mapping(address => Borrow) public borrows;

    // Pool totals
    uint256 public totalMntSupplied;
    uint256 public totalMntBorrowed;
    uint256 public totalTokenSupplied;
    uint256 public totalTokenBorrowed;

    // Events
    event MntSupplied(address indexed user, uint256 amount);
    event TokenSupplied(address indexed user, uint256 amount);
    event MntWithdrawn(address indexed user, uint256 amount, uint256 interest);
    event TokenWithdrawn(address indexed user, uint256 amount, uint256 interest);
    event Borrowed(address indexed user, bool isToken, uint256 amount, uint256 collateral);
    event Repaid(address indexed user, uint256 amount, uint256 interest);
    event Liquidated(address indexed borrower, address indexed liquidator, uint256 amount);

    constructor(address _token) Ownable(msg.sender) {
        require(_token != address(0), "Invalid token");
        token = IERC20(_token);
    }

    // ============ Supply Functions ============

    /**
     * @dev Supply MNT để earn interest
     */
    function supplyMnt() external payable nonReentrant whenNotPaused {
        require(msg.value > 0, "Must supply MNT");

        Supply storage supply = mntSupplies[msg.sender];
        
        // Accrue interest trước
        if (supply.amount > 0) {
            uint256 interest = calculateSupplyInterest(supply.amount, supply.timestamp, mntSupplyAPR);
            supply.accruedInterest += interest;
        }

        supply.amount += msg.value;
        supply.timestamp = block.timestamp;
        totalMntSupplied += msg.value;

        emit MntSupplied(msg.sender, msg.value);
    }

    /**
     * @dev Supply USDT để earn interest
     */
    function supplyToken(uint256 amount) external nonReentrant whenNotPaused {
        require(amount > 0, "Must supply tokens");

        Supply storage supply = tokenSupplies[msg.sender];
        
        if (supply.amount > 0) {
            uint256 interest = calculateSupplyInterest(supply.amount, supply.timestamp, tokenSupplyAPR);
            supply.accruedInterest += interest;
        }

        supply.amount += amount;
        supply.timestamp = block.timestamp;
        totalTokenSupplied += amount;

        token.safeTransferFrom(msg.sender, address(this), amount);

        emit TokenSupplied(msg.sender, amount);
    }

    /**
     * @dev Withdraw MNT supplied
     */
    function withdrawMnt(uint256 amount) external nonReentrant whenNotPaused {
        Supply storage supply = mntSupplies[msg.sender];
        require(supply.amount >= amount, "Insufficient supply");

        uint256 interest = calculateSupplyInterest(supply.amount, supply.timestamp, mntSupplyAPR);
        uint256 totalInterest = supply.accruedInterest + interest;

        supply.amount -= amount;
        supply.accruedInterest = 0;
        supply.timestamp = block.timestamp;
        totalMntSupplied -= amount;

        uint256 totalAmount = amount + totalInterest;
        require(address(this).balance >= totalAmount, "Insufficient pool balance");

        (bool success, ) = msg.sender.call{value: totalAmount}("");
        require(success, "Transfer failed");

        emit MntWithdrawn(msg.sender, amount, totalInterest);
    }

    /**
     * @dev Withdraw USDT supplied
     */
    function withdrawToken(uint256 amount) external nonReentrant whenNotPaused {
        Supply storage supply = tokenSupplies[msg.sender];
        require(supply.amount >= amount, "Insufficient supply");

        uint256 interest = calculateSupplyInterest(supply.amount, supply.timestamp, tokenSupplyAPR);
        uint256 totalInterest = supply.accruedInterest + interest;

        supply.amount -= amount;
        supply.accruedInterest = 0;
        supply.timestamp = block.timestamp;
        totalTokenSupplied -= amount;

        uint256 totalAmount = amount + totalInterest;
        require(token.balanceOf(address(this)) >= totalAmount, "Insufficient pool balance");

        token.safeTransfer(msg.sender, totalAmount);

        emit TokenWithdrawn(msg.sender, amount, totalInterest);
    }

    // ============ Borrow Functions ============

    /**
     * @dev Borrow MNT với USDT collateral
     */
    function borrowMntWithTokenCollateral(uint256 borrowAmount, uint256 collateralAmount) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(borrows[msg.sender].amount == 0, "Already have active borrow");
        require(borrowAmount > 0, "Invalid borrow amount");
        require(isCollateralSufficient(borrowAmount, collateralAmount, false), "Insufficient collateral");

        borrows[msg.sender] = Borrow({
            amount: borrowAmount,
            collateral: collateralAmount,
            timestamp: block.timestamp,
            accruedInterest: 0,
            isToken: false
        });

        totalMntBorrowed += borrowAmount;

        token.safeTransferFrom(msg.sender, address(this), collateralAmount);
        
        (bool success, ) = msg.sender.call{value: borrowAmount}("");
        require(success, "Transfer failed");

        emit Borrowed(msg.sender, false, borrowAmount, collateralAmount);
    }

    /**
     * @dev Borrow USDT với MNT collateral
     */
    function borrowTokenWithMntCollateral(uint256 borrowAmount) 
        external 
        payable
        nonReentrant 
        whenNotPaused 
    {
        require(borrows[msg.sender].amount == 0, "Already have active borrow");
        require(borrowAmount > 0, "Invalid borrow amount");
        require(isCollateralSufficient(borrowAmount, msg.value, true), "Insufficient collateral");

        borrows[msg.sender] = Borrow({
            amount: borrowAmount,
            collateral: msg.value,
            timestamp: block.timestamp,
            accruedInterest: 0,
            isToken: true
        });

        totalTokenBorrowed += borrowAmount;

        token.safeTransfer(msg.sender, borrowAmount);

        emit Borrowed(msg.sender, true, borrowAmount, msg.value);
    }

    /**
     * @dev Repay borrow
     */
    function repay() external payable nonReentrant whenNotPaused {
        Borrow storage borrow = borrows[msg.sender];
        require(borrow.amount > 0, "No active borrow");

        uint256 apr = borrow.isToken ? tokenBorrowAPR : mntBorrowAPR;
        uint256 interest = calculateBorrowInterest(borrow.amount, borrow.timestamp, apr);
        uint256 totalDebt = borrow.amount + borrow.accruedInterest + interest;

        if (borrow.isToken) {
            // Repaying token borrow
            token.safeTransferFrom(msg.sender, address(this), totalDebt);
            totalTokenBorrowed -= borrow.amount;
            
            // Return MNT collateral
            (bool success, ) = msg.sender.call{value: borrow.collateral}("");
            require(success, "Collateral return failed");
        } else {
            // Repaying MNT borrow
            require(msg.value >= totalDebt, "Insufficient repayment");
            totalMntBorrowed -= borrow.amount;
            
            // Return token collateral
            token.safeTransfer(msg.sender, borrow.collateral);
            
            // Refund excess
            if (msg.value > totalDebt) {
                (bool success, ) = msg.sender.call{value: msg.value - totalDebt}("");
                require(success, "Refund failed");
            }
        }

        emit Repaid(msg.sender, borrow.amount, interest);
        
        delete borrows[msg.sender];
    }

    // ============ View Functions ============

    function calculateSupplyInterest(uint256 amount, uint256 since, uint256 apr) 
        public 
        view 
        returns (uint256) 
    {
        if (amount == 0) return 0;
        uint256 duration = block.timestamp - since;
        return (amount * apr * duration) / (365 days * 10000);
    }

    function calculateBorrowInterest(uint256 amount, uint256 since, uint256 apr) 
        public 
        view 
        returns (uint256) 
    {
        if (amount == 0) return 0;
        uint256 duration = block.timestamp - since;
        return (amount * apr * duration) / (365 days * 10000);
    }

    function isCollateralSufficient(uint256 borrowAmount, uint256 collateral, bool borrowingToken) 
        public 
        view 
        returns (bool) 
    {
        // Simplified: assume 1 MNT = 1 USDT for this example
        uint256 requiredCollateral = (borrowAmount * collateralRatio) / RATIO_DENOMINATOR;
        return collateral >= requiredCollateral;
    }

    function getUserSupplyInfo(address user) 
        external 
        view 
        returns (
            uint256 mntAmount,
            uint256 mntInterest,
            uint256 tokenAmount,
            uint256 tokenInterest
        ) 
    {
        Supply memory mntSupply = mntSupplies[user];
        Supply memory tokenSupply = tokenSupplies[user];
        
        mntAmount = mntSupply.amount;
        mntInterest = mntSupply.accruedInterest + calculateSupplyInterest(mntSupply.amount, mntSupply.timestamp, mntSupplyAPR);
        
        tokenAmount = tokenSupply.amount;
        tokenInterest = tokenSupply.accruedInterest + calculateSupplyInterest(tokenSupply.amount, tokenSupply.timestamp, tokenSupplyAPR);
    }

    function getUserBorrowInfo(address user) 
        external 
        view 
        returns (
            uint256 borrowAmount,
            uint256 collateral,
            uint256 interest,
            bool isToken
        ) 
    {
        Borrow memory borrow = borrows[user];
        uint256 apr = borrow.isToken ? tokenBorrowAPR : mntBorrowAPR;
        
        return (
            borrow.amount,
            borrow.collateral,
            borrow.accruedInterest + calculateBorrowInterest(borrow.amount, borrow.timestamp, apr),
            borrow.isToken
        );
    }

    // ============ Admin Functions ============

    function setAPRs(uint256 _mntSupply, uint256 _mntBorrow, uint256 _tokenSupply, uint256 _tokenBorrow) 
        external 
        onlyOwner 
    {
        mntSupplyAPR = _mntSupply;
        mntBorrowAPR = _mntBorrow;
        tokenSupplyAPR = _tokenSupply;
        tokenBorrowAPR = _tokenBorrow;
    }

    function setCollateralRatio(uint256 _ratio) external onlyOwner {
        require(_ratio >= 10000, "Ratio must be >= 100%");
        collateralRatio = _ratio;
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    receive() external payable {}
}
