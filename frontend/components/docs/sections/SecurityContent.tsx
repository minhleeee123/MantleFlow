import React from 'react';
import { SecurityItem } from '../DocHelpers';

export const SecurityContent = () => (
    <div className="space-y-6">
        <ul className="space-y-4">
            <SecurityItem
                title="Wallet Signature Authentication"
                desc="Login requires cryptographic signature using personal_sign. Backend verifies with ethers.verifyMessage() comparing recovered address to claimed address. No password storage, only signature verification. JWT tokens expire after 7 days for session management."
            />
            <SecurityItem
                title="Non-Custodial Smart Wallet Architecture"
                desc="User is wallet owner with exclusive withdrawal rights via onlyOwner modifier. Backend operator can only execute trades through executeCall() but cannot withdraw funds. Users retain full custody - backend cannot access funds without user's smart wallet permissions."
            />
            <SecurityItem
                title="OpenZeppelin Security Standards"
                desc="Smart contracts use OpenZeppelin v5.0: SafeERC20 for safe token transfers (prevents reentrancy), Ownable for access control (prevents unauthorized actions), Initializable for proxy pattern security. All external calls wrapped in try-catch with revert bubbling."
            />
            <SecurityItem
                title="Environment Variable Protection"
                desc="All sensitive data stored in .env files (never committed to git): ADMIN_PRIVATE_KEY (backend operator wallet), JWT_SECRET (token signing key), DATABASE_URL (MySQL connection string). Frontend uses VITE_ prefix for public vars only."
            />
            <SecurityItem
                title="Input Validation & Sanitization"
                desc="Zod schema validation on all backend API inputs. Validates: trigger amounts > 0, symbols exist in whitelist, wallet addresses are valid checksums, price values are positive numbers. SQL injection prevented by Prisma's parameterized queries."
            />
            <SecurityItem
                title="Rate Limiting & CORS"
                desc="CORS configured to only accept requests from frontend origin. API endpoints use express-rate-limit to prevent abuse. Auto-executor has 10-second intervals to prevent spam execution attempts. Failed transactions logged for forensic analysis."
            />
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-6">
            <h4 className="font-bold flex items-center gap-2 mb-2">
                ⚠️ Security Considerations for Production
            </h4>
            <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Enable slippage protection in swap params (currently 0 for demo)</li>
                <li>Implement multi-sig for operator address changes</li>
                <li>Add emergency pause function for factory contract</li>
                <li>Enable HTTPS/TLS for all API communications</li>
                <li>Implement transaction monitoring & anomaly detection</li>
                <li>Get professional smart contract audit before mainnet deployment</li>
            </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white mt-6">
            <h3 className="text-lg font-black uppercase mb-4">Smart Contract Security Code Snippets</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`// Access Control Modifiers
modifier onlyOwner() {
    require(msg.sender == owner, "Not owner");
    _;
}

modifier onlyOperatorOrOwner() {
    require(msg.sender == operator || msg.sender == owner, "Not authorized");
    _;
}

// Safe Token Transfer (OpenZeppelin SafeERC20)
using SafeERC20 for IERC20;
IERC20(token).safeTransfer(owner, amount);

// Revert Bubbling for Detailed Errors
(bool success, bytes memory result) = target.call{value: value}(data);
if (!success) {
    assembly {
        let returndata_size := mload(result)
        revert(add(32, result), returndata_size)
    }
}`}</pre>
            </div>
        </div>
    </div>
);
