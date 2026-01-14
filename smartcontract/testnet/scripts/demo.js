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
  console.log("=================================");
  console.log("DEMO: Testing Contracts");
  console.log("=================================\n");

  // Load deployment info
  const deploymentInfo = JSON.parse(
    await readFile(path.resolve(__dirname, "../deployments.json"), "utf8")
  );

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Wallet:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("MNT Balance:", ethers.formatEther(balance), "MNT\n");

  // Setup contracts
  const vault = new ethers.Contract(
    deploymentInfo.contracts.multiTokenVault.address,
    deploymentInfo.contracts.multiTokenVault.abi,
    wallet
  );

  const staking = new ethers.Contract(
    deploymentInfo.contracts.stakingRewards.address,
    deploymentInfo.contracts.stakingRewards.abi,
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

  // Get initial balances
  const usdtBalance = await usdt.balanceOf(wallet.address);
  console.log("Your USDT Balance:", ethers.formatUnits(usdtBalance, 6), "USDT\n");

  // ========== TEST 1: Deposit MNT to Vault ==========
  console.log("--- TEST 1: Deposit MNT to Vault ---");
  try {
    const depositAmount = ethers.parseEther("1"); // 1 MNT
    console.log("Depositing 1 MNT...");
    
    const tx1 = await vault.depositMnt({ value: depositAmount });
    console.log("Transaction sent:", tx1.hash);
    await tx1.wait();
    console.log("✅ Deposited 1 MNT successfully!\n");
    
    const mntInVault = await vault.getMntBalance(wallet.address);
    console.log("Your MNT in Vault:", ethers.formatEther(mntInVault), "MNT\n");
  } catch (error) {
    console.log("❌ Error depositing MNT:", error.message, "\n");
  }

  await sleep(2000);

  // ========== TEST 2: Deposit USDT to Vault ==========
  console.log("--- TEST 2: Deposit USDT to Vault ---");
  try {
    const depositAmount = ethers.parseUnits("10", 6); // 10 USDT
    
    // Check allowance
    const allowance = await usdt.allowance(wallet.address, vault.target);
    console.log("Current allowance:", ethers.formatUnits(allowance, 6), "USDT");
    
    if (allowance < depositAmount) {
      console.log("Approving USDT...");
      const approveTx = await usdt.approve(vault.target, depositAmount);
      await approveTx.wait();
      console.log("✅ Approved!");
    }
    
    console.log("Depositing 10 USDT...");
    const tx2 = await vault.depositUsdt(depositAmount);
    console.log("Transaction sent:", tx2.hash);
    await tx2.wait();
    console.log("✅ Deposited 10 USDT successfully!\n");
    
    const usdtInVault = await vault.getUsdtBalance(wallet.address);
    console.log("Your USDT in Vault:", ethers.formatUnits(usdtInVault, 6), "USDT\n");
  } catch (error) {
    console.log("❌ Error depositing USDT:", error.message, "\n");
  }

  await sleep(2000);

  // ========== TEST 3: Stake USDT ==========
  console.log("--- TEST 3: Stake USDT ---");
  try {
    const stakeAmount = ethers.parseUnits("5", 6); // 5 USDT
    
    // Check allowance
    const allowance = await usdt.allowance(wallet.address, staking.target);
    console.log("Current allowance for staking:", ethers.formatUnits(allowance, 6), "USDT");
    
    if (allowance < stakeAmount) {
      console.log("Approving USDT for staking...");
      const approveTx = await usdt.approve(staking.target, stakeAmount);
      await approveTx.wait();
      console.log("✅ Approved!");
    }
    
    console.log("Staking 5 USDT...");
    const tx3 = await staking.stake(stakeAmount);
    console.log("Transaction sent:", tx3.hash);
    await tx3.wait();
    console.log("✅ Staked 5 USDT successfully!\n");
    
    const stakeInfo = await staking.getStakeInfo(wallet.address);
    console.log("Your Staked Amount:", ethers.formatUnits(stakeInfo[0], 6), "USDT");
    console.log("Pending Rewards:", ethers.formatUnits(stakeInfo[4], 6), "USDT\n");
  } catch (error) {
    console.log("❌ Error staking:", error.message, "\n");
  }

  await sleep(2000);

  // ========== TEST 4: Check Rewards After Some Time ==========
  console.log("--- TEST 4: Checking Rewards ---");
  console.log("Waiting 10 seconds for rewards to accumulate...");
  await sleep(10000);
  
  try {
    const stakeInfo = await staking.getStakeInfo(wallet.address);
    console.log("Your Staked Amount:", ethers.formatUnits(stakeInfo[0], 6), "USDT");
    console.log("Pending Rewards:", ethers.formatUnits(stakeInfo[4], 6), "USDT");
    console.log("(Note: Rewards accumulate over time based on 12% APR)\n");
  } catch (error) {
    console.log("❌ Error checking rewards:", error.message, "\n");
  }

  // ========== Summary ==========
  console.log("=================================");
  console.log("Demo Summary");
  console.log("=================================");
  
  try {
    const mntInVault = await vault.getMntBalance(wallet.address);
    const usdtInVault = await vault.getUsdtBalance(wallet.address);
    const stakeInfo = await staking.getStakeInfo(wallet.address);
    
    console.log("\nYour Vault Balances:");
    console.log("- MNT:", ethers.formatEther(mntInVault), "MNT");
    console.log("- USDT:", ethers.formatUnits(usdtInVault, 6), "USDT");
    
    console.log("\nYour Staking Info:");
    console.log("- Staked:", ethers.formatUnits(stakeInfo[0], 6), "USDT");
    console.log("- Pending Rewards:", ethers.formatUnits(stakeInfo[4], 6), "USDT");
    console.log("- APR: 12%");
    
    console.log("\n=================================");
    console.log("✅ Demo completed successfully!");
    console.log("=================================\n");
    
    console.log("Next steps:");
    console.log("1. Run 'node scripts/interact.js' to see more details");
    console.log("2. Try withdrawing: vault.withdrawMnt() or vault.withdrawUsdt()");
    console.log("3. Try claiming rewards: staking.claimRewards()");
    console.log("4. Try unstaking: staking.unstake() or staking.unstakeAll()");
    
  } catch (error) {
    console.log("❌ Error in summary:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Demo failed:", error);
    process.exit(1);
  });
