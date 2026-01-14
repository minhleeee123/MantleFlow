import solc from "solc";
import { ethers } from "ethers";
import { readFile, writeFile, readdir } from "fs/promises";
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

// Helper function to find imports
function findImports(importPath) {
  try {
    // Try different base paths
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
    return { error: "Error reading file: " + importPath + " - " + error.message };
  }
}

async function compileSolidity(contractName, sourceFile) {
  console.log(`\nCompiling ${contractName}...`);
  
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
      console.error("Compilation errors:");
      errors.forEach((error) => console.error(error.formattedMessage));
      throw new Error("Compilation failed");
    }
  }

  const contract = output.contracts[sourceFile][contractName];
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object,
  };
}

async function deployContract(wallet, contractName, abi, bytecode, ...args) {
  console.log(`\nDeploying ${contractName}...`);
  
  const factory = new ethers.ContractFactory(abi, bytecode, wallet);
  const contract = await factory.deploy(...args);
  
  console.log(`Transaction hash: ${contract.deploymentTransaction().hash}`);
  console.log("Waiting for confirmations...");
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  
  console.log(`✅ ${contractName} deployed to: ${address}`);
  
  return { contract, address };
}

async function main() {
  console.log("=================================");
  console.log("Compiling and Deploying Contracts");
  console.log("=================================");

  // Setup provider and wallet
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

  console.log("\nDeployer address:", wallet.address);
  
  const balance = await provider.getBalance(wallet.address);
  console.log("Balance:", ethers.formatEther(balance), "MNT");

  // Compile contracts
  const vaultCompiled = await compileSolidity("MultiTokenVault", "MultiTokenVault.sol");
  const stakingCompiled = await compileSolidity("StakingRewards", "StakingRewards.sol");

  console.log("\n✅ All contracts compiled successfully!");

  // Deploy MultiTokenVault
  console.log("\n--- Deploying MultiTokenVault ---");
  const { address: vaultAddress } = await deployContract(
    wallet,
    "MultiTokenVault",
    vaultCompiled.abi,
    vaultCompiled.bytecode,
    USDT_ADDRESS
  );

  // Deploy StakingRewards
  console.log("\n--- Deploying StakingRewards ---");
  const { address: stakingAddress } = await deployContract(
    wallet,
    "StakingRewards",
    stakingCompiled.abi,
    stakingCompiled.bytecode,
    USDT_ADDRESS,  // staking token
    USDT_ADDRESS   // rewards token
  );

  // Summary
  console.log("\n=================================");
  console.log("Deployment Summary");
  console.log("=================================");
  console.log("Network: Mantle Sepolia Testnet");
  console.log("Chain ID: 5003");
  console.log("Deployer:", wallet.address);
  console.log("\nContract Addresses:");
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
      multiTokenVault: {
        address: vaultAddress,
        abi: vaultCompiled.abi,
      },
      stakingRewards: {
        address: stakingAddress,
        abi: stakingCompiled.abi,
      },
    },
  };

  await writeFile(
    path.resolve(__dirname, "../deployments.json"),
    JSON.stringify(deploymentInfo, null, 2)
  );

  console.log("\n✅ Deployment info saved to deployments.json");
  
  // Explorer links
  console.log("\n📝 View on Explorer:");
  console.log(`MultiTokenVault: https://explorer.sepolia.mantle.xyz/address/${vaultAddress}`);
  console.log(`StakingRewards: https://explorer.sepolia.mantle.xyz/address/${stakingAddress}`);
}

main()
  .then(() => {
    console.log("\n✅ Deployment completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Error:", error);
    process.exit(1);
  });
