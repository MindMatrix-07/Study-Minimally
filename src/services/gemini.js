import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const analyzeComments = async (comments) => {
    if (!genAI || !comments || comments.length === 0) {
        return {
            summary: "Unable to analyze comments (Missing API Key or No Comments).",
            highlights: []
        };
    }

    try {
        // Switched to gemini-1.5-flash for speed and reliability
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const commentsText = comments.map(c => `- ${c.author}: ${c.text}`).join('\n');
        const prompt = `
    Analyze these YouTube comments for an educational video.
    
    1. Identify the 3 most useful/insightful comments that add value (e.g., timestamps, summaries, corrections).
    2. Provide a 1-sentence summary of the general sentiment.
    
    Format the output as JSON:
    {
      "summary": "General sentiment summary...",
      "highlights": [
        { "author": "User Name", "text": "The specific helpful part..." }
      ]
    }

    Comments:
    ${commentsText}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Clean up markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return {
            summary: "AI Analysis currently unavailable.",
            highlights: []
        };
    }
};
