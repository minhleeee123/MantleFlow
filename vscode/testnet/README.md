# 🎯 Mantle Testnet DeFi Suite

Bộ **7 smart contracts DeFi hoàn chỉnh** trên **Mantle Sepolia Testnet** với các tính năng: Vault, Staking, DEX/AMM, Lending, Referral, NFT Staking, và Auto-Compound.

---

## 📋 Danh sách Contracts

| # | Contract | Địa chỉ | Tính năng | Test |
|---|----------|---------|-----------|------|
| 1 | **MultiTokenVault** | `0x6Cc1...5cf` | Deposit/Withdraw MNT & USDT | ✅ PASS |
| 2 | **SimpleDEX** | `0x7D4F...c23` | Swap MNT/USDT, Add Liquidity | ✅ PASS |
| 3 | **LendingPool** | `0x67e5...c58` | Supply, Borrow với Collateral | ⚠️ Partial |
| 4 | **StakingRewards** | `0x680F...938` | Stake USDT, 12% APR | ✅ Deployed |
| 5 | **AutoCompoundStaking** | `0xd918...07F` | Auto-reinvest rewards | ⚠️ Partial |
| 6 | **ReferralRewards** | `0x1CfF...06` | 3-level referral (5%/2%/1%) | ✅ Deployed |
| 7 | **NFTStaking** | `0x15De...cbf` | Stake NFTs for USDT | ✅ Deployed |

**USDT Token (Testnet):** `0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080`

---

## 🚀 Quick Start

### 1. Kiểm tra số dư ví
```bash
cd testnet
node scripts/checkBalanceDirect.js
```

### 2. Test các tính năng

**Test Deposit/Withdraw:**
```bash
node scripts/testDepositWithdraw.js
```

**Test DEX (Swap MNT ↔ USDT):**
```bash
node scripts/testSimpleDEX.js
```

**Test Lending Pool:**
```bash
node scripts/testLendingPool.js
```

**Test Auto-Compound Staking:**
```bash
node scripts/testAutoCompoundStaking.js
```

---

## 💡 Các tính năng chính

### 1️⃣ MultiTokenVault
- Nạp/rút MNT (native token)
- Nạp/rút USDT (testnet)  
- An toàn với ReentrancyGuard
- ✅ **Test passed 100%**

### 2️⃣ SimpleDEX (AMM)
- Swap MNT ↔ USDT
- Add/Remove Liquidity
- Fee 0.3% mỗi swap
- Constant product formula (x*y=k)
- ✅ **Test passed 100%**

### 3️⃣ LendingPool
- Supply MNT/USDT để kiếm lãi (5-6% APR)
- Borrow với collateral 150%
- Liquidation threshold 120%
- ⚠️ **Test partial (70%)**

### 4️⃣ StakingRewards
- Stake USDT
- 12% APR
- Lock period tùy chọn
- Early withdrawal penalty 5%

### 5️⃣ AutoCompoundStaking
- Auto-reinvest rewards
- 12% base APR + 2% compound bonus
- Toggle auto-compound on/off
- Projected value calculator
- ⚠️ **Test partial (40%)**

### 6️⃣ ReferralRewards
- 3-level referral system
- Level 1: 5%, Level 2: 2%, Level 3: 1%
- Track referral chain

### 7️⃣ NFTStaking
- Stake NFTs để nhận USDT
- Support multiple NFT collections
- Configurable reward rates

---

## 📊 Kết quả Test

### ✅ MultiTokenVault (100%)
```
✅ Deposited 2 MNT
✅ Deposited 20 USDT
✅ Withdrew 1 MNT
✅ Withdrew 10 USDT
```

### ✅ SimpleDEX (100%)
```
✅ Added liquidity: 10 MNT + 100 USDT
✅ Swapped 1 MNT → 9.066 USDT
✅ Swapped 20 USDT → 1.978 MNT
```

### ⚠️ LendingPool (70%)
```
✅ Supplied 5 MNT
✅ Supplied 20 USDT  
✅ Borrowed 15 USDT with 3 MNT collateral
⚠️ Repay incomplete (need more USDT)
```

### ⚠️ AutoCompoundStaking (40%)
```
✅ Deposited 5 USDT as rewards
⚠️ Staking test skipped (need more USDT)
```

---

## 🔗 Explorer Links

Xem tất cả contracts trên Mantle Sepolia Explorer:

1. [MultiTokenVault](https://explorer.sepolia.mantle.xyz/address/0x6Cc1488f65B88E415b2D15e78C463eb259F325cf)
2. [SimpleDEX](https://explorer.sepolia.mantle.xyz/address/0x7D4Fa5140b5cE4e22910874b2F014eF2646BEc23)
3. [LendingPool](https://explorer.sepolia.mantle.xyz/address/0x67e51336B642A8520914891aAfad0bd0b034Bc58)
4. [StakingRewards](https://explorer.sepolia.mantle.xyz/address/0x680Ff54FA49e9d8B1A7180015f9bE42F20682938)
5. [AutoCompoundStaking](https://explorer.sepolia.mantle.xyz/address/0xd918874c61d16c9DdBE2B362f6Fe1A1e1976207F)
6. [ReferralRewards](https://explorer.sepolia.mantle.xyz/address/0x1CfFaf9cf58095590075a1c7bb8734ee8ffBbc06)
7. [NFTStaking](https://explorer.sepolia.mantle.xyz/address/0x15De9e1088Efc4F4677902cf561c1fc9d6BF5cbf)

---

## 📁 Cấu trúc Project

```
testnet/
├── contracts/              # Smart contracts (.sol)
│   ├── MultiTokenVault.sol
│   ├── SimpleDEX.sol
│   ├── LendingPool.sol
│   ├── StakingRewards.sol
│   ├── AutoCompoundStaking.sol
│   ├── ReferralRewards.sol
│   └── NFTStaking.sol
├── scripts/                # Test & deploy scripts
│   ├── checkBalanceDirect.js
│   ├── testDepositWithdraw.js
│   ├── testSimpleDEX.js
│   ├── testLendingPool.js
│   ├── testAutoCompoundStaking.js
│   ├── deployNewContracts.js
│   └── compileAndDeploy.js
├── deployments.json        # Contract addresses (first 2)
├── deployments-new.json    # Contract addresses (last 5)
├── addresses.json          # Quick address lookup
├── PROJECT_SUMMARY.md      # Detailed documentation
└── README.md               # This file
```

---

## 🎯 Thành tựu

✅ **7 Smart Contracts** deployed successfully  
✅ **20+ DeFi Features** implemented  
✅ **4 Test Scripts** created  
✅ **2 Full Tests Passed** (MultiTokenVault, SimpleDEX)  
✅ **Security Best Practices** applied  

---

## 🛠️ Tech Stack

- **Blockchain:** Mantle Sepolia Testnet (Chain ID: 5003)
- **Solidity:** 0.8.20
- **OpenZeppelin:** 5.0.0
- **ethers.js:** 6.16.0
- **Node.js:** ES Modules

---

## 📖 Chi tiết Documentation

Xem file [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) để biết thêm chi tiết về:
- Tất cả functions của mỗi contract
- Test results đầy đủ
- Security features
- Future enhancements

---

## ⚠️ Lưu ý

- Đây là **testnet deployment** - tokens không có giá trị thật
- Contracts chưa được audit
- Chỉ dùng cho mục đích development/testing
- Cần MNT testnet cho gas fees
- Cần USDT testnet cho operations

---

## 🏁 Next Steps

1. **Lấy thêm testnet tokens:**
   - MNT: Mantle testnet faucet
   - USDT: Contact faucet hoặc swap từ DEX

2. **Complete testing:**
   ```bash
   node scripts/testLendingPool.js
   node scripts/testAutoCompoundStaking.js
   ```

3. **Test các contract còn lại:**
   - StakingRewards
   - ReferralRewards
   - NFTStaking

4. **Build Frontend:**
   - React/Next.js
   - Web3 integration
   - User-friendly interface

---

*Developed for Mantle Hackathon 🚀*

```bash
cd testnet
npm install --legacy-peer-deps
```

## 🔧 Scripts

### Kiểm tra số dư ví
```bash
node scripts/checkBalanceDirect.js
```

### Compile và Deploy contracts
```bash
node scripts/compileAndDeploy.js
```

### Tương tác với contracts
```bash
node scripts/interact.js
```

## 💻 Sử Dụng

### 1. Deposit MNT vào Vault

```javascript
import { ethers } from "ethers";

// Setup
const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const vaultAddress = "0x6Cc1488f65B88E415b2D15e78C463eb259F325cf";
const vaultABI = [...]; // Load from deployments.json

const vault = new ethers.Contract(vaultAddress, vaultABI, wallet);

// Deposit 10 MNT
const tx = await vault.depositMnt({ 
  value: ethers.parseEther("10") 
});
await tx.wait();

console.log("Deposited 10 MNT!");
```

### 2. Deposit USDT vào Vault

```javascript
const usdtAddress = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";
const usdtABI = [
  "function approve(address,uint256) returns (bool)"
];

const usdt = new ethers.Contract(usdtAddress, usdtABI, wallet);

// Approve USDT
await usdt.approve(vaultAddress, ethers.parseUnits("100", 6));

// Deposit 100 USDT
await vault.depositUsdt(ethers.parseUnits("100", 6));
```

### 3. Stake USDT

```javascript
const stakingAddress = "0x680Ff54FA49e9d8B1A7180015f9bE42F20682938";
const stakingABI = [...]; // Load from deployments.json

const staking = new ethers.Contract(stakingAddress, stakingABI, wallet);

// Approve USDT for staking
await usdt.approve(stakingAddress, ethers.parseUnits("50", 6));

// Stake 50 USDT
await staking.stake(ethers.parseUnits("50", 6));

console.log("Staked 50 USDT!");
```

### 4. Claim Rewards

```javascript
// Claim rewards
const tx = await staking.claimRewards();
await tx.wait();

console.log("Rewards claimed!");
```

### 5. Unstake

```javascript
// Unstake 25 USDT
await staking.unstake(ethers.parseUnits("25", 6));

// Hoặc unstake toàn bộ
await staking.unstakeAll();
```

## 📊 View Functions

### Vault

```javascript
// Get user's MNT balance in vault
const mntBalance = await vault.getMntBalance(userAddress);

// Get user's USDT balance in vault
const usdtBalance = await vault.getUsdtBalance(userAddress);

// Get total MNT in vault
const totalMnt = await vault.getTotalMntInVault();

// Get total USDT in vault
const totalUsdt = await vault.getTotalUsdtInVault();
```

### Staking

```javascript
// Get stake info
const stakeInfo = await staking.getStakeInfo(userAddress);
// Returns: amount, startTime, lastClaimTime, totalRewardsClaimed, pendingRewards, isLocked

// Calculate current rewards
const rewards = await staking.calculateRewards(userAddress);

// Get pool statistics
const poolStats = await staking.getPoolStats();
// Returns: totalStaked, totalRewardsDistributed, availableRewards, apr

// Check if stake is locked
const isLocked = await staking.isStakeLocked(userAddress);
```

## 🔐 Security Features

### MultiTokenVault
- ✅ **ReentrancyGuard**: Chống reentrancy attacks
- ✅ **Pausable**: Owner có thể pause contract khi cần
- ✅ **Withdrawal Limits**: Giới hạn số lượng có thể withdraw
- ✅ **SafeERC20**: Sử dụng OpenZeppelin SafeERC20 cho USDT transfers
- ✅ **Events**: Emit events cho mọi state changes

### StakingRewards
- ✅ **ReentrancyGuard**: Chống reentrancy attacks
- ✅ **Pausable**: Owner có thể pause contract
- ✅ **Lock Period**: Có thể lock stake trong một khoảng thời gian
- ✅ **Early Withdrawal Penalty**: Phạt nếu rút sớm (khi có lock period)
- ✅ **APR Limits**: Giới hạn APR tối đa 500%
- ✅ **Penalty Limits**: Giới hạn penalty tối đa 20%

## 🛠️ Admin Functions

### Vault (Owner Only)

```javascript
// Set withdrawal limits
await vault.setWithdrawalLimits(
  ethers.parseEther("1000"),    // Max MNT withdrawal
  ethers.parseUnits("10000", 6) // Max USDT withdrawal
);

// Pause contract
await vault.pause();

// Unpause contract
await vault.unpause();

// Emergency withdrawal (use with caution!)
await vault.emergencyWithdrawMnt(ownerAddress, amount);
await vault.emergencyWithdrawUsdt(ownerAddress, amount);
```

### Staking (Owner Only)

```javascript
// Set APR (in basis points, 1200 = 12%)
await staking.setApr(1500); // 15% APR

// Set lock period (in seconds)
await staking.setLockPeriod(7 * 24 * 60 * 60); // 7 days

// Set minimum stake amount
await staking.setMinStakeAmount(ethers.parseUnits("10", 6)); // 10 USDT minimum

// Set early withdrawal penalty (in basis points, 500 = 5%)
await staking.setEarlyWithdrawalPenalty(1000); // 10% penalty

// Deposit rewards into pool
await usdt.approve(stakingAddress, rewardsAmount);
await staking.depositRewards(rewardsAmount);

// Pause/Unpause
await staking.pause();
await staking.unpause();
```

## 📝 Network Information

- **Network**: Mantle Sepolia Testnet
- **Chain ID**: 5003
- **RPC URL**: https://rpc.sepolia.mantle.xyz
- **Explorer**: https://explorer.sepolia.mantle.xyz
- **Faucet**: Tìm trên Discord của Mantle

## 📄 Contract Files

- `contracts/MultiTokenVault.sol` - Vault contract
- `contracts/StakingRewards.sol` - Staking contract
- `scripts/checkBalanceDirect.js` - Check wallet balance
- `scripts/compileAndDeploy.js` - Compile và deploy contracts
- `scripts/interact.js` - Interact với deployed contracts
- `deployments.json` - Thông tin contracts đã deploy

## ⚠️ Lưu Ý

1. **Testnet Only**: Các contracts này được deploy trên testnet, không dùng cho mainnet
2. **Private Key**: Không chia sẻ private key của bạn
3. **Smart Contract Risk**: Luôn audit code trước khi sử dụng với real funds
4. **Gas Fees**: Cần có MNT trong ví để trả gas fees
5. **Approvals**: Cần approve USDT trước khi deposit hoặc stake

## 🤝 Contributing

Nếu bạn muốn đóng góp hoặc báo lỗi, hãy tạo issue hoặc pull request.

## 📞 Support

Nếu có vấn đề hoặc câu hỏi, vui lòng liên hệ qua:
- GitHub Issues
- Email: [your-email]

## 📜 License

MIT License
