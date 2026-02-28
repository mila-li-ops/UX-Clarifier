import { GoogleGenAI, Type } from "@google/genai";
import { v4 as uuidv4 } from "uuid";
import { AnalysisResult } from "@/types";

const ai = new GoogleGenAI({ apiKey: process.env.NEXT_PUBLIC_GEMINI_API_KEY });

export async function analyzeFeature(
  input: string,
  imagePart?: { inlineData: { data: string; mimeType: string } }
): Promise<AnalysisResult> {
  const model = "gemini-3.1-pro-preview";
  const prompt = `
You are an expert UX/Product Designer and Systems Thinker.
Your task is to validate a feature description before design or development starts.
Analyze the provided feature description and detect hidden assumptions, structural risks, and potential UX failures.

Extract the following:
1. A concise feature title.
2. An ambiguity score from 0 to 100 (0 = completely clear, 100 = highly ambiguous).
3. An executive summary of the feature and its main challenges.
4. Implicit Assumptions: Group by type (e.g., User Behavior, Technical, Business). Describe the assumption and assign a severity (Low, Medium, High).
5. System Risk Scenarios: Group by category. Describe the scenario and assign an impact (Low, Medium, High).
6. Predicted UX Problems: Describe the problem, the UX heuristic violated, and assign a severity (Low, Medium, High).
7. Next Actions: A list of actionable steps for the designer to clarify the feature.

Feature Description:
${input}
`;

  const parts: any[] = [{ text: prompt }];
  if (imagePart) {
    parts.push(imagePart);
  }

  const response = await ai.models.generateContent({
    model,
    contents: { parts },
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          featureTitle: { type: Type.STRING },
          ambiguityScore: { type: Type.NUMBER },
          executiveSummary: { type: Type.STRING },
          implicitAssumptions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                type: { type: Type.STRING },
                description: { type: Type.STRING },
                severity: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
              },
            },
          },
          systemRiskScenarios: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                category: { type: Type.STRING },
                scenario: { type: Type.STRING },
                impact: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
              },
            },
          },
          predictedUXProblems: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                problem: { type: Type.STRING },
                heuristicViolated: { type: Type.STRING },
                severity: { type: Type.STRING, description: "Must be 'Low', 'Medium', or 'High'" },
              },
            },
          },
          nextActions: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
          },
        },
        required: [
          "featureTitle",
          "ambiguityScore",
          "executiveSummary",
          "implicitAssumptions",
          "systemRiskScenarios",
          "predictedUXProblems",
          "nextActions",
        ],
      },
    },
  });

  const jsonStr = response.text?.trim();
  if (!jsonStr) {
    throw new Error("Failed to generate analysis");
  }

  const parsed = JSON.parse(jsonStr);

  return {
    id: uuidv4(),
    date: new Date().toISOString(),
    ...parsed,
  };
}
