const hre = require("hardhat");

async function main() {
    const [deployer] = await hre.ethers.getSigners();

    console.log("Wallet address:", deployer.address);

    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("Balance:", hre.ethers.formatEther(balance), "MNT");

    if (balance === 0n) {
        console.log("\n❌ No MNT balance!");
        console.log("Get testnet MNT from: https://faucet.testnet.mantle.xyz");
    } else {
        console.log("\n✅ Wallet has MNT, ready to deploy!");
    }
}

main().catch(console.error);
