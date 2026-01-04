// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/proxy/utils/Initializable.sol";

/**
 * @title IAgniRouter
 * @dev Agni Finance Router V3 interface
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
}

/**
 * @title IWMNT
 */
interface IWMNT {
    function deposit() external payable;
    function withdraw(uint256) external;
}

/**
 * @title TradingWallet
 * @dev Individual smart wallet for each user.
 * - Owner (User): Can withdraw and execute any transaction
 * - Operator (Bot): Can only execute specific swaps on Agni DEX
 */
contract TradingWallet is Initializable {
    using SafeERC20 for IERC20;

    address public owner;
    address public operator;
    address public factory;

    address public constant AGNI_ROUTER = 0xb5Dc27be0a565A4A80440f41c74137001920CB22;
    address public constant WMNT = 0x67A1f4A939b477A6b7c5BF94D97E45dE87E608eF;

    event SwapExecuted(address indexed tokenIn, address indexed tokenOut, uint256 amountIn, uint256 amountOut);
    event Withdrawn(address indexed token, uint256 amount);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    modifier onlyOperatorOrOwner() {
        require(msg.sender == operator || msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        factory = msg.sender;
    }

    /**
     * @dev Initialize function for Clone pattern
     */
    function initialize(address _owner, address _operator) external initializer {
        require(owner == address(0), "Already initialized"); // Simple check
        owner = _owner;
        operator = _operator;
    }

    /**
     * @dev Generic Execution.
     * Allows Operator (Bot) to execute any transaction on behalf of the wallet.
     * Backend/Bot is responsible for constructing valid calldata (e.g., Swap, Approve, etc.)
     */
    function executeCall(
        address target,
        uint256 value,
        bytes calldata data
    ) external onlyOperatorOrOwner returns (bytes memory result) {
        
        // Security: Optional Whitelist check could go here
        require(target != address(0), "Invalid target");

        // Execute
        bool success;
        (success, result) = target.call{value: value}(data);
        
        if (!success) {
            // Bubble up revert reason
            assembly {
                let returndata_size := mload(result)
                revert(add(32, result), returndata_size)
            }
        }
        
        emit SwapExecuted(target, address(0), value, 0); // Reusing event or define new one
    }

    /**
     * @dev Owner withdraws funds
     */
    function withdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            (bool success, ) = payable(owner).call{value: amount}("");
            require(success, "Transfer failed");
        } else {
            IERC20(token).safeTransfer(owner, amount);
        }
        emit Withdrawn(token, amount);
    }

    /**
     * @dev Allow owner to change operator
     */
    function setOperator(address _operator) external onlyOwner {
        operator = _operator;
    }

    /**
     * @dev Allow to receive ETH (MNT)
     */
    receive() external payable {}
}
