import { GoogleGenAI } from "@google/genai";
import { aiConfig } from '../data/appConfig';
import { ChatMessage } from "../types";

// Per guidelines, the API key MUST be obtained exclusively from the environment variable.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export async function generateContentWithHistory(prompt: string, history: ChatMessage[]): Promise<string> {
    try {
        const chatHistory = history.map(msg => ({
            role: msg.role,
            parts: msg.parts,
        }));

        const response = await ai.models.generateContent({
            model: aiConfig.model,
            contents: [...chatHistory, { role: "user", parts: [{ text: prompt }] }],
            config: {
                systemInstruction: aiConfig.systemInstruction,
            }
        });
        
        return response.text;
    } catch (error) {
        console.error("Error generating content:", error);
        if (error instanceof Error) {
            return `An error occurred: ${error.message}. Please check your API key and network connection.`;
        }
        return "An unknown error occurred while contacting the AI.";
    }
}
