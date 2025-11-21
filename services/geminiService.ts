import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
    throw new Error("API_KEY environment variable is not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

export async function editImageWithAI(
  base64ImageData: string,
  mimeType: string,
  prompt: string
): Promise<string> {
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
            parts: [
                {
                    inlineData: {
                        data: base64ImageData,
                        mimeType: mimeType,
                    },
                },
                {
                    text: prompt,
                },
            ],
        },
        config: {
            responseModalities: [Modality.IMAGE],
        },
    });
    
    if (response.promptFeedback?.blockReason) {
        throw new Error(`Request was blocked by the API due to: ${response.promptFeedback.blockReason}`);
    }

    const candidate = response.candidates?.[0];

    if (!candidate) {
        const responseText = response.text?.trim();
        if (responseText) {
            throw new Error(`AI model refused and responded with: "${responseText}"`);
        }
        throw new Error("The AI model did not return a valid response candidate.");
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
        if (candidate.finishReason && candidate.finishReason !== 'STOP') {
            let userFriendlyMessage = `Reason: ${candidate.finishReason}.`;
            switch (candidate.finishReason) {
                case 'SAFETY':
                    userFriendlyMessage = "The request was blocked for safety reasons. Please try a different prompt or image.";
                    break;
                case 'RECITATION':
                    userFriendlyMessage = "The API's safety filters blocked this request to prevent recitation of copyrighted material. This can happen if the input image is too similar to a known copyrighted image in the model's training data. Please try a different image.";
                    break;
            }
            throw new Error(`AI generation failed. ${userFriendlyMessage}`);
        }
        const responseText = response.text?.trim();
        if (responseText) {
            throw new Error(`AI model refused and responded with: "${responseText}"`);
        }
        throw new Error("AI model returned an empty or invalid response.");
    }
    
    for (const part of candidate.content.parts) {
        if (part.inlineData?.data) {
          return part.inlineData.data;
        }
    }
    
    const responseText = response.text?.trim();
    if (responseText) {
        throw new Error(`AI model responded with text instead of an image: "${responseText}"`);
    }

    throw new Error("No image data found in the AI response.");

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw error;
    }
    throw new Error("Failed to communicate with the AI model. Please check your prompt or try again later.");
  }
}