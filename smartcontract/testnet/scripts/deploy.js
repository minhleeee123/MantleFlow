import { ethers } from "ethers";
import { readFile, writeFile } from "fs/promises";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

const USDT_ADDRESS = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";
const RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

async function main() {
  console.log("=================================");
  console.log("Deploying Contracts to Mantle Testnet");
  console.log("=================================\n");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("Deployer address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MNT\n");

  // Read contract ABIs and bytecodes
  console.log("Reading contract artifacts...");
  
  const vaultArtifact = JSON.parse(
    await readFile(
      path.resolve(__dirname, "../artifacts/contracts/MultiTokenVault.sol/MultiTokenVault.json"),
      "utf8"
    )
  );

  const stakingArtifact = JSON.parse(
    await readFile(
      path.resolve(__dirname, "../artifacts/contracts/StakingRewards.sol/StakingRewards.json"),
      "utf8"
    )
  );

  // Deploy MultiTokenVault
  console.log("\n--- Deploying MultiTokenVault ---");
  const VaultFactory = new ethers.ContractFactory(
    vaultArtifact.abi,
    vaultArtifact.bytecode,
    wallet
  );

  const vault = await VaultFactory.deploy(USDT_ADDRESS);
  await vault.waitForDeployment();
  const vaultAddress = await vault.getAddress();

  console.log("✅ MultiTokenVault deployed to:", vaultAddress);

  // Deploy StakingRewards
  console.log("\n--- Deploying StakingRewards ---");
  const StakingFactory = new ethers.ContractFactory(
    stakingArtifact.abi,
    stakingArtifact.bytecode,
    wallet
  );

  // Stake USDT, reward USDT
  const staking = await StakingFactory.deploy(USDT_ADDRESS, USDT_ADDRESS);
  await staking.waitForDeployment();
  const stakingAddress = await staking.getAddress();

  console.log("✅ StakingRewards deployed to:", stakingAddress);

  // Summary
  console.log("\n=================================");
  console.log("Deployment Summary");
  console.log("=================================");
  console.log("USDT Token:", USDT_ADDRESS);
  console.log("MultiTokenVault:", vaultAddress);
  console.log("StakingRewards:", stakingAddress);
  console.log("\n=================================");

  // Save deployment info
  const deploymentInfo = {
    network: "Mantle Sepolia Testnet",
    chainId: 5003,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    contracts: {
      usdtToken: USDT_ADDRESS,
      multiTokenVault: vaultAddress,
      stakingRewards: stakingAddress,
    },
  };

  await writeFile(
    path.resolve(__dirname, "../deployments.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
