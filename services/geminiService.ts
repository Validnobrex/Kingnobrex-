
import { GoogleGenAI } from "@google/genai";

export const getGeminiInsights = async (username: string, rank: number, total: number) => {
  try {
    // Initialize GoogleGenAI with the API key from the environment.
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `User ${username} is currently ranked #${rank} with ${total} submissions on our community leaderboard. Give them a short (1-2 sentence) motivational, high-energy shoutout. Mention their rank or submission count.`,
      config: {
        temperature: 0.8,
        // When setting maxOutputTokens, a thinkingBudget must also be defined to avoid empty responses.
        maxOutputTokens: 100,
        thinkingConfig: { thinkingBudget: 50 },
      }
    });
    // Extract the generated text using the .text property.
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Keep pushing! Every submission counts toward the crown! 👑";
  }
};
