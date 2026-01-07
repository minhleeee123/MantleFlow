import React from 'react';
import { SecurityItem } from '../DocHelpers';
import { AlertTriangle } from 'lucide-react';

export const SecurityContent = () => (
    <div className="space-y-6">
        <ul className="space-y-4">
            <SecurityItem
                title="Wallet Signature Authentication"
                desc="Login requires cryptographic signature using personal_sign. Backend verifies with ethers.verifyMessage() comparing recovered address to claimed address. No password storage, only signature verification. JWT tokens expire after 7 days for session management."
            />
            <SecurityItem
                title="Bot Authorization Model"
                desc="Users deposit funds into shared VaultWithSwap contract and explicitly authorize backend bot via authorizeBot(bot, true). Bot can only execute swaps on user's funds, cannot withdraw. Users retain full custody and can revoke bot authorization anytime via authorizeBot(bot, false)."
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
                desc="CORS configured to only accept requests from frontend origin. API endpoints use express-rate-limit to prevent abuse. Auto-executor has 30-second intervals to prevent spam execution attempts. Failed transactions logged for forensic analysis."
            />
        </ul>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-4 mt-6">
            <h4 className="font-bold flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" /> Security Considerations for Production
            </h4>
            <ul className="text-sm space-y-1 ml-4 list-disc">
                <li>Enable slippage protection in swap params (currently 0 for demo)</li>
                <li>Implement multi-sig for bot wallet address</li>
                <li>Add emergency pause function for VaultWithSwap contract</li>
                <li>Add max swap amount limits per transaction</li>
                <li>Enable HTTPS/TLS for all API communications</li>
                <li>Implement transaction monitoring & anomaly detection</li>
                <li>Get professional smart contract audit before mainnet deployment</li>
            </ul>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 border-2 border-black dark:border-white mt-6">
            <h3 className="text-lg font-black uppercase mb-4">Smart Contract Security Code Snippets</h3>
            <div className="bg-gray-900 text-gray-100 p-4 rounded font-mono text-xs overflow-x-auto">
                <pre>{`// Bot Authorization Check
modifier onlyAuthorizedBot(address user) {
    require(userAuthorizedBots[user][msg.sender], "Bot not authorized");
    _;
}

// User Withdrawal (only user can withdraw)
function withdrawMnt(uint256 amount) external nonReentrant {
    require(mntBalances[msg.sender] >= amount, "Insufficient balance");
    mntBalances[msg.sender] -= amount;
    (bool success, ) = msg.sender.call{value: amount}("");
    require(success, "Transfer failed");
}

// Bot can swap but not withdraw
function executeSwapMntToUsdtForUser(address user, uint256 mntAmount, uint256 minUsdtOut) 
    external nonReentrant {
    require(userAuthorizedBots[user][msg.sender], "Bot not authorized");
    require(mntBalances[user] >= mntAmount, "Insufficient balance");
    // ... swap logic ...
}`}</pre>
            </div>
        </div>
    </div>
);
