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
     * @dev Bot executes swap on Agni. 
     * IMPORTANT: Bot cannot send funds elsewhere, output MUST come back to this wallet.
     */
    function executeSwapOnAgni(
        address tokenIn,
        address tokenOut,
        uint24 fee,
        uint256 amountIn,
        uint256 amountOutMinimum
    ) external onlyOperatorOrOwner returns (uint256 amountOut) {
        
        address actualTokenIn = tokenIn;
        address actualTokenOut = tokenOut;

        // 1. Wrap MNT if needed
        if (tokenIn == address(0)) {
            require(address(this).balance >= amountIn, "Insufficient MNT");
            IWMNT(WMNT).deposit{value: amountIn}();
            actualTokenIn = WMNT; 
        } else {
            require(IERC20(tokenIn).balanceOf(address(this)) >= amountIn, "Insufficient Token");
        }

        // Handle output MNT
        if (tokenOut == address(0)) {
            actualTokenOut = WMNT;
        }

        // 2. Approve Router
        // Use IERC20 interface for WMNT to support approve
        IERC20(actualTokenIn).approve(AGNI_ROUTER, 0);
        IERC20(actualTokenIn).approve(AGNI_ROUTER, amountIn);

        // 3. Prepare Params
        IAgniRouter.ExactInputSingleParams memory params = IAgniRouter.ExactInputSingleParams({
            tokenIn: actualTokenIn,
            tokenOut: actualTokenOut,
            fee: fee,
            recipient: address(this), 
            deadline: block.timestamp + 300,
            amountIn: amountIn,
            amountOutMinimum: amountOutMinimum,
            sqrtPriceLimitX96: 0
        });

        // 4. Exec Swap
        amountOut = IAgniRouter(AGNI_ROUTER).exactInputSingle(params);
        
        // 5. Unwrap if output is MNT
        if (tokenOut == address(0)) {
             IWMNT(WMNT).withdraw(amountOut);
        }

        emit SwapExecuted(tokenIn, tokenOut, amountIn, amountOut);
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
