const { ethers } = require("ethers");

async function main() {
    const privateKey = "0x7302adb08ab8e3d0de0f658a4b73f953203bae0b61b6b8b6b03d0b3bd3c02e7a";

    try {
        const wallet = new ethers.Wallet(privateKey);
        console.log("✅ Private key valid!");
        console.log("Wallet address:", wallet.address);

        // Connect to Mantle Testnet
        const provider = new ethers.JsonRpcProvider("https://rpc.testnet.mantle.xyz");
        const connectedWallet = wallet.connect(provider);

        const balance = await provider.getBalance(wallet.address);
        console.log("Balance:", ethers.formatEther(balance), "MNT");

        if (balance === 0n) {
            console.log("\n❌ No MNT! Get from: https://faucet.testnet.mantle.xyz");
        } else {
            console.log("\n✅ Ready to deploy!");
        }
    } catch (error) {
        console.error("❌ Error:", error.message);
    }
}

main();
