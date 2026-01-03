
import { Type, Schema } from "@google/genai";
import { ai } from "../client";
import { PortfolioItem, PortfolioAnalysisResult } from "../../types";

const portfolioSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    totalValue: { type: Type.NUMBER, description: "Total current value of the portfolio in USD" },
    positions: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          asset: { type: Type.STRING, description: "Symbol of the asset (e.g., BTC)" },
          amount: { type: Type.NUMBER },
          avgPrice: { type: Type.NUMBER },
          currentPrice: { type: Type.NUMBER },
          currentValue: { type: Type.NUMBER },
          pnlPercent: { type: Type.NUMBER, description: "Profit/Loss percentage (positive or negative)" },
          allocation: { type: Type.NUMBER, description: "Percentage of total portfolio (0-100)" }
        },
        required: ["asset", "amount", "avgPrice", "currentPrice", "currentValue", "pnlPercent", "allocation"]
      }
    },
    riskAnalysis: { type: Type.STRING, description: "A paragraph assessing diversification and risk levels." },
    rebalancingSuggestions: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "List of actionable suggestions to rebalance the portfolio."
    }
  },
  required: ["totalValue", "positions", "riskAnalysis", "rebalancingSuggestions"]
};

export async function analyzePortfolio(portfolio: PortfolioItem[]): Promise<PortfolioAnalysisResult> {
  try {
     const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze this crypto portfolio: ${JSON.stringify(portfolio)}. 
      Calculate the PNL, Allocation, and Total Value accurately based on the provided numbers.
      Provide a risk assessment and rebalancing suggestions.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: portfolioSchema
      }
    });

    if (response.text) {
        return JSON.parse(response.text) as PortfolioAnalysisResult;
    }
    throw new Error("Empty response");
  } catch (error) {
    console.error("Portfolio Agent Error", error);
    // Return a dummy error object or handle graceful failure in UI
    throw error;
  }
}
