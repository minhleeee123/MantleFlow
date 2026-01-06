import { ethers } from "ethers";
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
  const provider = new ethers.JsonRpcProvider(RPC_URL);
  const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
  
  console.log("=================================");
  console.log("Wallet Address:", wallet.address);
  console.log("=================================\n");
  
  // Check MNT balance (native token)
  const mntBalance = await provider.getBalance(wallet.address);
  console.log("MNT Balance:", ethers.formatEther(mntBalance), "MNT");
  
  // Check USDT balance
  const usdtAbi = [
    "function balanceOf(address) view returns (uint256)",
    "function decimals() view returns (uint8)"
  ];
  
  try {
    const usdtContract = new ethers.Contract(USDT_ADDRESS, usdtAbi, provider);
    const usdtBalance = await usdtContract.balanceOf(wallet.address);
    const decimals = await usdtContract.decimals();
    console.log("USDT Balance:", ethers.formatUnits(usdtBalance, decimals), "USDT");
  } catch (error) {
    console.log("Could not fetch USDT balance:", error.message);
  }
  
  console.log("\n=================================");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
