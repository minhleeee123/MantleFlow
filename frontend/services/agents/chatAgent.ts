
import { ai } from "../client";
import { ChatMessage, CryptoData } from "../../types";

export const determineIntent = async (userMessage: string): Promise<{ type: 'ANALYZE' | 'CHAT' | 'PORTFOLIO_ANALYSIS' | 'TRANSACTION'; coinName?: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Classify intent: "${userMessage}".
      1. New coin analysis (e.g. "Analyze BTC", "How is Solana doing") -> {"type": "ANALYZE", "coinName": "CorrectedName"}
      2. Portfolio analysis (e.g. "Check my wallet", "My portfolio") -> {"type": "PORTFOLIO_ANALYSIS"}
      3. Web3 Transaction (e.g. "Send 1 ETH", "Swap ETH for USDT") -> {"type": "TRANSACTION"}
      4. General chat -> {"type": "CHAT"}`,
      config: { responseMimeType: "application/json" }
    });
    return response.text ? JSON.parse(response.text) : { type: 'CHAT' };
  } catch {
    return { type: 'CHAT' };
  }
}

export const chatWithModel = async (
  userMessage: string, 
  history: ChatMessage[], 
  contextData?: CryptoData
): Promise<string> => {
  try {
    const historyContent = history
      .filter(msg => msg.id !== 'welcome')
      .map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text + (msg.data ? ` [System: User viewed data for ${msg.data.coinName}]` : "") }]
      }));

    let systemInstruction = "You are CryptoInsight AI. You have access to real-time crypto tools.";
    if (contextData) {
      systemInstruction += `\nCURRENT CONTEXT: User is viewing dashboard for ${contextData.coinName}.\nData: ${JSON.stringify(contextData)}`;
    }

    const chat = ai.chats.create({
      model: "gemini-2.5-flash",
      history: historyContent,
      config: { systemInstruction }
    });

    const result = await chat.sendMessage({ message: userMessage });
    return result.text || "I'm having trouble connecting to the chat service.";
  } catch (error) {
    console.error("Chat Error:", error);
    return "I'm having trouble connecting to the chat service.";
  }
};
