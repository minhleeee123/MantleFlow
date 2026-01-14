import solc from "solc";
import { ethers } from "ethers";
import { readFile, writeFile } from "fs/promises";
import { config } from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config({ path: path.resolve(__dirname, "../../.env") });

const USDT_ADDRESS = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";
const RPC_URL = process.env.MANTLE_RPC_URL || "https://rpc.sepolia.mantle.xyz";
const PRIVATE_KEY = process.env.DEPLOYER_PRIVATE_KEY;

function findImports(importPath) {
  try {
    const possiblePaths = [
      path.resolve(__dirname, "../node_modules", importPath),
      path.resolve(__dirname, "../../node_modules", importPath),
      path.resolve(__dirname, "../../../node_modules", importPath),
    ];
    
    for (const fullPath of possiblePaths) {
      if (fs.existsSync(fullPath)) {
        const content = fs.readFileSync(fullPath, "utf8");
        return { contents: content };
      }
    }
    
    return { error: "File not found: " + importPath };
  } catch (error) {
    return { error: "Error reading file: " + importPath };
  }
}

async function compileSolidity(contractName, sourceFile) {
  console.log(`\n📝 Compiling ${contractName}...`);
  
  const source = await readFile(
    path.resolve(__dirname, `../contracts/${sourceFile}`),
    "utf8"
  );

  const input = {
    language: "Solidity",
    sources: {
      [sourceFile]: {
        content: source,
      },
    },
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        "*": {
          "*": ["abi", "evm.bytecode"],
        },
      },
    },
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));

  if (output.errors) {
    const errors = output.errors.filter((error) => error.severity === "error");
    if (errors.length > 0) {
      console.error("❌ Compilation errors:");
      errors.forEach((error) => console.error(error.formattedMessage));
      throw new Error("Compilation failed");
    }
  }

  const contract = output.contracts[sourceFile][contractName];
  console.log(`✅ ${contractName} compiled!`);
  
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployContract(wallet, contractName, abi, bytecode, ...args) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(...args);
  
  console.log(`📤 TX: ${contract.deploymentTransaction().hash}`);
  console.log("⏳ Waiting...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`✅ ${contractName}: ${address}`);
  
  return { contract, address, abi };
}

async function main() {
  console.log("============================================");
  console.log("🎯 DEPLOYING NEW DEFI CONTRACTS");
  console.log("============================================\n");

  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("📍 Deployer:", wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log("💰 Balance:", ethers.formatEther(balance), "MNT\n");

  const deployedContracts = {};

  // 1. SimpleDEX
  try {
    const dexCompiled = await compileSolidity("SimpleDEX", "SimpleDEX.sol");
    const { address: dexAddress, abi: dexAbi } = await deployContract(
      wallet,
      "SimpleDEX",
      dexCompiled.abi,
      dexCompiled.bytecode,
      USDT_ADDRESS
    );
    deployedContracts.simpleDEX = { address: dexAddress, abi: dexAbi };
  } catch (error) {
    console.log("❌ SimpleDEX deployment failed:", error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // 2. LendingPool
  try {
    const lendingCompiled = await compileSolidity("LendingPool", "LendingPool.sol");
    const { address: lendingAddress, abi: lendingAbi } = await deployContract(
      wallet,
      "LendingPool",
      lendingCompiled.abi,
      lendingCompiled.bytecode,
      USDT_ADDRESS
    );
    deployedContracts.lendingPool = { address: lendingAddress, abi: lendingAbi };
  } catch (error) {
    console.log("❌ LendingPool deployment failed:", error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // 3. ReferralRewards
  try {
    const referralCompiled = await compileSolidity("ReferralRewards", "ReferralRewards.sol");
    const { address: referralAddress, abi: referralAbi } = await deployContract(
      wallet,
      "ReferralRewards",
      referralCompiled.abi,
      referralCompiled.bytecode
    );
    deployedContracts.referralRewards = { address: referralAddress, abi: referralAbi };
  } catch (error) {
    console.log("❌ ReferralRewards deployment failed:", error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // 4. NFTStaking
  try {
    const nftCompiled = await compileSolidity("NFTStaking", "NFTStaking.sol");
    const { address: nftAddress, abi: nftAbi } = await deployContract(
      wallet,
      "NFTStaking",
      nftCompiled.abi,
      nftCompiled.bytecode,
      USDT_ADDRESS
    );
    deployedContracts.nftStaking = { address: nftAddress, abi: nftAbi };
  } catch (error) {
    console.log("❌ NFTStaking deployment failed:", error.message);
  }

  await new Promise(resolve => setTimeout(resolve, 3000));

  // 5. AutoCompoundStaking
  try {
    const autoCompoundCompiled = await compileSolidity("AutoCompoundStaking", "AutoCompoundStaking.sol");
    const { address: autoCompoundAddress, abi: autoCompoundAbi } = await deployContract(
      wallet,
      "AutoCompoundStaking",
      autoCompoundCompiled.abi,
      autoCompoundCompiled.bytecode,
      USDT_ADDRESS,
      USDT_ADDRESS
    );
    deployedContracts.autoCompoundStaking = { address: autoCompoundAddress, abi: autoCompoundAbi };
  } catch (error) {
    console.log("❌ AutoCompoundStaking deployment failed:", error.message);
  }

  // Summary
  console.log("\n============================================");
  console.log("📊 DEPLOYMENT SUMMARY");
  console.log("============================================");
  console.log("Network: Mantle Sepolia Testnet");
  console.log("Chain ID: 5003");
  console.log("Deployer:", wallet.address);
  console.log("\n📝 Deployed Contracts:");
  
  Object.entries(deployedContracts).forEach(([name, info]) => {
    console.log(`✅ ${name}: ${info.address}`);
  });

  // Save deployment info
  const deploymentInfo = {
    network: "Mantle Sepolia Testnet",
    chainId: 5003,
    deployer: wallet.address,
    timestamp: new Date().toISOString(),
    contracts: {
      usdtToken: USDT_ADDRESS,
      ...deployedContracts
    },
  };

  await writeFile(
    path.resolve(__dirname, "../deployments-new.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Saved to deployments-new.json");
  
  console.log("\n🔗 Explorer Links:");
  Object.entries(deployedContracts).forEach(([name, info]) => {
    console.log(`${name}: https://explorer.sepolia.mantle.xyz/address/${info.address}`);
  });

  console.log("\n✅ ALL DEPLOYMENTS COMPLETED!");
  console.log("============================================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
