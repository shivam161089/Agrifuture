import { GoogleGenAI, Type, Chat } from "@google/genai";
import type { PlantHealthAnalysis, CropCalendarResponse } from '../types';
import { LANGUAGES } from "../translations";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable is not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const healthAnalysisSchema = {
  type: Type.OBJECT,
  properties: {
    plant_name: { 
        type: Type.STRING,
        description: "The common name of the plant identified in the image, including specific Indian varieties if identifiable (e.g., Rama Tulsi)."
    },
    health_status: { 
        type: Type.STRING,
        description: "A brief status of the plant's health, e.g., 'Healthy', 'Diseased', 'Nutrient Deficient'."
    },
    issue_identified: { 
        type: Type.STRING,
        description: "The specific name of the disease, pest, or deficiency identified. 'N/A' if healthy."
    },
    issue_description: { 
        type: Type.STRING,
        description: "A detailed description of the issue, its symptoms, causes, and potential impact on the plant's growth, yield, and profitability."
    },
    organic_solutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of actionable organic solutions to treat the issue, with application methods suitable for Indian farmers."
    },
    non_organic_solutions: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of actionable non-organic (chemical) solutions, including advice on safe usage."
    },
    preventive_measures: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "A list of robust preventive measures, considering different agro-climatic zones in India."
    }
  },
  required: ['plant_name', 'health_status', 'issue_identified', 'issue_description', 'organic_solutions', 'non_organic_solutions', 'preventive_measures']
};

interface AnalysisOptions {
    userPlantName?: string;
}

export const analyzePlantHealth = async (
    imageBase64: string, 
    mimeType: string, 
    language: string,
    options: AnalysisOptions = {}
): Promise<PlantHealthAnalysis> => {
  const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
  const { userPlantName } = options;

  let modelConfig: object;
  let prompt: string;
  let model: string;

  if (userPlantName) {
    model = 'gemini-2.5-pro';
    modelConfig = {
      tools: [{ googleSearch: {} }],
      temperature: 0.3,
    };

    const jsonStructureDescription = `{
      "plant_name": "string",
      "health_status": "string",
      "issue_identified": "string",
      "issue_description": "string",
      "organic_solutions": ["string"],
      "non_organic_solutions": ["string"],
      "preventive_measures": ["string"]
    }`;

    prompt = `You are an expert agricultural scientist with specialized knowledge of Indian flora. The user has provided an image and identified the plant as '${userPlantName}'.

1.  **Search Online:** Use your search tool to find detailed information about the '${userPlantName}' plant, focusing on Indian varieties, its visual characteristics (leaf shape, flowers, etc.), and common health issues.
2.  **Verify from Image:** Use your research to verify if the provided image is consistent with '${userPlantName}'. If it seems to be a different plant, gently correct the identification.
3.  **Analyze Health:** Based on the image and your research, conduct a thorough health analysis. Diagnose its status and identify any specific issues (disease, pest, deficiency).
4.  **Provide Solutions & Prevention:** Describe the issue's impact on yield and profit. Provide actionable organic, non-organic, and preventive solutions tailored for Indian farmers.

**CRITICAL OUTPUT FORMAT:**
After your full analysis, generate the response in English. Then, translate all string values within the final JSON object to ${languageName}.
Your FINAL and ONLY output MUST be a single, valid JSON object string that follows this structure: ${jsonStructureDescription}.
Do NOT wrap your response in markdown (like \`\`\`json). Do NOT add any text before or after the JSON object.`;

  } else {
    model = 'gemini-2.5-flash';
    modelConfig = {
      responseMimeType: "application/json",
      responseSchema: healthAnalysisSchema,
      temperature: 0.2,
    };
    
    let contextText = "You are an expert agricultural scientist with specialized knowledge of Indian flora and farming practices. Analyze this plant leaf image in detail. Your first task is to identify the plant from the image.";
  
    prompt = `${contextText}

After identification, perform a full analysis with the following structure:
1.  **Health Assessment:** Diagnose its health status. If there's an issue (disease, pest, deficiency), identify it precisely.
2.  **Detailed Description:** Describe the symptoms, causes, and potential impact on the plant's growth, yield, and overall value.
3.  **Actionable Solutions:** Provide comprehensive organic and non-organic solutions. For each solution, specify the application method and frequency, tailored for an Indian context.
4.  **Profitability Focus:** Explain how each solution can help restore the plant's health and ultimately improve the farmer's yield and profit.
5.  **Prevention:** List robust preventive measures, considering different agro-climatic zones in India.

IMPORTANT: First, generate the analysis in English to ensure accuracy. Then, translate all the string values in the final JSON object to ${languageName} before responding. The entire JSON response must be in ${languageName}.`;
  }

  let rawResponseText = '';
  try {
    const imagePart = {
      inlineData: {
        data: imageBase64,
        mimeType,
      },
    };
    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: modelConfig,
    });

    rawResponseText = response.text.trim();
    return JSON.parse(rawResponseText) as PlantHealthAnalysis;
  } catch (error) {
    console.error("Error analyzing plant health:", error);
    if (error instanceof SyntaxError) {
        console.error("Failed to parse JSON response from AI:", rawResponseText);
        throw new Error("The AI returned an invalid response format. Please try again.");
    }
    throw new Error("Failed to analyze plant health. Please try again.");
  }
};

export const getFarmingInfo = async (topic: string, language: string): Promise<string> => {
  const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
  try {
    const prompt = `Explain the agricultural technique "${topic}" in detail for an Indian farmer. Your explanation should be simple, comprehensive, and actionable.

Structure your response with the following sections using markdown headings:
1.  **What is it?** (Detailed introduction)
2.  **Key Benefits for Indian Farmers:** (Focus on small to medium-scale farms, mentioning specific benefits like water conservation, soil health, etc.)
3.  **How it Increases Yield and Profit:** (Provide concrete examples and potential percentage increases. Discuss cost vs. benefit.)
4.  **Challenges and Requirements:** (What are the initial costs, knowledge, and labor requirements?)
5.  **Step-by-Step Guide to Get Started:** (Provide simple, practical steps for a farmer to begin implementing this technique.)
6.  **Region-Specific Advice:** (Mention if this technique is particularly suitable for certain regions or crops in India.)

IMPORTANT: Respond entirely in ${languageName}.`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error fetching farming info:", error);
    throw new Error(`Failed to fetch information on ${topic}.`);
  }
};

export const getCommunityAnswer = async (question: string, language: string): Promise<string> => {
    const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
    try {
        const prompt = `Act as a senior Indian agricultural scientist and expert. A farmer has asked the following question: "${question}". 
        
Provide a helpful, detailed, and practical answer. Use simple language that is easy to understand.
Structure your answer with clear headings and bullet points if necessary.
Your goal is to provide actionable advice.
IMPORTANT: Respond entirely in ${languageName}.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                thinkingConfig: {
                    thinkingBudget: 32768,
                }
            }
        });
        return response.text;
    } catch (error) {
        console.error("Error getting community answer:", error);
        throw new Error("Failed to get an answer. Please try again.");
    }
};

const cropCalendarSchema = {
    type: Type.OBJECT,
    properties: {
        summary: { 
            type: Type.STRING,
            description: "A brief, encouraging summary (2-3 sentences) explaining why these crops are a good choice for the given location and season."
        },
        recommendations: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    crop_name: { type: Type.STRING },
                    sowing_time: { type: Type.STRING },
                    harvesting_time: { type: Type.STRING },
                    key_tips: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    market_demand: {
                        type: Type.STRING,
                        description: "Briefly describe the market demand (e.g., 'High local and export demand', 'Stable demand in regional markets')."
                    },
                    water_requirement: {
                        type: Type.STRING,
                        description: "Describe the water needs (e.g., 'Low - drought tolerant', 'Moderate', 'High - requires regular irrigation')."
                    },
                    soil_suitability: {
                        type: Type.STRING,
                        description: "Describe the best soil type (e.g., 'Well-drained loamy soil', 'Adaptable to various soils')."
                    }
                },
                required: ['crop_name', 'sowing_time', 'harvesting_time', 'key_tips', 'market_demand', 'water_requirement', 'soil_suitability']
            }
        }
    },
    required: ['summary', 'recommendations']
};


export const getCropRecommendations = async (state: string, season: string, language: string): Promise<CropCalendarResponse> => {
    const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
    try {
        const prompt = `Act as an expert Indian agronomist. For the Indian state of "${state}" during the "${season}" season, provide a list of 3-4 suitable and profitable crops for cultivation.

First, write a brief summary explaining the rationale behind the recommendations for this specific time and place.

Then, for each crop, provide the following details:
- crop_name: The name of the crop.
- sowing_time: The ideal period for sowing.
- harvesting_time: The typical period for harvesting.
- key_tips: A list of 2-3 essential cultivation tips.
- market_demand: A brief note on its market potential.
- water_requirement: Its water needs (Low, Moderate, High).
- soil_suitability: The ideal soil type.

IMPORTANT: First, generate the analysis in English to ensure accuracy. Then, translate all the string values in the final JSON object to ${languageName} before responding. The entire JSON response must be in ${languageName}.
Your FINAL output must be a valid JSON object matching the defined schema. Do not add any text before or after it.`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                responseSchema: cropCalendarSchema,
            }
        });

        const rawResponseText = response.text.trim();
        return JSON.parse(rawResponseText) as CropCalendarResponse;
    } catch (error) {
        console.error("Error fetching crop recommendations:", error);
        throw new Error("Failed to fetch crop recommendations.");
    }
};

export const startChatSession = async (language: string): Promise<Chat> => {
    const languageName = LANGUAGES.find(lang => lang.code === language)?.name || 'English';
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: `You are a friendly and helpful AI assistant for Indian farmers named "AgriFriend". 
            - Your goal is to provide concise, easy-to-understand, and actionable advice on all aspects of farming.
            - Always be polite and encouraging.
            - Keep your answers relatively short unless the user asks for details.
            - Respond entirely in ${languageName}.`,
        },
    });
    return chat;
};
