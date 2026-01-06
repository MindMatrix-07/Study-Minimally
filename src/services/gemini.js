import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

let genAI = null;
if (API_KEY) {
    genAI = new GoogleGenerativeAI(API_KEY);
}

export const analyzeComments = async (comments) => {
    if (!genAI || !comments || comments.length === 0) {
        return { summary: "Unable to analyze comments.", highlights: [] };
    }

    try {
        const model = genAI.getGenerativeModel({
            model: "gemini-1.5-flash",
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
            ]
        });

        const commentsText = comments.map(c => `- ${c.author}: ${c.text}`).join('\n');
        const prompt = `
    Analyze these YouTube comments for an educational video.
    1. Identify the 3 most useful/insightful comments (timestamps, summaries, corrections).
    2. Provide a 1-sentence summary of the general sentiment.
    
    Format as JSON:
    {
      "summary": "General sentiment...",
      "highlights": [ { "author": "Name", "text": "Helpful part..." } ]
    }

    Comments:
    ${commentsText}
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        return JSON.parse(cleanText);
    } catch (error) {
        console.error("Gemini Analysis Failed:", error);
        return { summary: "AI Analysis currently unavailable.", highlights: [] };
    }
};
