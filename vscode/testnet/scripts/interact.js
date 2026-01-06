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

async function main() {
  // Load deployment info
  const deploymentInfo = JSON.parse(
    await readFile(path.resolve(__dirname, "../deployments.json"), "utf8")
  );

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("=================================");
  console.log("Contract Interaction Examples");
  console.log("=================================\n");

  // MultiTokenVault
  const vault = new ethers.Contract(
    deploymentInfo.contracts.multiTokenVault.address,
    deploymentInfo.contracts.multiTokenVault.abi,
    wallet
  );

  // StakingRewards
  const staking = new ethers.Contract(
    deploymentInfo.contracts.stakingRewards.address,
    deploymentInfo.contracts.stakingRewards.abi,
    wallet
  );

  // USDT
  const usdt = new ethers.Contract(
    deploymentInfo.contracts.usdtToken,
    ["function balanceOf(address) view returns (uint256)", 
     "function decimals() view returns (uint8)",
     "function approve(address,uint256) returns (bool)"],
    wallet
  );

  console.log("--- Vault Information ---");
  const totalMnt = await vault.getTotalMntInVault();
  const totalUsdt = await vault.getTotalUsdtInVault();
  console.log("Total MNT in Vault:", ethers.formatEther(totalMnt), "MNT");
  console.log("Total USDT in Vault:", ethers.formatUnits(totalUsdt, 6), "USDT");

  console.log("\n--- Staking Information ---");
  const poolStats = await staking.getPoolStats();
  console.log("Total Staked:", ethers.formatUnits(poolStats[0], 6), "USDT");
  console.log("Total Rewards Distributed:", ethers.formatUnits(poolStats[1], 6), "USDT");
  console.log("Available Rewards:", ethers.formatUnits(poolStats[2], 6), "USDT");
  console.log("APR:", Number(poolStats[3]) / 100 + "%");

  console.log("\n--- User Balances ---");
  const mntBalance = await vault.getMntBalance(wallet.address);
  const usdtBalance = await vault.getUsdtBalance(wallet.address);
  console.log("Your MNT in Vault:", ethers.formatEther(mntBalance), "MNT");
  console.log("Your USDT in Vault:", ethers.formatUnits(usdtBalance, 6), "USDT");

  const stakeInfo = await staking.getStakeInfo(wallet.address);
  console.log("\nYour Stake Amount:", ethers.formatUnits(stakeInfo[0], 6), "USDT");
  console.log("Pending Rewards:", ethers.formatUnits(stakeInfo[4], 6), "USDT");
  console.log("Is Locked:", stakeInfo[5]);

  console.log("\n=================================");
  console.log("Example Transactions:");
  console.log("=================================\n");

  console.log("// Deposit 10 MNT to Vault:");
  console.log(`await vault.depositMnt({ value: ethers.parseEther("10") });\n`);

  console.log("// Withdraw 5 MNT from Vault:");
  console.log(`await vault.withdrawMnt(ethers.parseEther("5"));\n`);

  console.log("// Approve USDT for Vault:");
  console.log(`await usdt.approve(vaultAddress, ethers.parseUnits("100", 6));\n`);

  console.log("// Deposit 100 USDT to Vault:");
  console.log(`await vault.depositUsdt(ethers.parseUnits("100", 6));\n`);

  console.log("// Approve USDT for Staking:");
  console.log(`await usdt.approve(stakingAddress, ethers.parseUnits("50", 6));\n`);

  console.log("// Stake 50 USDT:");
  console.log(`await staking.stake(ethers.parseUnits("50", 6));\n`);

  console.log("// Claim Rewards:");
  console.log(`await staking.claimRewards();\n`);

  console.log("// Unstake all:");
  console.log(`await staking.unstakeAll();\n`);

  console.log("\n=================================");
  console.log("Contract Addresses:");
  console.log("=================================");
  console.log("MultiTokenVault:", deploymentInfo.contracts.multiTokenVault.address);
  console.log("StakingRewards:", deploymentInfo.contracts.stakingRewards.address);
  console.log("USDT Token:", deploymentInfo.contracts.usdtToken);
  console.log("\n=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
