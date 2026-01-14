# 🔧 Troubleshooting Guide - Common Errors & Solutions

## 📋 Table of Contents

1. [Compilation Errors](#compilation-errors)
2. [Deployment Errors](#deployment-errors)
3. [Testing Errors](#testing-errors)
4. [Contract Interaction Errors](#contract-interaction-errors)
5. [Balance & Token Errors](#balance--token-errors)
6. [Configuration Issues](#configuration-issues)

---

## 🛠️ Compilation Errors

### Error 1: Hardhat ESM Module Conflicts

**Lỗi:**
```
Error [ERR_REQUIRE_ESM]: require() of ES Module not supported
```

**Nguyên nhân:**
- Node.js version conflicts với Hardhat
- package.json có `"type": "module"` nhưng Hardhat không support ES modules tốt

**Cách sửa:**
✅ **Giải pháp: Bypass Hardhat, sử dụng solc trực tiếp**

```javascript
import solc from 'solc';
import fs from 'fs';
import path from 'path';

// Tạo hàm findImports để resolve OpenZeppelin dependencies
function findImports(importPath) {
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', importPath),
    path.join(process.cwd(), '..', 'node_modules', importPath),
    path.join(process.cwd(), 'node_modules', '@openzeppelin', 'contracts', importPath.replace('@openzeppelin/contracts/', ''))
  ];
  
  for (const fullPath of possiblePaths) {
    if (fs.existsSync(fullPath)) {
      return { contents: fs.readFileSync(fullPath, 'utf8') };
    }
  }
  return { error: 'File not found: ' + importPath };
}

// Compile contract
const input = {
  language: 'Solidity',
  sources: {
    'Contract.sol': { content: sourceCode }
  },
  settings: {
    outputSelection: { '*': { '*': ['abi', 'evm.bytecode'] } },
    optimizer: { enabled: true, runs: 200 }
  }
};

const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
```

**Kết quả:** ✅ Compile thành công tất cả 7 contracts

---

### Error 2: Import Path Not Found

**Lỗi:**
```
Error: File not found: @openzeppelin/contracts/token/ERC20/IERC20.sol
```

**Nguyên nhân:**
- OpenZeppelin packages không được cài đặt đúng
- Import path không đúng trong findImports function

**Cách sửa:**
✅ **Giải pháp 1: Cài đặt OpenZeppelin**
```bash
npm install @openzeppelin/contracts@5.0.0
```

✅ **Giải pháp 2: Update findImports với nhiều possible paths**
```javascript
function findImports(importPath) {
  const possiblePaths = [
    path.join(process.cwd(), 'node_modules', importPath),
    path.join(process.cwd(), '..', 'node_modules', importPath),
    // Thêm path cho OpenZeppelin
    path.join(process.cwd(), 'node_modules', '@openzeppelin', 'contracts', 
              importPath.replace('@openzeppelin/contracts/', ''))
  ];
  // ... check each path
}
```

---

## 🚀 Deployment Errors

### Error 3: Invalid Private Key

**Lỗi:**
```
TypeError: invalid private key (argument="privateKey", value="[ REDACTED ]", 
code=INVALID_ARGUMENT, version=6.16.0)
```

**Nguyên nhân:**
- Script tìm `process.env.PRIVATE_KEY` nhưng .env có `DEPLOYER_PRIVATE_KEY`
- Hoặc private key format không đúng

**Cách sửa:**
✅ **Giải pháp 1: Support nhiều tên biến**
```javascript
const privateKey = process.env.DEPLOYER_PRIVATE_KEY || 
                   process.env.PRIVATE_KEY || 
                   process.env.ADMIN_PRIVATE_KEY;

if (!privateKey) {
  throw new Error('Missing private key in .env file');
}

const wallet = new ethers.Wallet(privateKey, provider);
```

✅ **Giải pháp 2: Validate private key format**
```javascript
// Private key phải có 0x prefix và 64 hex characters
if (!privateKey.startsWith('0x') || privateKey.length !== 66) {
  throw new Error('Invalid private key format');
}
```

**Kết quả:** ✅ Deployment scripts chạy thành công

---

### Error 4: Insufficient Gas Funds

**Lỗi:**
```
Error: insufficient funds for intrinsic transaction cost
```

**Nguyên nhân:**
- Wallet không có đủ MNT để trả gas fees

**Cách sửa:**
✅ **Check balance trước khi deploy:**
```javascript
const balance = await provider.getBalance(wallet.address);
console.log('Balance:', ethers.formatEther(balance), 'MNT');

if (balance < ethers.parseEther('0.1')) {
  throw new Error('Insufficient MNT for deployment. Need at least 0.1 MNT');
}
```

✅ **Get testnet MNT từ faucet:**
- Mantle Sepolia Faucet: https://faucet.sepolia.mantle.xyz

---

## 🧪 Testing Errors

### Error 5: Contract Target is Null/Undefined

**Lỗi:**
```
TypeError: invalid value for Contract target (argument="target", value=null, 
code=INVALID_ARGUMENT)
```

**Nguyên nhân:**
- File addresses.json không tồn tại hoặc format sai
- Contract address không được load đúng

**Cách sửa:**
✅ **Validate file existence và content:**
```javascript
import fs from 'fs';
import path from 'path';

const addressesPath = path.join(__dirname, '..', 'addresses.json');

// Check file exists
if (!fs.existsSync(addressesPath)) {
  throw new Error('addresses.json not found. Run deployment first.');
}

// Parse and validate
let addresses;
try {
  const content = fs.readFileSync(addressesPath, 'utf8');
  addresses = JSON.parse(content);
} catch (error) {
  throw new Error('Invalid addresses.json format: ' + error.message);
}

// Validate required addresses
if (!addresses.simpleDEX) {
  throw new Error('SimpleDEX address not found in addresses.json');
}

const DEX_ADDRESS = addresses.simpleDEX;
```

**Kết quả:** ✅ Contract instances được tạo thành công

---

### Error 6: JSON Parse Error (BOM Issue)

**Lỗi:**
```
SyntaxError: Unexpected token '', "{
    "n"... is not valid JSON
```

**Nguyên nhân:**
- File JSON có BOM (Byte Order Mark) từ PowerShell
- PowerShell's `ConvertTo-Json` thêm UTF-8 BOM

**Cách sửa:**
✅ **Tạo file JSON không có BOM:**
```powershell
# Sử dụng here-string và -NoNewline
@'
{
  "simpleDEX": "0x7D4Fa5140b5cE4e22910874b2F014eF2646BEc23",
  "lendingPool": "0x67e51336B642A8520914891aAfad0bd0b034Bc58"
}
'@ | Set-Content addresses.json -NoNewline
```

✅ **Hoặc strip BOM khi đọc:**
```javascript
const content = fs.readFileSync(addressesPath, 'utf8')
  .replace(/^\uFEFF/, ''); // Remove BOM if present
const addresses = JSON.parse(content);
```

**Kết quả:** ✅ JSON parse thành công

---

## 📝 Contract Interaction Errors

### Error 7: Function/Property Not Found

**Lỗi:**
```
Error: execution reverted (no data present; likely require(false) occurred)
```

**Nguyên nhân:**
- ABI trong test script không khớp với contract đã deploy
- Function name hoặc property name sai

**Ví dụ 1: SimpleDEX**
```javascript
// ❌ SAI - Contract có liquidityBalance
const userLiquidity = await dex.liquidityProviders(wallet.address);

// ✅ ĐÚNG
const userLiquidity = await dex.liquidityBalance(wallet.address);
```

**Ví dụ 2: LendingPool**
```javascript
// ❌ SAI - Contract chỉ có 1 hàm repay()
await lending.repayToken(amount);
await lending.repayMnt(amount);

// ✅ ĐÚNG - Universal repay function
await lending.repay(); // For token borrow, transfer USDT first
// Or with MNT value for MNT borrow
await lending.repay({ value: amount });
```

**Cách sửa:**
✅ **Đọc contract source code để xác định chính xác:**
```javascript
// Check trong contracts/SimpleDEX.sol
mapping(address => uint256) public liquidityBalance; // ✅ Đúng tên

// Update ABI
const DEX_ABI = [
  "function liquidityBalance(address) external view returns (uint256)", // ✅
  // ...
];
```

**Kết quả:** ✅ Tất cả contract calls thành công

---

### Error 8: Already Have Active Borrow

**Lỗi:**
```
Error: execution reverted: "Already have active borrow"
```

**Nguyên nhân:**
- LendingPool chỉ cho phép 1 khoản vay active tại 1 thời điểm
- Test script cố gắng borrow khi đã có khoản vay cũ

**Cách sửa:**
✅ **Check và repay existing borrow trước:**
```javascript
// Check for existing borrow
let existingBorrow = await lending.borrows(wallet.address);

if (existingBorrow.amount > 0n) {
  console.log('⚠️  You already have an active borrow. Repaying it first...');
  
  // Calculate total debt
  const apr = existingBorrow.isToken ? 900 : 800;
  const interest = await lending.calculateBorrowInterest(
    existingBorrow.amount, 
    existingBorrow.timestamp, 
    apr
  );
  const totalDebt = existingBorrow.amount + interest;
  
  // Approve and repay
  await usdt.approve(LENDING_ADDRESS, totalDebt);
  await lending.repay();
  
  console.log('✅ Existing borrow repaid!');
}

// Now can borrow new loan
await lending.borrowTokenWithMntCollateral(borrowAmount, { value: collateral });
```

**Kết quả:** ✅ Borrow mới thành công sau khi repay

---

## 💰 Balance & Token Errors

### Error 9: Transfer Amount Exceeds Balance

**Lỗi:**
```
Error: execution reverted: "ERC20: transfer amount exceeds balance"
```

**Nguyên nhân:**
- Wallet không có đủ USDT cho operation
- Test script hardcode số lượng quá lớn

**Cách sửa:**
✅ **Dynamic balance check:**
```javascript
// Check available balance
const availableBalance = await usdt.balanceOf(wallet.address);
console.log(`💰 Available USDT: ${ethers.formatUnits(availableBalance, 6)}`);

// Skip test nếu không đủ
if (availableBalance < ethers.parseUnits('1', 6)) {
  console.log('⚠️  Insufficient USDT balance for testing. Need at least 1 USDT.');
  console.log('⏩ Skipping this test...');
  return;
}

// Sử dụng một phần của balance thay vì hardcode
const stakeAmount = availableBalance / 2n; // Stake 50% of available
console.log(`💎 Staking ${ethers.formatUnits(stakeAmount, 6)} USDT`);
```

✅ **Adjust test amounts:**
```javascript
// Before: Fixed amounts
const supplyAmount = ethers.parseUnits('50', 6); // ❌ Might fail

// After: Dynamic amounts
const maxSafeAmount = (await usdt.balanceOf(wallet.address)) * 90n / 100n;
const supplyAmount = ethers.parseUnits('20', 6) < maxSafeAmount 
  ? ethers.parseUnits('20', 6) 
  : maxSafeAmount; // ✅ Safe
```

**Kết quả:** ✅ Tests adapt to available balance

---

### Error 10: Approval Not Set

**Lỗi:**
```
Error: execution reverted: "ERC20: insufficient allowance"
```

**Nguyên nhân:**
- Quên approve token trước khi contract transfer
- Approve amount nhỏ hơn actual transfer amount

**Cách sửa:**
✅ **Always approve before transfer:**
```javascript
// Step 1: Approve
console.log('📝 Approving USDT...');
const approveTx = await usdt.approve(CONTRACT_ADDRESS, amount);
await approveTx.wait();
console.log('✅ USDT approved');

// Step 2: Execute operation
console.log('📝 Depositing...');
const depositTx = await contract.deposit(amount);
await depositTx.wait();
console.log('✅ Deposited!');
```

✅ **Approve với buffer amount:**
```javascript
// Approve thêm để cover interest/fees
const approveAmount = amount * 110n / 100n; // +10% buffer
await usdt.approve(CONTRACT_ADDRESS, approveAmount);
```

**Kết quả:** ✅ Token transfers thành công

---

## ⚙️ Configuration Issues

### Error 11: Wrong RPC Endpoint

**Lỗi:**
```
Error: could not detect network
```

**Nguyên nhân:**
- RPC URL sai hoặc không available
- Network configuration không đúng

**Cách sửa:**
✅ **Verify RPC endpoint:**
```javascript
const MANTLE_TESTNET_RPC = 'https://rpc.sepolia.mantle.xyz';

// Test connection
try {
  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const network = await provider.getNetwork();
  console.log('Connected to:', network.name);
  console.log('Chain ID:', network.chainId);
  
  if (network.chainId !== 5003n) {
    throw new Error('Wrong network! Expected Mantle Sepolia (5003)');
  }
} catch (error) {
  console.error('RPC connection failed:', error.message);
  console.log('Try alternative RPC: https://rpc.sepolia.mantle.xyz');
}
```

**Mantle Sepolia RPC endpoints:**
- Primary: `https://rpc.sepolia.mantle.xyz`
- Explorer: `https://explorer.sepolia.mantle.xyz`
- Chain ID: `5003`

**Kết quả:** ✅ Connection stable với correct RPC

---

### Error 12: Gas Estimation Failed

**Lỗi:**
```
Error: cannot estimate gas; transaction may fail or may require manual gas limit
```

**Nguyên nhân:**
- Transaction sẽ revert (contract logic error)
- Insufficient balance
- Wrong function parameters

**Cách sửa:**
✅ **Add try-catch with better error messages:**
```javascript
try {
  const tx = await contract.functionName(params);
  await tx.wait();
} catch (error) {
  console.error('Transaction failed:', error.message);
  
  // Check common issues
  if (error.message.includes('insufficient funds')) {
    console.log('💡 Need more MNT for gas fees');
  } else if (error.message.includes('execution reverted')) {
    console.log('💡 Contract reverted - check parameters and contract state');
  }
  
  // Show full error for debugging
  if (error.data) {
    console.error('Error data:', error.data);
  }
  throw error;
}
```

✅ **Manual gas limit if needed:**
```javascript
const tx = await contract.functionName(params, {
  gasLimit: 500000 // Manual gas limit
});
```

---

## 📊 Best Practices Summary

### ✅ DO's:

1. **Always validate inputs:**
   - Check balances before operations
   - Validate addresses exist
   - Verify contract state before interactions

2. **Handle errors gracefully:**
   - Use try-catch blocks
   - Provide helpful error messages
   - Skip tests if conditions not met

3. **Use dynamic values:**
   - Calculate based on available balance
   - Don't hardcode large amounts
   - Adjust for different environments

4. **Add delays between transactions:**
   ```javascript
   await tx.wait(); // Wait for confirmation
   await new Promise(resolve => setTimeout(resolve, 3000)); // 3s delay
   ```

5. **Log everything:**
   - Transaction hashes
   - Balances before/after
   - Operation results

### ❌ DON'Ts:

1. **Don't ignore contract source code:**
   - Always check actual function names
   - Verify ABI matches deployed contract

2. **Don't hardcode private keys:**
   - Use .env files
   - Never commit .env to git

3. **Don't skip error handling:**
   - Every external call can fail
   - Provide fallback behaviors

4. **Don't assume sufficient balance:**
   - Always check first
   - Handle insufficient balance gracefully

5. **Don't use outdated packages:**
   - Keep ethers.js updated
   - Use compatible OpenZeppelin versions

---

## 🔍 Debugging Checklist

When encountering errors, check:

- [ ] Is private key configured correctly in .env?
- [ ] Does wallet have sufficient MNT for gas?
- [ ] Does wallet have sufficient USDT for operations?
- [ ] Are contract addresses correct?
- [ ] Is ABI matching deployed contract?
- [ ] Are function names correct?
- [ ] Is RPC endpoint working?
- [ ] Are OpenZeppelin packages installed?
- [ ] Is network configuration correct (Chain ID: 5003)?
- [ ] Are approvals set before token transfers?

---

## 📚 Reference

### Working Configuration:

```javascript
// .env
DEPLOYER_PRIVATE_KEY=0x...
MANTLE_RPC_URL=https://rpc.sepolia.mantle.xyz

// Network Info
Chain ID: 5003
Network: Mantle Sepolia Testnet
Explorer: https://explorer.sepolia.mantle.xyz

// Package Versions
Node.js: v22.16.0
ethers.js: 6.16.0
solc: 0.8.20
OpenZeppelin: 5.0.0
```

### Useful Commands:

```bash
# Check balance
node scripts/checkBalanceDirect.js

# Test contract
node scripts/testSimpleDEX.js

# Get testnet tokens
# Visit: https://faucet.sepolia.mantle.xyz
```

---

## 🎯 Success Metrics

After applying these fixes:
- ✅ 7/7 contracts deployed successfully
- ✅ 0 compilation errors
- ✅ 0 deployment failures
- ✅ 2/4 test suites passed 100%
- ✅ 2/4 test suites passed partially (due to balance limits only)
- ✅ All errors handled gracefully

---

*Last updated: January 6, 2026*
*Total errors documented: 12*
*Success rate after fixes: 100% deployment, 100% where balance sufficient*
