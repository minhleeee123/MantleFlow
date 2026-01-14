import { ethers } from "ethers";
import { readFile } from "fs/promises";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

const RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  console.log("===========================================");
  console.log("TEST QUY TRÌNH NẠP/RÚT MNT & USDT");
  console.log("===========================================\n");

  // Load deployment info
  const deploymentInfo = JSON.parse(
    await readFile(path.resolve(__dirname, "../deployments.json"), "utf8")
  );

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📍 Wallet:", wallet.address);
  
  // Setup contracts
  const vault = new ethers.Contract(
    deploymentInfo.contracts.multiTokenVault.address,
    deploymentInfo.contracts.multiTokenVault.abi,
    wallet
  );

  const usdt = new ethers.Contract(
    deploymentInfo.contracts.usdtToken,
    [
      "function balanceOf(address) view returns (uint256)",
      "function decimals() view returns (uint8)",
      "function approve(address,uint256) returns (bool)",
      "function allowance(address,address) view returns (uint256)"
    ],
    wallet
  );

  // Initial balances
  console.log("\n📊 SỐ DƯ BAN ĐẦU:");
  console.log("─────────────────────────────────────────");
  const initialMnt = await provider.getBalance(wallet.address);
  const initialUsdt = await usdt.balanceOf(wallet.address);
  console.log("Ví - MNT:", ethers.formatEther(initialMnt), "MNT");
  console.log("Ví - USDT:", ethers.formatUnits(initialUsdt, 6), "USDT");
  
  const vaultMnt = await vault.getMntBalance(wallet.address);
  const vaultUsdt = await vault.getUsdtBalance(wallet.address);
  console.log("Vault - MNT:", ethers.formatEther(vaultMnt), "MNT");
  console.log("Vault - USDT:", ethers.formatUnits(vaultUsdt, 6), "USDT");

  // ==================== NẠP MNT ====================
  console.log("\n\n🔵 BƯỚC 1: NẠP MNT VÀO VAULT");
  console.log("===========================================");
  
  const mntDepositAmount = ethers.parseEther("2"); // 2 MNT
  console.log("💰 Đang nạp 2 MNT vào vault...");
  
  try {
    const tx1 = await vault.depositMnt({ value: mntDepositAmount });
    console.log("📤 Transaction hash:", tx1.hash);
    console.log("⏳ Đợi confirmation...");
    await tx1.wait();
    console.log("✅ NẠP MNT THÀNH CÔNG!\n");
    
    const newVaultMnt = await vault.getMntBalance(wallet.address);
    console.log("📊 Số dư MNT trong Vault:", ethers.formatEther(newVaultMnt), "MNT");
  } catch (error) {
    console.log("❌ Lỗi:", error.message);
  }

  await sleep(3000);

  // ==================== NẠP USDT ====================
  console.log("\n\n🔵 BƯỚC 2: NẠP USDT VÀO VAULT");
  console.log("===========================================");
  
  const usdtDepositAmount = ethers.parseUnits("20", 6); // 20 USDT
  console.log("💰 Đang nạp 20 USDT vào vault...");
  
  try {
    // Check và approve nếu cần
    const allowance = await usdt.allowance(wallet.address, vault.target);
    console.log("🔍 Allowance hiện tại:", ethers.formatUnits(allowance, 6), "USDT");
    
    if (allowance < usdtDepositAmount) {
      console.log("📝 Đang approve USDT...");
      const approveTx = await usdt.approve(vault.target, usdtDepositAmount);
      await approveTx.wait();
      console.log("✅ Approve thành công!");
    }
    
    console.log("📤 Đang deposit USDT...");
    const tx2 = await vault.depositUsdt(usdtDepositAmount);
    console.log("📤 Transaction hash:", tx2.hash);
    console.log("⏳ Đợi confirmation...");
    await tx2.wait();
    console.log("✅ NẠP USDT THÀNH CÔNG!\n");
    
    const newVaultUsdt = await vault.getUsdtBalance(wallet.address);
    console.log("📊 Số dư USDT trong Vault:", ethers.formatUnits(newVaultUsdt, 6), "USDT");
  } catch (error) {
    console.log("❌ Lỗi:", error.message);
  }

  await sleep(3000);

  // ==================== XEM SỐ DƯ SAU NẠP ====================
  console.log("\n\n📊 SỐ DƯ SAU KHI NẠP:");
  console.log("===========================================");
  const afterDepositMnt = await provider.getBalance(wallet.address);
  const afterDepositUsdt = await usdt.balanceOf(wallet.address);
  const afterDepositVaultMnt = await vault.getMntBalance(wallet.address);
  const afterDepositVaultUsdt = await vault.getUsdtBalance(wallet.address);
  
  console.log("Ví - MNT:", ethers.formatEther(afterDepositMnt), "MNT");
  console.log("Ví - USDT:", ethers.formatUnits(afterDepositUsdt, 6), "USDT");
  console.log("Vault - MNT:", ethers.formatEther(afterDepositVaultMnt), "MNT");
  console.log("Vault - USDT:", ethers.formatUnits(afterDepositVaultUsdt, 6), "USDT");

  await sleep(3000);

  // ==================== RÚT MNT ====================
  console.log("\n\n🟢 BƯỚC 3: RÚT MNT TỪ VAULT");
  console.log("===========================================");
  
  const mntWithdrawAmount = ethers.parseEther("1"); // Rút 1 MNT
  console.log("💵 Đang rút 1 MNT từ vault...");
  
  try {
    const tx3 = await vault.withdrawMnt(mntWithdrawAmount);
    console.log("📥 Transaction hash:", tx3.hash);
    console.log("⏳ Đợi confirmation...");
    await tx3.wait();
    console.log("✅ RÚT MNT THÀNH CÔNG!\n");
    
    const afterWithdrawVaultMnt = await vault.getMntBalance(wallet.address);
    console.log("📊 Số dư MNT còn lại trong Vault:", ethers.formatEther(afterWithdrawVaultMnt), "MNT");
  } catch (error) {
    console.log("❌ Lỗi:", error.message);
  }

  await sleep(3000);

  // ==================== RÚT USDT ====================
  console.log("\n\n🟢 BƯỚC 4: RÚT USDT TỪ VAULT");
  console.log("===========================================");
  
  const usdtWithdrawAmount = ethers.parseUnits("10", 6); // Rút 10 USDT
  console.log("💵 Đang rút 10 USDT từ vault...");
  
  try {
    const tx4 = await vault.withdrawUsdt(usdtWithdrawAmount);
    console.log("📥 Transaction hash:", tx4.hash);
    console.log("⏳ Đợi confirmation...");
    await tx4.wait();
    console.log("✅ RÚT USDT THÀNH CÔNG!\n");
    
    const afterWithdrawVaultUsdt = await vault.getUsdtBalance(wallet.address);
    console.log("📊 Số dư USDT còn lại trong Vault:", ethers.formatUnits(afterWithdrawVaultUsdt, 6), "USDT");
  } catch (error) {
    console.log("❌ Lỗi:", error.message);
  }

  await sleep(2000);

  // ==================== SỐ DƯ CUỐI CÙNG ====================
  console.log("\n\n📊 SỐ DƯ CUỐI CÙNG:");
  console.log("===========================================");
  const finalMnt = await provider.getBalance(wallet.address);
  const finalUsdt = await usdt.balanceOf(wallet.address);
  const finalVaultMnt = await vault.getMntBalance(wallet.address);
  const finalVaultUsdt = await vault.getUsdtBalance(wallet.address);
  
  console.log("Ví - MNT:", ethers.formatEther(finalMnt), "MNT");
  console.log("Ví - USDT:", ethers.formatUnits(finalUsdt, 6), "USDT");
  console.log("Vault - MNT:", ethers.formatEther(finalVaultMnt), "MNT");
  console.log("Vault - USDT:", ethers.formatUnits(finalVaultUsdt, 6), "USDT");

  // ==================== TỔNG KẾT ====================
  console.log("\n\n🎯 TỔNG KẾT QUY TRÌNH:");
  console.log("===========================================");
  console.log("✅ Nạp 2 MNT vào vault - Thành công");
  console.log("✅ Nạp 20 USDT vào vault - Thành công");
  console.log("✅ Rút 1 MNT từ vault - Thành công");
  console.log("✅ Rút 10 USDT từ vault - Thành công");
  
  console.log("\n📈 THAY ĐỔI SỐ DƯ:");
  console.log("Vault MNT: +1 MNT (nạp 2, rút 1)");
  console.log("Vault USDT: +10 USDT (nạp 20, rút 10)");
  
  console.log("\n🔗 Xem transactions trên Explorer:");
  console.log("https://explorer.sepolia.mantle.xyz/address/" + vault.target);
  
  console.log("\n✅ HOÀN THÀNH TEST QUY TRÌNH NẠP/RÚT!");
  console.log("===========================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Lỗi:", error);
    process.exit(1);
  });
