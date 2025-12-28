
import { GoogleGenAI, Type } from "@google/genai";
import { Language } from "../types";

// Always use new GoogleGenAI({ apiKey: process.env.API_KEY }) before each request
// to ensure the latest API key is used and follow coding guidelines.

export const getDecisionFeedback = async (
  currentStep: string,
  context: string,
  input: string,
  previousSteps: any[],
  lang: Language
) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-flash-preview";
  
  const prompt = `
    You are DecisionAI, a world-class executive coach specializing in decision-making psychology and strategic management.
    Context: ${context}
    Current Step: ${currentStep}
    Leader's Input for this step: ${input}
    Previous Progress: ${JSON.stringify(previousSteps)}

    Your goal is to evaluate the leader's approach for this specific step. 
    1. Identify logical fallacies or biases (e.g., confirmation bias, sunk cost fallacy).
    2. Suggest 2-3 critical questions they should ask themselves.
    3. Provide a 'Decision Maturity Score' for this step (0-100).
    4. Offer a short, punchy constructive insight.

    IMPORTANT: You must respond entirely in ${lang === 'es' ? 'Spanish' : 'English'}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          insights: { type: Type.STRING },
          biasCheck: { type: Type.ARRAY, items: { type: Type.STRING } },
          criticalQuestions: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "insights", "biasCheck", "criticalQuestions"],
      },
    },
  });

  // response.text is a getter property, not a method.
  return JSON.parse(response.text || '{}');
};

export const generateFinalReport = async (fullDecision: any, lang: Language) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const model = "gemini-3-pro-preview";
  
  const prompt = `
    Conduct a final audit of this decision-making process:
    Title: ${fullDecision.title}
    Steps taken: ${JSON.stringify(fullDecision.steps)}

    Provide:
    1. Overall Decision Quality Score (0-100).
    2. Strategic Alignment assessment.
    3. Risk Mitigation recommendations.
    4. Summary of the leader's decision-making style (e.g., Analytical, Collaborative, Decisive).

    IMPORTANT: You must respond entirely in ${lang === 'es' ? 'Spanish' : 'English'}.
  `;

  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          overallScore: { type: Type.NUMBER },
          style: { type: Type.STRING },
          alignment: { type: Type.STRING },
          riskSummary: { type: Type.STRING },
          coachingTip: { type: Type.STRING },
        },
        required: ["overallScore", "style", "alignment", "riskSummary", "coachingTip"],
      },
    },
  });

  // response.text is a getter property, not a method.
  return JSON.parse(response.text || '{}');
};
