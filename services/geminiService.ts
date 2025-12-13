import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { projects } from "../data";

let chatSession: Chat | null = null;

// Initialize the API client
// Note: We strictly follow the rule to use process.env.API_KEY without asking the user.
// In a real deployed environment, this would be set in the build/server variables.
const apiKey = process.env.API_KEY || ''; 

// We prepare a system instruction that gives the AI context about the portfolio.
const systemContext = `
You are an intelligent portfolio assistant for a Senior Frontend Engineer.
Here is the data of the 40 projects in this portfolio:
${JSON.stringify(projects.map(p => ({ 
  id: p.id, 
  title: p.title, 
  desc: p.description, 
  tags: p.tags, 
  category: p.category 
})))}

Your goal is to help recruiters and visitors find specific projects based on technologies, categories, or complexity.
- Be concise and professional.
- If asked about "React" projects, list a few by name.
- If asked about "Experience", summarize the breadth of projects shown (e.g., "The engineer has extensive experience in E-commerce and Dashboards...").
- Keep answers under 100 words unless detailed analysis is requested.
`;

export const getChatResponseStream = async (message: string) => {
  if (!apiKey) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const ai = new GoogleGenAI({ apiKey });

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemContext,
      },
    });
  }

  try {
    const resultStream = await chatSession.sendMessageStream({ message });
    return resultStream;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};