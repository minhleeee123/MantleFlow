# Report: DEX and Vault V2 System

**Date:** January 6, 2026  
**Network:** Mantle Sepolia Testnet (Chain ID: 5003)  
**Deployer:** `0xE412d04DA2A211F7ADC80311CC0FF9F03440B64E`

---

## 📋 Overview

The system consists of 2 integrated smart contracts:

1. **SimpleDEXV2** - Decentralized Exchange (DEX) with MNT/USDT liquidity pool
2. **VaultWithSwap** - Asset management vault with integrated swap functionality

---

## 🎯 1. SimpleDEXV2 (DEX Contract)

### 📍 Deployment Information

- **Address:** `0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d`
- **File:** `contractsV2/SimpleDEXV2.sol`
- **Compiler:** Solidity 0.8.20
- **OpenZeppelin:** 5.0.0

### ⚙️ Main Functions

#### 1. Add Liquidity
```solidity
function addLiquidity(uint256 usdtAmount) external payable
```
- Add MNT/USDT token pair to pool
- Receive corresponding liquidity tokens
- **Current Liquidity:** 1,000 MNT + 5,000 USDT ✅

#### 2. Remove Liquidity
```solidity
function removeLiquidity(uint256 liquidity) external
```
- Burn liquidity tokens to receive MNT and USDT back
- Ratio based on current reserves

#### 3. Swap MNT → USDT
```solidity
function swapMntForUsdt(uint256 minUsdtOut) external payable
```
- Swap MNT for USDT
- Trading fee: 0.3%
- Slippage protection with minUsdtOut

#### 4. Swap USDT → MNT
```solidity
function swapUsdtForMnt(uint256 usdtAmount, uint256 minMntOut) external
```
- Swap USDT for MNT
- Trading fee: 0.3%
- Slippage protection with minMntOut

#### 5. View Functions
```solidity
function getAmountOut(bool mntToUsdt, uint256 amountIn) public view returns (uint256)
function getPrice() public view returns (uint256 mntPerUsdt, uint256 usdtPerMnt)
```
- Calculate output amount before swap
- View current exchange rate

### 🔧 Operating Mechanism

**Automated Market Maker (AMM):**
- Uses constant product formula: `x * y = k`
- Reserves: `mntReserve` and `usdtReserve`
- Fee: 0.3% per swap transaction

**Liquidity Management:**
- Tracking: `totalLiquidity` and `liquidityBalance[user]`
- First liquidity provider receives liquidity = sqrt(mnt * usdt)
- Subsequent providers: liquidity proportional to reserves

### 📊 Current Status

```
Reserve:
├── MNT:  1,000.00 MNT
├── USDT: 5,000.00 USDT
└── K:    5,000,000.00 (constant product)

Price:
├── 1 MNT  = 5.00 USDT
└── 1 USDT = 0.20 MNT

Total Liquidity: 2,236.067977499789696409 (sqrt(1000*5000))
```

---

## 🏦 2. VaultWithSwap (Vault Contract)

### 📍 Deployment Information

- **Address:** `0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16`
- **File:** `contractsV2/VaultWithSwap.sol`
- **DEX Integration:** SimpleDEXV2 `0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d`

### ⚙️ Main Functions

#### 1. Deposit Functions
```solidity
function depositMnt() external payable
function depositUsdt(uint256 amount) external
```
- Deposit MNT or USDT into vault
- Balance tracking per user
- No deposit limits

#### 2. Withdraw Functions
```solidity
function withdrawMnt(uint256 amount) external
function withdrawUsdt(uint256 amount) external
```
- Withdraw MNT or USDT from vault
- Balance verification before withdrawal
- Direct transfer to user wallet

#### 3. Swap Functions (Integrated DEX)
```solidity
function swapMntToUsdt(uint256 mntAmount, uint256 minUsdtOut) external
function swapUsdtToMnt(uint256 usdtAmount, uint256 minMntOut) external
```
- Swap directly from vault balance
- Integrated with SimpleDEXV2
- Automatic approval management
- Slippage protection

#### 4. View Functions
```solidity
function getUserBalances(address user) external view returns (uint256 mnt, uint256 usdt)
function estimateSwap(bool mntToUsdt, uint256 amountIn) external view returns (uint256)
function getTotalDeposits() external view returns (uint256 mnt, uint256 usdt)
```
- View user balance
- Estimate output before swap
- View total deposits in vault

### 🔧 Operating Mechanism

**Deposit/Withdraw:**
- Mapping: `mntBalances[user]` and `usdtBalances[user]`
- Total tracking: `totalMntDeposited` and `totalUsdtDeposited`
- Users retain 100% control of their assets

**Integrated Swap:**
- Direct call to DEX contract for swaps
- Automatic USDT approval for DEX
- Balance update after each swap
- Gas-efficient with safeIncreaseAllowance

### 📊 Test Results

#### Test Case 1: Deposit
```
Input:
├── MNT:  10.0
└── USDT: 50.0

Result: ✅ SUCCESS
└── Vault Balance: 20.0 MNT, 50.0 USDT (including 10 MNT from previous test)
```

#### Test Case 2: Swap MNT → USDT
```
Input:
├── Amount: 5.0 MNT
└── Min Output: 23.561297 USDT (95% slippage)

Result: ✅ SUCCESS
├── Received: 24.801365 USDT
├── Price Impact: ~0.5%
└── New Balance: 15.0 MNT, 74.801365 USDT
```

#### Test Case 3: Swap USDT → MNT
```
Input:
├── Amount: 20.0 USDT
└── Min Output: 3.811248 MNT (95% slippage)

Result: ✅ SUCCESS
├── Received: 4.011840604299864442 MNT
├── Price Impact: ~0.3%
└── New Balance: 19.011840604299864442 MNT, 54.801365 USDT
```

#### Test Case 4: Withdraw
```
Input:
├── MNT:  2.0
└── USDT: 10.0

Result: ✅ SUCCESS
└── Final Vault Balance: 17.011840604299864442 MNT, 44.801365 USDT
```

### 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Total Deposits | 17.01 MNT, 44.80 USDT |
| Swap Success Rate | 100% (2/2) |
| Average Gas Cost | ~150,000 - 200,000 gas per tx |
| Slippage Tolerance | 5% (configurable) |

---

## 🔐 Security

### SimpleDEXV2
✅ ReentrancyGuard protection  
✅ SafeERC20 for token transfers  
✅ Slippage protection with minOut parameters  
✅ K value validation after each swap  
✅ Liquidity overflow checks  

### VaultWithSwap
✅ Balance validation before withdrawal  
✅ SafeERC20 with safeIncreaseAllowance  
✅ DEX approval management  
✅ User balance isolation  
✅ Total deposits tracking  

---

## 📦 Deployment Files

### 1. Full Deployment Data
**File:** `deploymentsV2.json`
```json
{
  "simpleDEXV2": {
    "address": "0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d",
    "abi": [...],
    "bytecode": "0x..."
  },
  "vaultWithSwap": {
    "address": "0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16",
    "abi": [...],
    "bytecode": "0x..."
  }
}
```

### 2. Contract Addresses
**File:** `addressesV2.json`
```json
{
  "simpleDEXV2": "0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d",
  "vaultWithSwap": "0x2D85E5E8E9C8A90609f147513B9cCc01F8deAB16"
}
```

---

## 🧪 Testing Scripts

### 1. Full Test Suite
**File:** `scripts/testV2.js`
- Test add liquidity to DEX
- Test all vault operations
- Comprehensive logging

### 2. Vault-Only Tests
**File:** `scripts/testVaultOnly.js`
- Focused vault testing
- 4 test cases (deposit, swap x2, withdraw)
- All tests passed ✅

### 3. Deployment Script
**File:** `scripts/deployV2.js`
- Compile contracts with solc
- Deploy to Mantle testnet
- Save ABIs and addresses

---

## 💡 Use Cases

### Liquidity Provider
1. Add liquidity to SimpleDEXV2
2. Receive liquidity tokens
3. Earn fees from swap transactions
4. Remove liquidity when needed

### Trader/User
1. Deposit assets into VaultWithSwap
2. Swap MNT ↔ USDT anytime
3. Keep balance in vault
4. Withdraw when needed

### Integrated Features
- Vault users don't need to interact directly with DEX
- Automatic approval and swap execution
- Real-time price estimation
- Protection against slippage

---

## 🚀 Future Enhancements

### SimpleDEXV2
- [ ] Multi-pair support (add other token pairs)
- [ ] Dynamic fee tiers
- [ ] Liquidity mining rewards
- [ ] Price oracle integration

### VaultWithSwap
- [ ] Yield farming strategies
- [ ] Auto-compound features
- [ ] Multi-DEX routing
- [ ] Limit orders
- [ ] Time-locked deposits

---

## 📞 Contract Interactions

### Get DEX Price
```javascript
const [mntPerUsdt, usdtPerMnt] = await simpleDEX.getPrice();
// mntPerUsdt: 0.2 (1 USDT = 0.2 MNT)
// usdtPerMnt: 5.0 (1 MNT = 5 USDT)
```

### Estimate Swap
```javascript
const amountOut = await vault.estimateSwap(true, ethers.parseEther('10'));
// true = MNT to USDT
// Returns: estimated USDT amount (with 0.3% fee)
```

### Check Vault Balance
```javascript
const [mnt, usdt] = await vault.getUserBalances(userAddress);
console.log(`MNT: ${ethers.formatEther(mnt)}`);
console.log(`USDT: ${ethers.formatUnits(usdt, 6)}`);
```

---

## 📊 Transaction History Summary

| Operation | Amount | Gas Used | Status |
|-----------|--------|----------|--------|
| Add Liquidity | 1000 MNT + 5000 USDT | ~250k | ✅ |
| Deposit MNT | 10 MNT | ~50k | ✅ |
| Deposit USDT | 50 USDT | ~65k | ✅ |
| Swap MNT→USDT | 5 MNT | ~180k | ✅ |
| Swap USDT→MNT | 20 USDT | ~185k | ✅ |
| Withdraw MNT | 2 MNT | ~45k | ✅ |
| Withdraw USDT | 10 USDT | ~50k | ✅ |

**Total Gas Spent:** ~825,000 gas (~0.825 MNT at 1 gwei)

---

## ✅ Conclusion

The DEX and Vault V2 system has been successfully deployed and tested on Mantle Sepolia Testnet. Both contracts operate stably with the following features:

✅ **SimpleDEXV2:** Functions as an AMM DEX with liquidity pool of 1000 MNT + 5000 USDT  
✅ **VaultWithSwap:** Successfully manages assets and integrates swaps  
✅ **Integration:** Vault calls DEX contract smoothly without errors  
✅ **Security:** Complete basic security measures  
✅ **Tests:** 100% test cases passed  

**Ready for Production:** Can be deployed to mainnet after thorough audit.

---

## 📚 Technical Stack

- **Blockchain:** Mantle Sepolia Testnet
- **Solidity:** 0.8.20
- **Libraries:** OpenZeppelin Contracts 5.0.0
- **Tools:** ethers.js 6.16.0, solc 0.8.20
- **Runtime:** Node.js with ES Modules
- **Testing:** Custom test scripts with comprehensive coverage

---

*Generated: January 6, 2026*
