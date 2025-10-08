import { GoogleGenAI, FunctionDeclaration, Type, GenerateContentResponse, Content } from "@google/genai";

const FALLBACK_API_KEY = process.env.API_KEY;

const getAIClient = (apiKey?: string): GoogleGenAI => {
    const keyToUse = apiKey || FALLBACK_API_KEY;
    if (!keyToUse) {
        throw new Error("API Key not configured.");
    }
    return new GoogleGenAI({ apiKey: keyToUse });
}

const model = 'gemini-2.5-flash';

export const fileSystemTools: FunctionDeclaration[] = [
    {
        name: 'createNode',
        description: "Create a new file or folder for an R package. All package contents must reside in a sub-directory within /Package (e.g., /Package/myPackageName/R/utils.R).",
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: {
                    type: Type.STRING,
                    description: "The full path of the file or folder to create. Must be inside a package-specific sub-directory under '/Package/'."
                },
                type: {
                    type: Type.STRING,
                    description: "The type of node to create, either 'file' or 'folder'."
                },
                content: {
                    type: Type.STRING,
                    description: "Optional content for the file. Ignored for folders."
                }
            },
            required: ['path', 'type']
        }
    },
    {
        name: 'editFile',
        description: 'Edit an existing file for an R package. This will overwrite the entire file content. All package contents must reside in a sub-directory within /Package.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: {
                    type: Type.STRING,
                    description: "The full path of the file to edit. Must be inside a package-specific sub-directory under '/Package/'."
                },
                content: {
                    type: Type.STRING,
                    description: "The new content for the file."
                }
            },
            required: ['path', 'content']
        }
    },
    {
        name: 'duplicateNode',
        description: 'Duplicate an existing file or folder for an R package. All package contents must reside in a sub-directory within /Package.',
        parameters: {
            type: Type.OBJECT,
            properties: {
                path: {
                    type: Type.STRING,
                    description: "The full path of the file or folder to duplicate. Must be inside a package-specific sub-directory under '/Package/'."
                }
            },
            required: ['path']
        }
    }
];

export const continueConversation = async (history: Content[], apiKey?: string): Promise<GenerateContentResponse> => {
  try {
    const ai = getAIClient(apiKey);
    const response = await ai.models.generateContent({
      model,
      contents: history,
      config: {
        systemInstruction: "You are R Packager, a specialized AI assistant for building R packages. Your primary function is to help users create and manage R packages. The user may provide context from files located in the '/Resources' directory at the beginning of their prompt. You MUST use this provided context to inform your answers. All package files and directories MUST be created inside a dedicated sub-directory within the '/Package' directory. For example, if a user asks to create a package named 'myCoolPackage', you must first create the directory '/Package/myCoolPackage' and then place all associated files (like DESCRIPTION, NAMESPACE, R/, man/, etc.) inside it. You can create, edit, and duplicate files and folders based on user instructions, but always within a specific package's sub-directory under '/Package'. Always introduce yourself in the first message. When a user asks for help, guide them on how to structure an R package and offer to create the necessary files and directories following this rule.",
        tools: [{functionDeclarations: fileSystemTools}],
      }
    });
    return response;
  } catch (error) {
    console.error("Gemini API error:", error);
    // Propagate the error to be handled by the UI component
    throw error;
  }
};


export const validateApiKey = async (apiKey: string): Promise<boolean> => {
    if (!apiKey) return false;
    try {
        const ai = getAIClient(apiKey);
        // A simple, low-cost request to check if the key is valid.
        await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: "hello" }] }]
        });
        return true;
    } catch (error) {
        console.error("API Key validation failed:", error);
        return false;
    }
};