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
const DEX_ADDRESS = '0x991E5DAB401B44cD5E6C6e5A47F547B17b5bBa5d'; // Reuse existing DEX

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
    console.log('🚀 DEPLOYING VAULTWITHSWAP V3 (WITH BOT AUTH)');
    console.log('============================================\n');

    const provider = new ethers.JsonRpcProvider(MANTLE_TESTNET_RPC);
    const privateKey = process.env.DEPLOYER_PRIVATE_KEY || process.env.PRIVATE_KEY;
    const wallet = new ethers.Wallet(privateKey, provider);

    console.log('📍 Deployer:', wallet.address);
    const balance = await provider.getBalance(wallet.address);
    console.log('💰 Balance:', ethers.formatEther(balance), 'MNT\n');

    if (parseFloat(ethers.formatEther(balance)) < 0.01) {
        throw new Error('❌ Insufficient balance! Need at least 0.01 MNT for deployment.');
    }

    try {
        // Compile VaultWithSwap V3
        const vaultPath = path.join(process.cwd(), 'contractsV2', 'VaultWithSwap.sol');
        const vaultSource = fs.readFileSync(vaultPath, 'utf8');
        const vaultCompiled = compileContract('VaultWithSwap', vaultSource);

        // Deploy VaultWithSwap V3
        console.log('\n🚀 Deploying VaultWithSwap V3 (with bot authorization)...');
        const VaultFactory = new ethers.ContractFactory(vaultCompiled.abi, vaultCompiled.bytecode, wallet);
        const vault = await VaultFactory.deploy(USDT_ADDRESS, DEX_ADDRESS);

        console.log('⏳ Waiting for deployment...');
        await vault.waitForDeployment();
        const vaultAddress = await vault.getAddress();
        console.log('✅ VaultWithSwap V3 deployed:', vaultAddress);

        // Wait for block confirmation
        console.log('⏳ Waiting for block confirmation...');
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Save deployment info
        const deploymentInfo = {
            network: 'Mantle Sepolia Testnet',
            chainId: 5003,
            deployer: wallet.address,
            timestamp: new Date().toISOString(),
            version: 'V3',
            features: [
                'Bot Authorization',
                'Delegated Swap',
                'Auto-Trading Support'
            ],
            contracts: {
                usdtToken: USDT_ADDRESS,
                simpleDEXV2: DEX_ADDRESS,
                vaultWithSwap: {
                    address: vaultAddress,
                    abi: vaultCompiled.abi
                }
            }
        };

        const outputPath = path.join(process.cwd(), 'deploymentsV3.json');
        fs.writeFileSync(outputPath, JSON.stringify(deploymentInfo, null, 2));

        // Save addresses only
        const addressesPath = path.join(process.cwd(), 'addressesV3.json');
        fs.writeFileSync(addressesPath, JSON.stringify({
            simpleDEXV2: DEX_ADDRESS,
            vaultWithSwap: vaultAddress,
            usdt: USDT_ADDRESS
        }, null, 2));

        console.log('\n============================================');
        console.log('📊 DEPLOYMENT V3 SUMMARY');
        console.log('============================================');
        console.log('🔗 SimpleDEXV2 (reused):', DEX_ADDRESS);
        console.log('🔗 VaultWithSwap V3:', vaultAddress);
        console.log('🔗 USDT Token:', USDT_ADDRESS);
        console.log('\n✨ New Features:');
        console.log('  ✅ Bot Authorization');
        console.log('  ✅ executeSwapMntToUsdtForUser()');
        console.log('  ✅ executeSwapUsdtToMntForUser()');
        console.log('  ✅ authorizeBot() / isBotAuthorized()');
        console.log('\n✅ Saved to deploymentsV3.json');
        console.log('✅ Saved to addressesV3.json');
        console.log('\n🔗 Explorer Link:');
        console.log(`https://explorer.sepolia.mantle.xyz/address/${vaultAddress}`);
        console.log('============================================\n');

        return vaultAddress;

    } catch (error) {
        console.error('\n❌ Deployment failed:', error.message);
        throw error;
    }
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });
