// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAgniRouter
 * @dev Agni Finance Router V3 interface (Uniswap V3 style)
 */
interface IAgniRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);

    function WETH9() external view returns (address);
}

/**
 * @title TradingBotV2
 * @dev Advanced auto-trading contract with real DEX integration
 * 
 * NEW FEATURES:
 * - Real swap on Agni Finance DEX (Uniswap V3 architecture)
 * - Supports USDC ↔ WMNT trading pairs
 * - Trustless execution - all swaps on-chain
 * - Backward compatible with existing backend
 */
contract TradingBotV2 is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // ============ STATE VARIABLES ============

    // Agni Router address on Mantle Sepolia
    address public constant AGNI_ROUTER = 0xb5Dc27be0a565A4A80440f41c74137001920CB22;
    
    // Wrapped MNT address
    address public immutable WMNT;

    // User balances: user => token => amount
    mapping(address => mapping(address => uint256)) public balances;

    // Authorized backend addresses
    mapping(address => bool) public authorizedExecutors;

    // Slippage tolerance (basis points, 50 = 0.5%)
    uint256 public slippageTolerance = 50; // 0.5%

    // Fee tier for Agni pools (500 = 0.05%)
    uint24 public constant DEFAULT_FEE = 500;

    // ============ EVENTS ============

    event Deposit(address indexed user, address indexed token, uint256 amount);
    event Withdraw(address indexed user, address indexed token, uint256 amount);
    event SwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string triggerId
    );
    event RealSwapExecuted(
        address indexed user,
        address indexed tokenIn,
        address indexed tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string triggerId
    );
    event ExecutorAuthorized(address indexed executor, bool status);
    event SlippageUpdated(uint256 newSlippage);

    // ============ CONSTRUCTOR ============

    constructor() Ownable(msg.sender) {
        authorizedExecutors[msg.sender] = true;
        
        // Get WMNT address from router
        WMNT = IAgniRouter(AGNI_ROUTER).WETH9();
    }

    // ============ MODIFIERS ============

    modifier onlyAuthorized() {
        require(authorizedExecutors[msg.sender], "Not authorized");
        _;
    }

    // ============ ADMIN FUNCTIONS ============

    /**
     * @dev Authorize backend executor
     */
    function setExecutorAuthorization(address executor, bool status) external onlyOwner {
        authorizedExecutors[executor] = status;
        emit ExecutorAuthorized(executor, status);
    }

    /**
     * @dev Update slippage tolerance
     */
    function setSlippageTolerance(uint256 _slippage) external onlyOwner {
        require(_slippage <= 1000, "Slippage too high"); // Max 10%
        slippageTolerance = _slippage;
        emit SlippageUpdated(_slippage);
    }

    // ============ USER FUNCTIONS ============

    /**
     * @dev Deposit tokens (supports both ERC20 and native MNT)
     */
    function deposit(address token, uint256 amount) external payable nonReentrant {
        require(amount > 0, "Amount must be > 0");

        if (token == address(0)) {
            // Native MNT
            require(msg.value == amount, "Incorrect MNT amount");
            balances[msg.sender][token] += amount;
        } else {
            // ERC20 token
            require(msg.value == 0, "Do not send MNT for token deposit");
            IERC20(token).safeTransferFrom(msg.sender, address(this), amount);
            balances[msg.sender][token] += amount;
        }

        emit Deposit(msg.sender, token, amount);
    }

    /**
     * @dev Withdraw tokens
     */
    function withdraw(address token, uint256 amount) external nonReentrant {
        require(amount > 0, "Amount must be > 0");
        require(balances[msg.sender][token] >= amount, "Insufficient balance");

        balances[msg.sender][token] -= amount;

        if (token == address(0)) {
            // Native MNT
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success, "MNT transfer failed");
        } else {
            // ERC20 token
            IERC20(token).safeTransfer(msg.sender, amount);
        }

        emit Withdraw(msg.sender, token, amount);
    }

    // ============ SWAP FUNCTIONS ============

    /**
     * @dev Execute REAL swap on Agni DEX (NEW)
     * Supports USDC ↔ WMNT pairs
     */
    function executeSwapOnDex(
        address user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 expectedAmountOut,
        string calldata triggerId
    ) external onlyAuthorized nonReentrant returns (uint256 amountOut) {
        require(balances[user][tokenIn] >= amountIn, "Insufficient balance");
        require(amountIn > 0, "Invalid amount");

        // Deduct from user balance
        balances[user][tokenIn] -= amountIn;

        // Calculate minimum output with slippage
        uint256 minAmountOut = (expectedAmountOut * (10000 - slippageTolerance)) / 10000;

        // Handle native MNT vs WMNT
        address actualTokenIn = tokenIn;
        address actualTokenOut = tokenOut;
        
        if (tokenIn == address(0)) {
            actualTokenIn = WMNT; // Router needs WMNT, not native MNT
        }
        if (tokenOut == address(0)) {
            actualTokenOut = WMNT;
        }

        // Approve router if ERC20
        if (actualTokenIn != address(0)) {
            IERC20(actualTokenIn).forceApprove(AGNI_ROUTER, amountIn);
        }

        // Execute swap on Agni
        IAgniRouter.ExactInputSingleParams memory params = IAgniRouter.ExactInputSingleParams({
            tokenIn: actualTokenIn,
            tokenOut: actualTokenOut,
            fee: DEFAULT_FEE,
            recipient: address(this),
            deadline: block.timestamp + 300, // 5 minutes
            amountIn: amountIn,
            amountOutMinimum: minAmountOut,
            sqrtPriceLimitX96: 0
        });

        if (tokenIn == address(0)) {
            // Native MNT swap
            amountOut = IAgniRouter(AGNI_ROUTER).exactInputSingle{value: amountIn}(params);
        } else {
            amountOut = IAgniRouter(AGNI_ROUTER).exactInputSingle(params);
        }

        // Credit user with output tokens
        balances[user][tokenOut] += amountOut;

        emit RealSwapExecuted(user, tokenIn, tokenOut, amountIn, amountOut, triggerId);
        
        return amountOut;
    }

    /**
     * @dev Execute mock swap (backward compatible with old backend)
     * Use this for demo purposes or when DEX liquidity is low
     */
    function executeSwap(
        address user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string calldata triggerId
    ) external onlyAuthorized nonReentrant returns (bool) {
        require(balances[user][tokenIn] >= amountIn, "Insufficient balance");
        require(amountIn > 0 && amountOut > 0, "Invalid amounts");

        // Deduct input token
        balances[user][tokenIn] -= amountIn;

        // Add output token
        balances[user][tokenOut] += amountOut;

        emit SwapExecuted(user, tokenIn, tokenOut, amountIn, amountOut, triggerId);
        
        return true;
    }

    // ============ VIEW FUNCTIONS ============

    /**
     * @dev Get user balance
     */
    function getBalance(address user, address token) external view returns (uint256) {
        return balances[user][token];
    }

    /**
     * @dev Get multiple balances
     */
    function getBalances(address user, address[] calldata tokens) 
        external 
        view 
        returns (uint256[] memory) 
    {
        uint256[] memory userBalances = new uint256[](tokens.length);
        for (uint256 i = 0; i < tokens.length; i++) {
            userBalances[i] = balances[user][tokens[i]];
        }
        return userBalances;
    }

    // ============ EMERGENCY FUNCTIONS ============

    /**
     * @dev Emergency withdraw (owner only)
     */
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = owner().call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(owner(), amount);
        }
    }

    /**
     * @dev Recover stuck tokens (owner only)
     */
    function recoverToken(address token, uint256 amount, address to) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = to.call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(to, amount);
        }
    }

    // ============ FALLBACK ============

    receive() external payable {}
}
