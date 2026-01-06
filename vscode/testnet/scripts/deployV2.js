import { ethers } from 'ethers';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import solc from 'solc';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '..', '.env');
dotenv.config({ path: envPath });

const MANTLE_TESTNET_RPC = 'https://rpc.sepolia.mantle.xyz';
const USDT_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';

// Find imports function cho OpenZeppelin
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
function compileContract(contractName, sourceCode) {
  console.log(`📝 Compiling ${contractName}...`);
  
  const input = {
    language: 'Solidity',
    sources: {
      [`${contractName}.sol`]: { content: sourceCode }
    },
    settings: {
      outputSelection: {
        '*': {
          '*': ['abi', 'evm.bytecode']
        }
      },
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  };

  const output = JSON.parse(solc.compile(JSON.stringify(input), { import: findImports }));
  
  if (output.errors) {
    const errors = output.errors.filter(e => e.severity === 'error');
    if (errors.length > 0) {
      console.error('❌ Compilation errors:');
      errors.forEach(err => console.error(err.formattedMessage));
      throw new Error('Compilation failed');
    }
  }

  const contract = output.contracts[`${contractName}.sol`][contractName];
  console.log(`✅ ${contractName} compiled!`);
  
  return {
    abi: contract.abi,
    bytecode: contract.evm.bytecode.object
  };
}

async function main() {
  console.log('\n============================================');
  console.log('🚀 DEPLOYING V2 CONTRACTS');
  console.log('============================================\n');

  const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
  const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
  const wallet = new ethers.Wallet(privateKey, provider);

  console.log('📍 Deployer:', wallet.address);
  const balance = await provider.getBalance(wallet.address);
  console.log('💰 Balance:', ethers.formatEther(balance), 'MNT\n');

  try {
    // Compile SimpleDEXV2
    const dexPath = path.join(process.cwd(), 'contractsV2', 'SimpleDEXV2.sol');
    const dexSource = fs.readFileSync(dexPath, 'utf8');
    const dexCompiled = compileContract('SimpleDEXV2', dexSource);

    // Deploy SimpleDEXV2
    console.log('\n🚀 Deploying SimpleDEXV2...');
    const DEXFactory = new ethers.ContractFactory(dexCompiled.abi, dexCompiled.bytecode, wallet);
    const dex = await DEXFactory.deploy(USDT_ADDRESS);
    await dex.waitForDeployment();
    const dexAddress = await dex.getAddress();
    console.log('✅ SimpleDEXV2:', dexAddress);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // Compile VaultWithSwap
    const vaultPath = path.join(process.cwd(), 'contractsV2', 'VaultWithSwap.sol');
    const vaultSource = fs.readFileSync(vaultPath, 'utf8');
    const vaultCompiled = compileContract('VaultWithSwap', vaultSource);

    // Deploy VaultWithSwap
    console.log('\n🚀 Deploying VaultWithSwap...');
    const VaultFactory = new ethers.ContractFactory(vaultCompiled.abi, vaultCompiled.bytecode, wallet);
    const vault = await VaultFactory.deploy(USDT_ADDRESS, dexAddress);
    await vault.waitForDeployment();
    const vaultAddress = await vault.getAddress();
    console.log('✅ VaultWithSwap:', vaultAddress);

    // Save deployment info
    const deploymentInfo = {
      network: 'Mantle Sepolia Testnet',
      chainId: 5003,
      deployer: wallet.address,
      timestamp: new Date().toISOString(),
      contracts: {
        usdtToken: USDT_ADDRESS,
        simpleDEXV2: {
          address: dexAddress,
          abi: dexCompiled.abi
        },
        vaultWithSwap: {
          address: vaultAddress,
          abi: vaultCompiled.abi
        }
      }
    };

    const outputPath = path.join(process.cwd(), 'deploymentsV2.json');
    fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

    // Save addresses only
    const addressesPath = path.join(process.cwd(), 'addressesV2.json');
    fs.writeFileSync(addressesPath, JSON.stringify({
      simpleDEXV2: dexAddress,
      vaultWithSwap: vaultAddress,
      usdt: USDT_ADDRESS
    }, null, 2));

    console.log('\n============================================');
    console.log('📊 DEPLOYMENT SUMMARY');
    console.log('============================================');
    console.log('✅ SimpleDEXV2:', dexAddress);
    console.log('✅ VaultWithSwap:', vaultAddress);
    console.log('\n✅ Saved to deploymentsV2.json');
    console.log('✅ Saved to addressesV2.json');
    console.log('\n🔗 Explorer Links:');
    console.log(`SimpleDEXV2: https://explorer.sepolia.mantle.xyz/address/${dexAddress}`);
    console.log(`VaultWithSwap: https://explorer.sepolia.mantle.xyz/address/${vaultAddress}`);
    console.log('============================================\n');

  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
    throw error;
  }
}

main().catch(console.error);
