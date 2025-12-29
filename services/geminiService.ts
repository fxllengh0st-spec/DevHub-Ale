import { GoogleGenAI, Type } from "@google/genai";
import { projects } from "../data";
import { Category, Project } from "../types";

const getSystemInstruction = () => `
Você é a "DevHub Intelligence", assistente de IA sênior deste portfólio.
CONTEXTO:
Este portfólio exibe projetos frontend profissionais construídos com React, TypeScript e stacks modernas.
RESUMO DOS PROJETOS:
${projects.slice(0, 10).map(p => `- ${p.title} (${p.category}): ${p.tags.join(', ')}`).join('\n')}
(Nota: Existem mais de 40 projetos no total).

COMPORTAMENTO:
1. Seja tecnicamente preciso e responda em Português do Brasil.
2. Seja conciso e use um tom profissional e tech-focused.
3. Se o usuário perguntar por projetos específicos (ex: "projetos com React"), sugira 3 da lista.
4. Explique a arquitetura focando em performance, acessibilidade e design modular.
5. Mantenha as respostas abaixo de 120 palavras.
6. Nunca invente informações sobre o desenvolvedor que não estejam sugeridas pelo contexto de "Senior Frontend Architecture".
`;

const getApiKey = () => {
  const key = process.env.API_KEY;
  if (!key) {
    throw new Error("API Key não configurada. Por favor, utilize o botão 'Configurar Chave' no topo da página.");
  }
  return key;
};

export const getChatResponseStream = async (message: string) => {
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
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
  const ai = new GoogleGenAI({ apiKey: getApiKey() });
  
  const prompt = `Analise estes repositórios do GitHub e transforme-os em um formato estruturado de projeto de portfólio. 
  Para cada repo, crie um título profissional, uma descrição impactante de 2 linhas, 
  selecione a categoria mais apropriada de: ${Object.values(Category).filter(c => c !== Category.ALL).join(', ')},
  e liste as principais tecnologias como tags.
  
  REPOS:
  ${JSON.stringify(repos.map(r => ({ name: r.name, desc: r.description, lang: r.language, topics: r.topics })))}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
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