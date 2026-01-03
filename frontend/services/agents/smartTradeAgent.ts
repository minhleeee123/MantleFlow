
import { Type, Schema } from "@google/genai";
import { ai } from "../client";
import { SmartTradePlan } from "../../types";

const smartTradeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    symbol: { type: Type.STRING, description: "The token symbol (e.g., BTC, ETH)" },
    action: { type: Type.STRING, enum: ["BUY", "SELL"] },
    amount: { type: Type.NUMBER, description: "Amount in USD to trade" },
    explanation: { type: Type.STRING, description: "Brief explanation of the strategy" },
    conditions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING, enum: ["PRICE", "RSI", "VOLUME", "MA", "SENTIMENT", "GAS"], description: "The API to call" },
          operator: { type: Type.STRING, enum: ["GT", "LT"], description: "GT for Greater Than (>), LT for Less Than (<)" },
          value: { type: Type.NUMBER, description: "The threshold value to compare against" },
          description: { type: Type.STRING, description: "Human readable condition, e.g. 'RSI < 30'" }
        },
        required: ["metric", "operator", "value", "description"]
      }
    }
  },
  required: ["symbol", "action", "amount", "conditions", "explanation"]
};

export const parseSmartTrade = async (userPrompt: string): Promise<SmartTradePlan> => {
    const systemPrompt = `
    You are a Smart Trading Engine. Translate the user's natural language trading strategy into a structured JSON execution plan.

    AVAILABLE APIs (Metrics):
    1. PRICE: Current asset price ($).
    2. RSI: Relative Strength Index (0-100).
    3. VOLUME: 24h Volume (in Millions).
    4. MA: Moving Average (Price).
    5. SENTIMENT: Fear & Greed Index (0-100).
    6. GAS: Network Gas Price (Gwei).

    RULES:
    - Determine if the user wants to BUY or SELL.
    - Extract the Symbol.
    - Extract the Amount (default to 100 if not specified).
    - Map every condition mentioned to one of the 6 metrics above.
    - 'GT' means the Real Value must be Greater Than the Target.
    - 'LT' means the Real Value must be Less Than the Target.

    EXAMPLES:
    User: "Buy BTC if price drops below 60000 and RSI is under 30"
    Output: { symbol: "BTC", action: "BUY", amount: 100, conditions: [{metric: "PRICE", operator: "LT", value: 60000}, {metric: "RSI", operator: "LT", value: 30}] }
    
    User: "Sell ETH when Sentiment is above 80"
    Output: { symbol: "ETH", action: "SELL", amount: 100, conditions: [{metric: "SENTIMENT", operator: "GT", value: 80}] }
    `;

    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `User Strategy: "${userPrompt}"`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: "application/json",
                responseSchema: smartTradeSchema
            }
        });

        if (response.text) {
            return JSON.parse(response.text) as SmartTradePlan;
        }
        throw new Error("Failed to parse smart trade strategy");
    } catch (error) {
        console.error("Smart Trade Agent Error:", error);
        throw error;
    }
};
