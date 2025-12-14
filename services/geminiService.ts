import { GoogleGenAI, Type } from "@google/genai";
import { projects } from "../data";
import { Category, Project } from "../types";

const getSystemInstruction = () => `
You are the "DevHub Intelligence", a senior-level AI assistant for this portfolio.
CONTEXT:
This portfolio showcases professional frontend projects built with React, TypeScript, and modern stacks.
PROJECT DATA SUMMARY:
${projects.map(p => `- ${p.title} (${p.category}): ${p.tags.join(', ')}`).join('\n')}

BEHAVIOR:
1. Be technically precise and concise.
2. If a user asks for "React projects", suggest 3 specific ones from the list.
3. If asked about experience, mention that the developer has a solid collection of projects ranging from AI to E-commerce.
4. Always maintain a dark-mode, tech-focused personality.
5. Max response length: 120 words.
`;

export const getChatResponseStream = async (message: string) => {
  // Inicialização no momento da chamada para garantir captura da chave do ambiente
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: getSystemInstruction(),
      temperature: 0.7,
      topP: 0.95,
    },
  });

  try {
    return await chat.sendMessageStream({ message });
  } catch (error: any) {
    console.error("Gemini Stream Error:", error);
    throw error;
  }
};

export const refineProjectsFromGitHub = async (repos: any[]): Promise<Partial<Project>[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `Analyze these GitHub repositories and transform them into a structured portfolio project format. 
  For each repo, create a professional title, a compelling 2-line description, 
  select the most appropriate category from: ${Object.values(Category).filter(c => c !== Category.ALL).join(', ')},
  and list the key technologies as tags.
  
  REPOS:
  ${JSON.stringify(repos.map(r => ({ name: r.name, desc: r.description, lang: r.language, topics: r.topics })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING },
              category: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              repoUrl: { type: Type.STRING },
              demoUrl: { type: Type.STRING }
            },
            required: ["title", "description", "category", "tags"]
          }
        }
      }
    });
    return JSON.parse(response.text || '[]');
  } catch (e) {
    console.error("Error analyzing projects with Gemini:", e);
    throw e;
  }
};