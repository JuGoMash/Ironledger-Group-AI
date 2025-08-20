import { GoogleGenAI, Type, GenerateContentResponse, GroundingChunk } from "@google/genai";
import type { Prospect, FactCheckResult, GeneratedFile } from '../types';

declare global {
  interface Window {
    GEMINI_API_KEY: string;
  }
}

const apiKey = window.GEMINI_API_KEY;

if (!apiKey || apiKey.startsWith("__")) {
  // Display a more user-friendly error in the UI if possible,
  // but for now, this prevents the app from making failed API calls.
  const errorDiv = document.createElement('div');
  errorDiv.style.cssText = 'position:fixed;top:0;left:0;width:100%;padding:12px;background-color:#7f1d1d;color:white;text-align:center;font-family:sans-serif;z-index:9999;';
  errorDiv.innerText = 'Configuration Error: API Key is not set. Please configure it in your deployment environment.';
  document.body.prepend(errorDiv);
  throw new Error("API_KEY is not configured.");
}


const ai = new GoogleGenAI({ apiKey: apiKey });

export const generatePost = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a professional and engaging post for my company about: ${prompt}`,
      config: {
        systemInstruction: "You are a professional content creator for a business. Write in a clear, concise, and engaging tone. Avoid jargon. The output should be ready to be published on a blog or social media.",
        temperature: 0.7,
        topP: 0.95,
        topK: 64,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Error generating post:", error);
    throw new Error("Failed to generate post. Please try again.");
  }
};

export const generateImage = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateImages({
      model: 'imagen-3.0-generate-002',
      prompt: prompt,
      config: {
        numberOfImages: 1,
        outputMimeType: 'image/jpeg',
        aspectRatio: '1:1',
      },
    });

    if (response.generatedImages && response.generatedImages.length > 0) {
      const base64ImageBytes: string = response.generatedImages[0].image.imageBytes;
      return `data:image/jpeg;base64,${base64ImageBytes}`;
    } else {
      throw new Error("No image was generated.");
    }
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Failed to generate image. The prompt may have been blocked.");
  }
};

const prospectsSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "The full name of the professional." },
            specialty: { type: Type.STRING, description: "The professional's specialty or job title." },
            location: { type: Type.STRING, description: "The city and state where the professional is located." },
            contact: { type: Type.STRING, description: "A publicly available contact method, such as a professional profile URL or a general clinic phone number. Do not provide personal emails or direct phone numbers." },
        },
        required: ["name", "specialty", "location", "contact"],
    }
};

export const findProspects = async (prompt: string): Promise<Prospect[]> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: `Find a list of professionals based on this query: ${prompt}. Only use publicly available information.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: prospectsSchema,
            },
        });
        
        const jsonText = response.text.trim();
        return JSON.parse(jsonText) as Prospect[];
    } catch (error) {
        console.error("Error finding prospects:", error);
        throw new Error("Failed to find prospects. Please try a different query.");
    }
};

export const checkFact = async (prompt: string): Promise<FactCheckResult> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: prompt,
            config: {
                tools: [{ googleSearch: {} }],
            },
        });

        const answer = response.text;
        const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] || [];

        return { answer, sources };
    } catch (error) {
        console.error("Error checking fact:", error);
        throw new Error("Failed to check fact. The query may be unsupported.");
    }
};

const generatedFileSchema = {
    type: Type.ARRAY,
    items: {
        type: Type.OBJECT,
        properties: {
            fileName: { 
                type: Type.STRING, 
                description: "The full path and name of the file, e.g., 'src/components/Button.tsx'. If modifying an existing file, use its original name. For new files, create a logical path and name."
            },
            code: { 
                type: Type.STRING, 
                description: "The complete code content for the file. This should be the full file content, not just a diff."
            },
        },
        required: ["fileName", "code"],
    },
};

export const generateFullStackCode = async (prompt: string, codeContext: string = ''): Promise<GeneratedFile[]> => {
  try {
    const systemInstruction = `You are an expert full-stack software architect. Your task is to generate a complete set of files for a web application feature based on the user's request.
- Analyze the user's prompt. If code context is provided, understand that you are modifying an existing project. Your generated files should integrate with or modify the provided files. If no context is provided, generate a new project from scratch.
- Determine all the necessary files, including frontend components (React/TSX), backend routes (Node.js/Express), database models/schemas (SQL or ORM), styling (CSS/Tailwind), etc.
- For each file, provide the complete, production-ready code. If you are modifying an existing file, you must return the ENTIRE file's content with the changes applied.
- Structure your response as a JSON array of objects, where each object represents a file and has "fileName" and "code" properties.
- Do not add any conversational text, explanations, or apologies in your response. Only provide the JSON array.`;

    const finalPrompt = codeContext 
        ? `CODE CONTEXT:\n\n${codeContext}\n\n---\n\nUSER REQUEST: "${prompt}"`
        : `User Request: "${prompt}"`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: finalPrompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.3,
        responseMimeType: "application/json",
        responseSchema: generatedFileSchema,
      }
    });

    const jsonText = response.text.trim();
    const files = JSON.parse(jsonText) as GeneratedFile[];
     if (!Array.isArray(files) || files.some(f => typeof f.fileName !== 'string' || typeof f.code !== 'string')) {
      throw new Error("Invalid JSON structure received from API.");
    }
    return files;

  } catch (error) {
    console.error("Error generating code:", error);
    if (error instanceof SyntaxError) {
        throw new Error("Failed to parse the generated code structure. The AI may have returned an invalid format.");
    }
    throw new Error("Failed to generate code. The model may not support this request or an internal error occurred.");
  }
};