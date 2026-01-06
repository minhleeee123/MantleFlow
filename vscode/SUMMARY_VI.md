# ✅ HOÀN THÀNH - Dự Án Smart Contract Mantle Testnet

## 📋 Tóm Tắt

Tôi đã hoàn thành việc viết và deploy 2 smart contracts lên **Mantle Sepolia Testnet** với đầy đủ các tính năng bạn yêu cầu:

### 🎯 Contracts Đã Deploy

1. **MultiTokenVault** - Contract quản lý nạp/rút MNT và USDT
2. **StakingRewards** - Contract staking USDT với APR 12%

---

## 💰 Thông Tin Ví Của Bạn

```
Address: 0xE412d04DA2A211F7ADC80311CC0FF9F03440B64E
MNT Balance: 1829.3 MNT
USDT Balance: 231.2 USDT
Network: Mantle Sepolia Testnet
```

---

## 🚀 Địa Chỉ Contracts

### USDT Testnet Token
```
Address: 0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080
```
(Đây là địa chỉ bạn cung cấp)

### MultiTokenVault (Nạp/Rút MNT & USDT)
```
Address: 0x6Cc1488f65B88E415b2D15e78C463eb259F325cf
Explorer: https://explorer.sepolia.mantle.xyz/address/0x6Cc1488f65B88E415b2D15e78C463eb259F325cf
```

### StakingRewards (Staking USDT)
```
Address: 0x680Ff54FA49e9d8B1A7180015f9bE42F20682938
Explorer: https://explorer.sepolia.mantle.xyz/address/0x680Ff54FA49e9d8B1A7180015f9bE42F20682938
```

---

## ✨ Tính Năng Đã Implement

### 📦 MultiTokenVault - Nạp/Rút MNT & USDT

#### Nạp/Rút MNT (Native Token)
- ✅ **depositMnt()** - Nạp MNT vào vault
- ✅ **withdrawMnt(amount)** - Rút MNT từ vault
- ✅ **withdrawAllMnt()** - Rút toàn bộ MNT
- ✅ **getMntBalance(user)** - Xem số dư MNT

#### Nạp/Rút USDT
- ✅ **depositUsdt(amount)** - Nạp USDT vào vault
- ✅ **withdrawUsdt(amount)** - Rút USDT từ vault
- ✅ **withdrawAllUsdt()** - Rút toàn bộ USDT
- ✅ **getUsdtBalance(user)** - Xem số dư USDT

#### Tính Năng Khác
- ✅ Theo dõi balance riêng cho từng user
- ✅ Withdrawal limits có thể cấu hình
- ✅ Pause/Unpause contract
- ✅ Emergency withdrawal (owner only)
- ✅ ReentrancyGuard - Chống reentrancy attack
- ✅ SafeERC20 - An toàn cho token transfers

### 💰 StakingRewards - Staking với APR

#### Staking Functions
- ✅ **stake(amount)** - Stake USDT để nhận rewards
- ✅ **unstake(amount)** - Unstake một phần
- ✅ **unstakeAll()** - Unstake toàn bộ
- ✅ **claimRewards()** - Claim rewards
- ✅ **calculateRewards(user)** - Tính rewards hiện tại

#### Thông Tin Staking
- ✅ **APR**: 12% (có thể điều chỉnh)
- ✅ **Lock Period**: 0 (không lock, có thể cấu hình)
- ✅ **Min Stake**: 1 USDT
- ✅ **Early Withdrawal Penalty**: 5% (nếu có lock period)
- ✅ **Rewards**: Tính theo thời gian thực

#### Tính Năng Nâng Cao
- ✅ Auto-claim rewards khi stake thêm hoặc unstake
- ✅ Real-time rewards calculation
- ✅ Configurable APR, lock period, penalties
- ✅ Pool statistics tracking
- ✅ Owner có thể deposit rewards vào pool

---

## 🛠️ Scripts Đã Tạo

### 1. checkBalanceDirect.js
Kiểm tra số dư MNT và USDT trong ví
```bash
cd testnet
node scripts/checkBalanceDirect.js
```

### 2. compileAndDeploy.js
Compile và deploy contracts (đã chạy thành công)
```bash
node scripts/compileAndDeploy.js
```

### 3. interact.js
Xem thông tin contracts và hướng dẫn sử dụng
```bash
node scripts/interact.js
```

### 4. demo.js
Demo đầy đủ các chức năng: deposit, stake, rewards
```bash
node scripts/demo.js
```

---

## 📖 Hướng Dẫn Sử Dụng Nhanh

### Nạp MNT vào Vault

```javascript
import { ethers } from "ethers";

const provider = new ethers.JsonRpcProvider("https://rpc.sepolia.mantle.xyz");
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

const vaultAddress = "0x6Cc1488f65B88E415b2D15e78C463eb259F325cf";
const vaultABI = [...]; // Load from deployments.json

const vault = new ethers.Contract(vaultAddress, vaultABI, wallet);

// Nạp 10 MNT
await vault.depositMnt({ value: ethers.parseEther("10") });
```

### Nạp USDT vào Vault

```javascript
const usdtAddress = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";
const usdt = new ethers.Contract(usdtAddress, usdtABI, wallet);

// Approve USDT
await usdt.approve(vaultAddress, ethers.parseUnits("100", 6));

// Nạp 100 USDT
await vault.depositUsdt(ethers.parseUnits("100", 6));
```

### Stake USDT

```javascript
const stakingAddress = "0x680Ff54FA49e9d8B1A7180015f9bE42F20682938";
const staking = new ethers.Contract(stakingAddress, stakingABI, wallet);

// Approve USDT cho staking
await usdt.approve(stakingAddress, ethers.parseUnits("50", 6));

// Stake 50 USDT
await staking.stake(ethers.parseUnits("50", 6));
```

### Claim Rewards

```javascript
// Claim rewards (tự động nhận USDT rewards)
await staking.claimRewards();
```

### Rút/Unstake

```javascript
// Rút MNT
await vault.withdrawMnt(ethers.parseEther("5"));

// Rút USDT
await vault.withdrawUsdt(ethers.parseUnits("50", 6));

// Unstake
await staking.unstake(ethers.parseUnits("25", 6));
// hoặc
await staking.unstakeAll();
```

---

## 🔐 Bảo Mật

Cả 2 contracts đều có:

✅ **ReentrancyGuard** - Chống reentrancy attacks  
✅ **Pausable** - Có thể tạm dừng contract  
✅ **Ownable** - Chỉ owner mới có quyền admin  
✅ **SafeERC20** - An toàn cho ERC20 transfers  
✅ **Input Validation** - Kiểm tra input đầy đủ  
✅ **Events** - Emit events cho mọi actions  

---

## 📁 Files Quan Trọng

```
testnet/
├── contracts/
│   ├── MultiTokenVault.sol     ✅ Contract nạp/rút
│   └── StakingRewards.sol      ✅ Contract staking
├── scripts/
│   ├── checkBalanceDirect.js   ✅ Check balance
│   ├── compileAndDeploy.js     ✅ Deploy script
│   ├── interact.js             ✅ Interact script
│   └── demo.js                 ✅ Demo script
├── deployments.json            ✅ Addresses & ABIs
├── README.md                   ✅ Hướng dẫn chi tiết
└── DEPLOYMENT_SUMMARY.md       ✅ Tóm tắt deployment
```

---

## 🎯 Các Bước Tiếp Theo

### Để Test Ngay Bây Giờ:

1. **Xem thông tin contracts:**
   ```bash
   cd testnet
   node scripts/interact.js
   ```

2. **Chạy demo (test tất cả tính năng):**
   ```bash
   node scripts/demo.js
   ```

3. **Hoặc tự tương tác bằng code:**
   - Load deployments.json để lấy addresses và ABIs
   - Sử dụng ethers.js như examples ở trên

### Nếu Muốn Deploy Lại:

```bash
node scripts/compileAndDeploy.js
```

---

## 💡 Notes

1. **MNT** là native token trên Mantle (giống như ETH trên Ethereum), không cần địa chỉ contract
2. **USDT** address mà bạn cung cấp: `0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080`
3. Tất cả contracts đã được deploy và hoạt động
4. Bạn có thể xem trên explorer bằng links ở trên

---

## 🌟 Tính Năng Nổi Bật

### MultiTokenVault
- Hỗ trợ cả native token (MNT) và ERC20 (USDT)
- Tracking balance riêng cho từng user
- Withdrawal limits có thể cấu hình
- Emergency functions cho owner

### StakingRewards
- APR 12% mặc định (owner có thể điều chỉnh)
- Rewards tính theo thời gian thực
- Hỗ trợ lock period và penalties
- Auto-claim rewards
- Minimum stake amount có thể cấu hình

---

## ❓ Câu Hỏi Thường Gặp

**Q: Làm sao để nạp MNT?**  
A: Gọi `vault.depositMnt({ value: amount })`

**Q: Làm sao để nạp USDT?**  
A: Approve trước: `usdt.approve(vaultAddress, amount)`, sau đó `vault.depositUsdt(amount)`

**Q: Rewards được tính như thế nào?**  
A: APR 12% = (stake amount × 12% × time) / 365 days

**Q: Có thể rút MNT/USDT bất cứ lúc nào không?**  
A: Có, từ vault thì luôn rút được. Từ staking thì xem lock period.

**Q: Lock period là gì?**  
A: Hiện tại = 0 (không lock), có thể unstake bất cứ lúc nào

---

## 🎉 Kết Luận

✅ **2 Smart Contracts** đã được viết và deploy thành công  
✅ **Đầy đủ tính năng** như yêu cầu: nạp/rút MNT, nạp/rút USDT, staking  
✅ **Bảo mật tốt** với OpenZeppelin và best practices  
✅ **Scripts đầy đủ** để test và interact  
✅ **Documentation chi tiết** trong README.md  

**Mọi thứ đã sẵn sàng để sử dụng!** 🚀

---

## 📞 Liên Hệ

Nếu có vấn đề hoặc cần hỗ trợ:
- Xem README.md trong folder testnet/
- Xem DEPLOYMENT_SUMMARY.md để biết chi tiết
- Chạy `node scripts/interact.js` để xem thông tin contracts

**Happy Building! 🎊**
