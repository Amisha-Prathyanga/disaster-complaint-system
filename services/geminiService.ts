import { GoogleGenAI, Type } from "@google/genai";
import { ComplaintCategory, Priority } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface AnalysisResult {
  priority: Priority;
  summary: string;
  categorySuggestion: ComplaintCategory;
}

export const analyzeComplaintWithGemini = async (
  title: string,
  description: string,
  currentCategory: string
): Promise<AnalysisResult> => {
  try {
    const prompt = `
      You are an AI assistant for a Disaster Complaint Management System.
      Analyze the following complaint details and determine the priority level (Low, Medium, High, Critical).
      Also, suggest the most appropriate category and provide a very brief (one sentence) summary/reason for the priority.
      
      Complaint Title: ${title}
      Complaint Description: ${description}
      Current Category: ${currentCategory}
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            priority: {
              type: Type.STRING,
              enum: ["Low", "Medium", "High", "Critical"],
              description: "The assessed priority of the disaster complaint."
            },
            summary: {
              type: Type.STRING,
              description: "A one-sentence justification for the priority."
            },
            categorySuggestion: {
              type: Type.STRING,
              enum: [
                "Safety & Security",
                "Infrastructure Damage",
                "Medical Emergency",
                "Food & Supplies",
                "General/Other"
              ],
              description: "The corrected or confirmed category."
            }
          },
          required: ["priority", "summary", "categorySuggestion"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);

    // Map string response to enums safely
    const priorityMap: Record<string, Priority> = {
      "Low": Priority.LOW,
      "Medium": Priority.MEDIUM,
      "High": Priority.HIGH,
      "Critical": Priority.CRITICAL
    };

    const categoryMap: Record<string, ComplaintCategory> = {
      "Safety & Security": ComplaintCategory.SAFETY,
      "Infrastructure Damage": ComplaintCategory.INFRASTRUCTURE,
      "Medical Emergency": ComplaintCategory.MEDICAL,
      "Food & Supplies": ComplaintCategory.SUPPLIES,
      "General/Other": ComplaintCategory.OTHER
    };

    return {
      priority: priorityMap[result.priority] || Priority.MEDIUM,
      summary: result.summary,
      categorySuggestion: categoryMap[result.categorySuggestion] || ComplaintCategory.OTHER
    };

  } catch (error) {
    console.error("Gemini analysis failed:", error);
    // Fallback in case of error
    return {
      priority: Priority.MEDIUM,
      summary: "AI Analysis unavailable. Defaulting to Medium.",
      categorySuggestion: ComplaintCategory.OTHER
    };
  }
};