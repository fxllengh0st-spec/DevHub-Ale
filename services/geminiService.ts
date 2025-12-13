import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { projects } from "../data";

let chatSession: Chat | null = null;

// Contexto do sistema injetado para dar "inteligência" sobre os projetos ao assistente
const systemInstruction = `
You are the "DevHub Intelligence", a senior-level AI assistant for this portfolio.
CONTEXT:
This portfolio showcases 40 professional frontend projects built with React, TypeScript, and modern stacks.
PROJECT DATA SUMMARY:
${projects.map(p => `- ${p.title} (${p.category}): ${p.tags.join(', ')}`).join('\n')}

BEHAVIOR:
1. Be technically precise and concise.
2. If a user asks for "React projects", suggest 3 specific ones from the list.
3. If asked about experience, mention that the developer has 40 projects ranging from AI to E-commerce.
4. Always maintain a dark-mode, tech-focused personality.
5. Max response length: 120 words.
`;

export const getChatResponseStream = async (message: string) => {
  // Inicialização tardia para garantir que o process.env.API_KEY esteja disponível no contexto de execução
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  if (!chatSession) {
    chatSession = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
        topP: 0.95,
      },
    });
  }

  try {
    return await chatSession.sendMessageStream({ message });
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    // Reset session on critical errors to allow retry
    chatSession = null;
    throw error;
  }
};