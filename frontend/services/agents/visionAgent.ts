
import { ai } from "../client";

export async function analyzeChartImage(base64Image: string, promptText: string): Promise<string> {
    try {
        const imagePart = {
            inlineData: {
                data: base64Image.split(',')[1], // Remove "data:image/png;base64," prefix
                mimeType: "image/png"
            }
        };

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", // 2.5 Flash supports multimodal vision
            contents: {
                parts: [
                    imagePart,
                    { text: `The user has drawn indicators/lines on this chart. ${promptText}. Analyze the technical setup based on these visual cues.` }
                ]
            }
        });
        return response.text || "I encountered an error trying to see the chart. Please try again.";
    } catch (error) {
        console.error("Vision Analysis Error:", error);
        return "I encountered an error trying to see the chart. Please try again.";
    }
}
