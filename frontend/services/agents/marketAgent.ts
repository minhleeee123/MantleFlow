
import { Type, Schema } from "@google/genai";
import { ai } from "../client";
import { CryptoData, PricePoint, LongShortData } from "../../types";
import { searchCoinGecko, getPriceAction, getSentiment, getLongShortRatio } from "../data/marketData";

const cryptoSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    coinName: { type: Type.STRING, description: "Name of the cryptocurrency" },
    symbol: { type: Type.STRING, description: "Ticker symbol (e.g. BTC, ETH)" },
    currentPrice: { type: Type.NUMBER, description: "Current price in USD" },
    summary: { type: Type.STRING, description: "A brief analytical summary based on the provided real data." },
    priceHistory: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          price: { type: Type.NUMBER }
        }
      }
    },
    tokenomics: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          value: { type: Type.NUMBER }
        }
      }
    },
    sentimentScore: { type: Type.NUMBER },
    longShortRatio: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          time: { type: Type.STRING },
          long: { type: Type.NUMBER },
          short: { type: Type.NUMBER }
        }
      }
    },
    projectScores: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          subject: { type: Type.STRING },
          A: { type: Type.NUMBER },
          fullMark: { type: Type.NUMBER }
        }
      }
    }
  },
  required: ["coinName", "symbol", "currentPrice", "summary", "priceHistory", "tokenomics", "sentimentScore", "longShortRatio", "projectScores"]
};

export const analyzeCoin = async (coinName: string): Promise<CryptoData> => {
  // 1. Identify the coin
  const coinInfo = await searchCoinGecko(coinName);
  
  // Prepare Real Data Variables
  let realPriceData: { history: PricePoint[], currentPrice: number } | null = null;
  let realSentiment = 50;
  let realLongShort: LongShortData[] | null = null;
  let identifiedName = coinName;
  let identifiedSymbol = "BTC"; // Default fallback

  if (coinInfo) {
    identifiedName = coinInfo.name;
    identifiedSymbol = coinInfo.symbol;
    
    // 2. Parallel Fetching of Real Data
    const [priceResult, sentimentResult, lsResult] = await Promise.all([
      getPriceAction(coinInfo.id),
      getSentiment(),
      getLongShortRatio(coinInfo.symbol)
    ]);

    realPriceData = priceResult;
    realSentiment = sentimentResult;
    realLongShort = lsResult;
  }

  // 3. Construct Prompt with Real Data
  const systemPrompt = `
    You are a Crypto Data Aggregator. 
    I have fetched REAL-TIME data from external APIs. 
    Your job is to structure this data into the required JSON format and generating the missing pieces (Tokenomics, Project Score) based on your knowledge of the project.

    REAL DATA PROVIDED:
    - Coin Name: ${identifiedName}
    - Symbol: ${identifiedSymbol}
    - Current Price: ${realPriceData ? `$${realPriceData.currentPrice}` : "Unknown, please estimate"}
    - Price History (7D): ${realPriceData ? JSON.stringify(realPriceData.history) : "Unavailable, please generate realistic data"}
    - Market Sentiment (Fear & Greed): ${realSentiment}
    - Long/Short Ratio (Binance): ${realLongShort ? JSON.stringify(realLongShort) : "Unavailable, please generate realistic 50/50ish data"}

    INSTRUCTIONS:
    1. **Use the REAL DATA provided above exactly.** Do not change the price history numbers or sentiment score if provided.
    2. **Generate 'tokenomics'**: Create a realistic distribution for ${identifiedName} (e.g., if BTC, mostly Retail/Miners; if SOL, more Team/Insiders).
    3. **Generate 'projectScores'**: Rate ${identifiedName} on Security, Decentralization, Scalability, Ecosystem, Tokenomics (0-100).
    4. **Generate 'summary'**: Write a 2-sentence analysis referencing the specific price trend and sentiment provided.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Generate the full JSON dashboard data for ${identifiedName} (${identifiedSymbol}).`,
      config: {
        systemInstruction: systemPrompt,
        responseMimeType: "application/json",
        responseSchema: cryptoSchema,
        temperature: 0.2, // Low temperature to stick to facts
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as CryptoData;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
};

export async function generateMarketReport(data: CryptoData): Promise<string> {
  try {
    const dataString = JSON.stringify(data, null, 2);
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `
      Act as a senior cryptocurrency market analyst.
      Write a "Deep Dive Analysis" for ${data.coinName} based on this dataset:
      ${dataString}
      
      Structure:
      - **Market Sentiment & Price Action**: specific comments on the chart and fear/greed index.
      - **On-Chain & Derivatives**: comments on Long/Short ratio.
      - **Fundamental Health**: comments on project scores and tokenomics.
      - **Verdict**: Bullish, Bearish, or Neutral?
      `,
    });
    return response.text || "Unable to generate market report.";
  } catch (error) {
    console.error("Error generating report:", error);
    return "Unable to generate market report.";
  }
}
