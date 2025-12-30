
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";

// Use process.env.API_KEY directly as per @google/genai guidelines.
export const getGeminiClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY as string });
};

// JARVIS is a sophisticated assistant, using gemini-3-pro-preview for complex reasoning and technical depth.
export const generateAssistantResponse = async (prompt: string, history: {role: string, parts: {text: string}[]}[] = []) => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: [
      ...history,
      { role: 'user', parts: [{ text: prompt }] }
    ],
    config: {
      systemInstruction: "You are JARVIS, a highly advanced, sophisticated, and helpful AI assistant. Your tone is professional, British, slightly witty, and extremely efficient. Keep responses concise unless asked for technical depth.",
      temperature: 0.7,
      topP: 0.95,
    }
  });
  return response.text;
};

// gemini-2.5-flash-image is used for image generation by default.
export const generateAIImage = async (prompt: string): Promise<string | null> => {
  const ai = getGeminiClient();
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image',
    contents: {
      parts: [
        { text: `Generate a high-quality, futuristic image based on: ${prompt}` },
      ],
    },
    config: {
      imageConfig: {
        aspectRatio: "1:1"
      }
    }
  });

  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      return `data:image/png;base64,${part.inlineData.data}`;
    }
  }
  return null;
};
