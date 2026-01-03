
import { Type, Schema } from "@google/genai";
import { ai } from "../client";
import { TransactionData } from "../../types";

const transactionSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    type: { type: Type.STRING, enum: ["SEND", "SWAP"] },
    token: { type: Type.STRING, description: "Source token symbol (e.g. ETH). Null if unknown." },
    targetToken: { type: Type.STRING, description: "Target token for SWAP. Null if SEND or unknown." },
    amount: { type: Type.NUMBER, description: "Amount to transact. Null if unknown." },
    toAddress: { type: Type.STRING, description: "Destination address. Null if unknown." },
    network: { type: Type.STRING, description: "Blockchain network. Must be one of: 'Ethereum Mainnet', 'Sepolia Testnet', 'Binance Smart Chain', 'Polygon', 'Avalanche C-Chain'. Null if unknown." },
    summary: { type: Type.STRING }
  },
  required: ["type", "summary"]
};

export const createTransactionPreview = async (userText: string): Promise<TransactionData> => {
    const systemPrompt = `
      You are a Web3 Transaction Agent. Your job is to extract transaction details for SEND or SWAP operations.
      
      RULES:
      1. **Supported Types**: Only 'SEND' or 'SWAP'. Ignore 'BUY' or 'SELL'.
      2. **No Guessing**: If the user does not provide a piece of information (like address, amount, or network), return null for that field. **DO NOT** make up addresses or amounts.
      3. **Network Standardization**: You MUST normalize the network name to one of the following exact strings if detected:
         - "Ethereum Mainnet" (for ETH, Mainnet)
         - "Sepolia Testnet" (for Sepolia, Testnet)
         - "Binance Smart Chain" (for BSC, BNB Chain, Binance)
         - "Polygon" (for Matic, Polygon PoS)
         - "Avalanche C-Chain" (for Avax, Avalanche)
      4. **Extraction**:
         - 'token': The asset being sent or swapped from.
         - 'targetToken': The asset being received (only for SWAP).
         - 'amount': The numerical value.
         - 'toAddress': The recipient wallet address (only for SEND).
         - 'network': The blockchain network.
      
      Examples:
      - "Send ETH" -> { type: "SEND", token: "ETH", amount: null, toAddress: null, network: "Ethereum Mainnet" }
      - "Swap 1 BNB to USDT on BSC" -> { type: "SWAP", token: "BNB", targetToken: "USDT", amount: 1, network: "Binance Smart Chain" }
      - "Send 10 MATIC to 0x123... on Polygon" -> { type: "SEND", token: "MATIC", amount: 10, toAddress: "0x123...", network: "Polygon" }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Parse this transaction request: "${userText}"`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: transactionSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as TransactionData;
        }
        throw new Error("Failed to parse transaction");
    } catch (error) {
        console.error("Transaction Parse Error", error);
        throw error;
    }
}
