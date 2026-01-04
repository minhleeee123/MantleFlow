// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./TradingWallet.sol";

/**
 * @title WalletFactory
 * @dev Factory to create and register TradingWallet clones
 */
contract WalletFactory is Ownable {
    address public implementation;
    mapping(address => address) public userWallets;
    address[] public allWallets;

    event WalletCreated(address indexed user, address indexed wallet);
    event ImplementationUpdated(address indexed newImplementation);

    constructor(address _implementation) Ownable(msg.sender) {
        implementation = _implementation;
    }

    /**
     * @dev Create a new wallet for msg.sender (User)
     * @param operator The address of the trading bot
     */
    function deployWallet(address operator) external returns (address) {
        require(userWallets[msg.sender] == address(0), "Wallet already exists");
        
        // Clone implementation
        address clone = Clones.clone(implementation);
        
        // Initialize wallet
        TradingWallet(payable(clone)).initialize(msg.sender, operator);
        
        // Register
        userWallets[msg.sender] = clone;
        allWallets.push(clone);
        
        emit WalletCreated(msg.sender, clone);
        return clone;
    }

    /**
     * @dev Update implementation address (onlyOwner)
     */
    function setImplementation(address _implementation) external onlyOwner {
        implementation = _implementation;
        emit ImplementationUpdated(_implementation);
    }

    /**
     * @dev Helper to get total wallets
     */
    function totalWallets() external view returns (uint256) {
        return allWallets.length;
    }
}
