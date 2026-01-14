import hre from "hardhat";
import "dotenv/config";

const { ethers } = hre;

// USDT Testnet address
const USDT_ADDRESS = "0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("=================================");
  console.log("Wallet Address:", deployer.address);
  console.log("=================================\n");
  
  // Check MNT balance (native token)
  const mntBalance = await ethers.provider.getBalance(deployer.address);
  console.log("MNT Balance:", ethers.formatEther(mntBalance), "MNT");
  
  // Check USDT balance
  const usdtContract = await ethers.getContractAt(
    ["function balanceOf(address) view returns (uint256)", "function decimals() view returns (uint8)"],
    USDT_ADDRESS
  );
  
  try {
    const usdtBalance = await usdtContract.balanceOf(deployer.address);
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
