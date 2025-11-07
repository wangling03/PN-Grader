
import { GoogleGenAI, Type } from '@google/genai';
import type { GradingResult } from '../types';

// Ensure the API key is available
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const gradingSchema = {
    type: Type.OBJECT,
    properties: {
        overallScore: {
            type: Type.NUMBER,
            description: "The total calculated score based on all criteria.",
        },
        maxPossibleScore: {
            type: Type.NUMBER,
            description: "The maximum possible score that could be achieved.",
        },
        summary: {
            type: Type.STRING,
            description: "A concise, one to two-sentence summary of the overall performance and key areas for improvement.",
        },
        feedbackItems: {
            type: Type.ARRAY,
            description: "A list of detailed feedback for each criterion in the rubric.",
            items: {
                type: Type.OBJECT,
                properties: {
                    criterion: {
                        type: Type.STRING,
                        description: "The specific criterion from the rubric being evaluated.",
                    },
                    score: {
                        type: Type.NUMBER,
                        description: "The score awarded for this specific criterion.",
                    },
                    maxScore: {
                        type: Type.NUMBER,
                        description: "The maximum possible score for this criterion.",
                    },
                    feedback: {
                        type: Type.STRING,
                        description: "Detailed, constructive feedback for this criterion, explaining the rationale for the score and suggesting improvements.",
                    },
                },
                required: ["criterion", "score", "maxScore", "feedback"],
            },
        },
    },
    required: ["overallScore", "maxPossibleScore", "summary", "feedbackItems"],
};

export async function gradePatientNote(patientNote: string, rubric: string): Promise<GradingResult> {
  const prompt = `
    You are an expert clinical evaluator and medical educator. 
    Your task is to meticulously grade the provided 'Patient Note' using the specific criteria outlined in the 'Grading Rubric'.
    Analyze the note thoroughly and provide a detailed, objective evaluation for each point in the rubric.
    
    Respond ONLY with a JSON object that conforms to the specified schema. Do not include any introductory text, concluding remarks, or markdown formatting like \`\`\`json. Your entire response must be the raw JSON object.

    ---
    PATIENT NOTE:
    ---
    ${patientNote}

    ---
    GRADING RUBRIC:
    ---
    ${rubric}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: gradingSchema,
        temperature: 0.2,
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);
    
    // Basic validation to ensure the parsed object matches the expected structure
    if (
      typeof result.overallScore !== 'number' ||
      !Array.isArray(result.feedbackItems)
    ) {
      throw new Error("Invalid JSON structure received from API.");
    }
    
    return result as GradingResult;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    if (error instanceof Error) {
        throw new Error(`Failed to get a valid grade from the AI. Reason: ${error.message}`);
    }
    throw new Error("An unknown error occurred while grading the note.");
  }
}
