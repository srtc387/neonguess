import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const modelName = 'gemini-2.5-flash';

/**
 * AI generates a secret number between 0 and 100.
 * We act like it's "thinking" of a number.
 */
export const generateAISecret = async (): Promise<number> => {
  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: "Pick a random integer between 0 and 100. Return ONLY the number, no text.",
    });
    
    const text = response.text.trim();
    const num = parseInt(text, 10);
    
    if (isNaN(num) || num < 0 || num > 100) {
      // Fallback if AI hallucinates format
      return Math.floor(Math.random() * 101);
    }
    return num;
  } catch (error) {
    console.error("AI Secret Error:", error);
    return Math.floor(Math.random() * 101);
  }
};

/**
 * AI tries to guess the player's number.
 * We give it a "persona" to make it feel 80s sci-fi.
 */
export const generateAIGuess = async (history: string): Promise<number> => {
  try {
    const prompt = `
      You are an 80s arcade supercomputer villain. 
      You are playing a number guessing game (0-100).
      Your goal is to guess the number the human player has chosen.
      
      Game History (if any): ${history}
      
      Pick an integer between 0 and 100 that you think the player chose.
      Return ONLY the integer. Do not add punctuation or text.
    `;

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
    });

    const text = response.text.trim();
    const num = parseInt(text, 10);

    if (isNaN(num) || num < 0 || num > 100) {
      return Math.floor(Math.random() * 101);
    }
    return num;
  } catch (error) {
    console.error("AI Guess Error:", error);
    return Math.floor(Math.random() * 101);
  }
};