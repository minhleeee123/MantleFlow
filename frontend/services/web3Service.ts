
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

export interface WalletInfo {
    address: string;
    nativeBalance: string; // Native (MNT on Mantle)
    usdcBalance: string;   // USDC
}

const USDC_ADDRESS = '0xAcab8129E2cE587fD203FD770ec9ECAFA2C88080';
const ERC20_ABI = ['function balanceOf(address) view returns (uint256)'];

export const connectToMetaMask = async (): Promise<WalletInfo | null> => {
    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is not installed! Please install it to use this feature.");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // ADDED: Force permission request to reset the connection context.
        await provider.send("wallet_requestPermissions", [{ eth_accounts: {} }]);

        // Request account access
        const accounts = await provider.send("eth_requestAccounts", []);

        if (accounts.length === 0) return null;

        const signer = await provider.getSigner();
        const address = await signer.getAddress();

        // 1. Native Balance
        const balanceWei = await provider.getBalance(address);
        const nativeBalance = ethers.formatEther(balanceWei);

        // 2. USDC Balance
        let usdcBalance = '0';
        try {
            const usdcContract = new ethers.Contract(USDC_ADDRESS, ERC20_ABI, provider);
            const usdcWei = await usdcContract.balanceOf(address);
            usdcBalance = ethers.formatUnits(usdcWei, 6);
        } catch (e) {
            console.warn("Failed to fetch USDC balance", e);
        }

        return {
            address,
            nativeBalance,
            usdcBalance
        };
    } catch (error) {
        console.error("User denied account access or error occurred:", error);
        return null;
    }
};

export const formatAddress = (address: string): string => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

// Function to send a transaction with Network Switching support
export const sendTransaction = async (
    toAddress: string,
    amountEth: string,
    networkName?: string
): Promise<{ hash: string } | null> => {

    if (typeof window.ethereum === 'undefined') {
        alert("MetaMask is not installed!");
        return null;
    }

    try {
        const provider = new ethers.BrowserProvider(window.ethereum);

        // 1. Network Switching Logic
        if (networkName && CHAIN_CONFIGS[networkName]) {
            const targetConfig = CHAIN_CONFIGS[networkName];

            try {
                // Try to switch to the chain
                await window.ethereum.request({
                    method: 'wallet_switchEthereumChain',
                    params: [{ chainId: targetConfig.chainId }],
                });
            } catch (switchError: any) {
                // Error 4902: Chain not found in MetaMask. We need to add it.
                if (switchError.code === 4902) {
                    try {
                        await window.ethereum.request({
                            method: 'wallet_addEthereumChain',
                            params: [targetConfig],
                        });
                    } catch (addError) {
                        throw new Error(`Failed to add network ${networkName} to MetaMask.`);
                    }
                } else if (switchError.code === 4001) {
                    throw new Error("User rejected network switch.");
                } else {
                    console.error("Failed to switch network:", switchError);
                    throw new Error(`Failed to switch to ${networkName}.`);
                }
            }
        } else if (networkName === "Solana") {
            throw new Error("Solana transactions are not supported by MetaMask. Please use an EVM network.");
        }

        // 2. Re-Initialize Provider (After network switch, the provider needs to be fresh)
        // Note: ethers v6 usually handles this well, but ensuring connection is safe.
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();

        // 3. Normalize Address
        let formattedTo = toAddress;
        try {
            formattedTo = ethers.getAddress(toAddress);
        } catch (e) {
            // If it's a swap router address or generic hash, proceed with caution or validation
            try {
                formattedTo = ethers.getAddress(toAddress.toLowerCase());
            } catch (e2) {
                throw new Error(`Invalid recipient address: ${toAddress}`);
            }
        }

        // 4. Create transaction object
        const tx: any = {
            to: formattedTo,
            value: ethers.parseEther(amountEth.toString())
        };

        // 5. Send Transaction
        try {
            const response = await signer.sendTransaction(tx);
            return { hash: response.hash };
        } catch (error: any) {
            const isInsufficientFunds = error.code === 'INSUFFICIENT_FUNDS';
            const isGasEstimationFailed = error.info?.error?.code === -32000 || error.message?.includes("insufficient funds");

            if (isInsufficientFunds || isGasEstimationFailed) {
                console.warn("Gas estimation failed. Retrying with manual gasLimit...");
                tx.gasLimit = 300000;
                const response = await signer.sendTransaction(tx);
                return { hash: response.hash };
            }
            throw error;
        }

    } catch (error) {
        console.error("Transaction Failed:", error);
        throw error;
    }
};
