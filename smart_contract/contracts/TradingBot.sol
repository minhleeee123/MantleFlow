// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title TradingBot
 * @dev Optimized auto-trading contract for Mantle Testnet
 * Designed to work seamlessly with existing backend
 */
contract TradingBot is Ownable, ReentrancyGuard {
    using SafeERC20 for IERC20;

    // User balances: user => token => amount
    mapping(address => mapping(address => uint256)) public balances;

    // Authorized backend addresses
    mapping(address => bool) public authorizedExecutors;

    // Events
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
    event ExecutorAuthorized(address indexed executor, bool status);

    constructor() Ownable(msg.sender) {
        authorizedExecutors[msg.sender] = true;
    }

    /**
     * @dev Authorize backend executor
     */
    function setExecutorAuthorization(address executor, bool status) external onlyOwner {
        authorizedExecutors[executor] = status;
        emit ExecutorAuthorized(executor, status);
    }

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

    /**
     * @dev Execute swap (backend-authorized only)
     * Matches backend signature exactly
     */
    function executeSwap(
        address user,
        address tokenIn,
        address tokenOut,
        uint256 amountIn,
        uint256 amountOut,
        string calldata triggerId
    ) external nonReentrant returns (bool) {
        require(authorizedExecutors[msg.sender], "Not authorized");
        require(balances[user][tokenIn] >= amountIn, "Insufficient balance");
        require(amountIn > 0 && amountOut > 0, "Invalid amounts");

        // Deduct input token
        balances[user][tokenIn] -= amountIn;

        // Add output token
        balances[user][tokenOut] += amountOut;

        emit SwapExecuted(user, tokenIn, tokenOut, amountIn, amountOut, triggerId);
        
        return true;
    }

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

    receive() external payable {}
}
