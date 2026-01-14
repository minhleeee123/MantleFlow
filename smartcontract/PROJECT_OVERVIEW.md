# Mantle Testnet DeFi Project

## 📊 Tổng Quan Dự Án

Dự án này bao gồm 2 smart contracts chính được deploy trên **Mantle Sepolia Testnet**:

### 🏦 1. MultiTokenVault
Contract quản lý deposit/withdraw cho cả MNT (native token) và USDT. Cho phép users:
- Deposit và withdraw MNT một cách an toàn
- Deposit và withdraw USDT với SafeERC20
- Theo dõi balance riêng cho từng user
- Tích hợp các tính năng bảo mật: ReentrancyGuard, Pausable, Withdrawal Limits

### 💰 2. StakingRewards
Contract staking với APR 12% (có thể điều chỉnh), cho phép users:
- Stake USDT để nhận rewards theo thời gian
- Claim rewards bất cứ lúc nào
- Unstake với hoặc không có penalty (tùy lock period)
- Lock period và early withdrawal penalty có thể cấu hình

## 🎯 Deployed Contracts

| Contract | Address | Explorer |
|----------|---------|----------|
| **USDT Token** | `0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080` | [View](https://explorer.sepolia.mantle.xyz/address/0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080) |
| **MultiTokenVault** | `0x6Cc1488f65B88E415b2D15e78C463eb259F325cf` | [View](https://explorer.sepolia.mantle.xyz/address/0x6Cc1488f65B88E415b2D15e78C463eb259F325cf) |
| **StakingRewards** | `0x680Ff54FA49e9d8B1A7180015f9bE42F20682938` | [View](https://explorer.sepolia.mantle.xyz/address/0x680Ff54FA49e9d8B1A7180015f9bE42F20682938) |

## 🔑 Wallet Info

**Deployer Address**: `0xE412d04DA2A211F7ADC80311CC0FF9F03440B64E`

**Current Balances**:
- MNT: ~1829.3 MNT
- USDT: ~231.2 USDT

## 🚀 Quick Start

### 1. Kiểm tra Số Dư
```bash
cd testnet
node scripts/checkBalanceDirect.js
```

### 2. Xem Thông Tin Contracts
```bash
node scripts/interact.js
```

### 3. Deploy Lại (nếu cần)
```bash
node scripts/compileAndDeploy.js
```

## 📁 Cấu Trúc Project

```
vscode/
├── .env                          # Private keys và RPC URL
├── mainnet/                      # (empty)
└── testnet/                      # Mantle testnet contracts
    ├── contracts/
    │   ├── MultiTokenVault.sol   # Vault contract
    │   └── StakingRewards.sol    # Staking contract
    ├── scripts/
    │   ├── checkBalanceDirect.js # Check wallet balance
    │   ├── compileAndDeploy.js   # Compile & deploy
    │   └── interact.js            # Interact với contracts
    ├── deployments.json           # Contract addresses & ABIs
    ├── package.json
    ├── hardhat.config.js
    └── README.md                  # Documentation chi tiết
```

## 💡 Tính Năng Nổi Bật

### MultiTokenVault
✅ **Dual Token Support**: Hỗ trợ cả native token (MNT) và ERC20 (USDT)  
✅ **Per-User Accounting**: Theo dõi balance riêng cho từng user  
✅ **Flexible Withdrawals**: Withdraw một phần hoặc toàn bộ  
✅ **Security Features**: ReentrancyGuard, Pausable, Withdrawal Limits  
✅ **Emergency Functions**: Owner có thể emergency withdraw khi cần  

### StakingRewards
✅ **APR-Based Rewards**: 12% APR mặc định, có thể điều chỉnh  
✅ **Real-Time Rewards**: Rewards được tính theo thời gian thực  
✅ **Flexible Staking**: Stake/unstake bất cứ lúc nào  
✅ **Lock Period**: Có thể set lock period với penalty cho early withdrawal  
✅ **Auto-Claim**: Auto claim rewards khi stake thêm hoặc unstake  
✅ **Configurable Parameters**: APR, lock period, minimum stake, penalty đều có thể điều chỉnh  

## 🔐 Security

Cả 2 contracts đều implement:
- **ReentrancyGuard**: Chống reentrancy attacks
- **Pausable**: Có thể tạm dừng khi có sự cố
- **Ownable**: Access control cho admin functions
- **SafeERC20**: An toàn cho ERC20 transfers
- **Events**: Đầy đủ events cho monitoring

## 📖 Documentation

Chi tiết về cách sử dụng, xem [testnet/README.md](testnet/README.md)

## 🌐 Network Info

- **Network**: Mantle Sepolia Testnet
- **Chain ID**: 5003
- **RPC**: https://rpc.sepolia.mantle.xyz
- **Explorer**: https://explorer.sepolia.mantle.xyz

## ⚙️ Technology Stack

- **Smart Contracts**: Solidity 0.8.20
- **Libraries**: OpenZeppelin Contracts 5.0
- **Compiler**: solc
- **Deployment**: ethers.js 6.x
- **Node.js**: ES Modules

## 📊 Contract Statistics (Current)

### MultiTokenVault
- Total MNT Deposits: 0 MNT
- Total USDT Deposits: 0 USDT
- Active Users: 0

### StakingRewards
- Total Staked: 0 USDT
- Total Rewards Distributed: 0 USDT
- Current APR: 12%
- Lock Period: 0 (no lock)
- Early Withdrawal Penalty: 5%

## 🎓 Use Cases

1. **Personal Vault**: Store MNT và USDT một cách an toàn
2. **Yield Farming**: Stake USDT để earn passive income
3. **Portfolio Management**: Quản lý assets trong một nơi
4. **Testing Ground**: Test DeFi strategies trên testnet

## 🔄 Future Improvements

Những tính năng có thể thêm trong tương lai:
- [ ] Support thêm nhiều tokens
- [ ] Yield farming với multiple pools
- [ ] NFT staking
- [ ] Governance token
- [ ] Liquidity mining
- [ ] Flash loans
- [ ] Vault strategies (auto-compound, etc.)
- [ ] Web UI/Frontend

## ⚠️ Disclaimer

**Testnet Only**: Đây là contracts testnet chỉ dùng để test và học tập. Không sử dụng cho production/mainnet mà không có audit đầy đủ.

## 📞 Contact

Nếu có câu hỏi hoặc cần support:
- Create an issue on GitHub
- Email: [your-email]

## 📜 License

MIT License - Free to use and modify

---

**Happy Building! 🚀**
