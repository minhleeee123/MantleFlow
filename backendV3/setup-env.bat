@echo off
echo.
echo ========================================
echo   Backend V3 - Environment Setup
echo ========================================
echo.
echo Current BOT_PRIVATE_KEY status: NOT SET
echo.
echo Please paste your private key (starts with 0x):
set /p PRIVATE_KEY="> "
echo.
echo Updating .env file...

REM Create new .env with updated key
(
echo # Backend V3 - Environment
echo NODE_ENV=development
echo PORT=8000
echo.
echo # Database
echo DATABASE_URL="file:./dev.db"
echo.
echo # JWT
echo JWT_SECRET=test-secret-key-for-development-only
echo.
echo # Blockchain - Mantle Sepolia
echo MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz
echo CHAIN_ID=5003
echo.
echo # Smart Contracts V3
echo VAULT_ADDRESS=0xa9910f0214173814d1571cC64D45F9681a8500B2
echo DEX_ADDRESS=0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d
echo USDT_ADDRESS=0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080
echo.
echo # Bot Wallet
echo BOT_PRIVATE_KEY=%PRIVATE_KEY%
) > .env

echo.
echo ✅ .env file updated!
echo.
echo Verifying...
node check-env.js
echo.
pause
