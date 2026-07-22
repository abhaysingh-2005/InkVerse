import { GoogleGenAI } from "@google/genai";

/**
 * Helper to generate content using Gemini AI with model fallback support.
 */
export const generateAIContent = async (prompt) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not configured in .env file.");
    }

    const ai = new GoogleGenAI({ apiKey });

    // Supported modern models with fallback order
    const candidateModels = [
        "gemini-3.5-flash-lite",
        "gemini-3.6-flash",
        "gemini-flash-latest",
        "gemini-flash-lite-latest",
        "gemini-3.5-flash"
    ];

    let lastError = null;

    for (const model of candidateModels) {
        try {
            const response = await ai.models.generateContent({
                model,
                contents: prompt,
            });

            if (response && response.text) {
                return response.text;
            }
        } catch (error) {
            console.warn(`[Gemini AI] Model ${model} failed:`, error.message);
            lastError = error;
        }
    }

    throw new Error(lastError?.message || "Failed to generate content using Gemini AI.");
};

export default generateAIContent;