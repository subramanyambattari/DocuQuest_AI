import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy_key');
const model = genAI.getGenerativeModel({ 
  model: process.env.GEMINI_MODEL || 'gemini-1.5-pro',
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export interface ExtractedOption {
  optionKey: string;
  optionText: string;
}

export interface ExtractedQuestion {
  questionNumber?: string;
  questionText: string;
  options: ExtractedOption[];
  answerValue?: string;
  confidenceScore: number;
}

export const extractQuestionsFromText = async (text: string): Promise<ExtractedQuestion[]> => {
  const prompt = `
You are a highly precise document extraction AI. Extract all multiple-choice questions from the following raw document text.
Calculate a confidenceScore (between 0.0 and 1.0) based on how clearly formatted the question is in the text.
If a question is cut off or highly ambiguous, give it a lower score (< 0.8).

Return a strict JSON array containing objects with the following schema:
[
  {
    "questionNumber": "1",
    "questionText": "What is the capital of France?",
    "options": [
      { "optionKey": "A", "optionText": "London" },
      { "optionKey": "B", "optionText": "Paris" }
    ],
    "answerValue": "B", // only include if an answer key is explicitly found in the text
    "confidenceScore": 0.95
  }
]

Text to process:
${text}
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let textResult = response.text();
    
    // Clean up potential markdown formatting from the response
    textResult = textResult.replace(/```json/g, '').replace(/```/g, '').trim();
    
    const parsed = JSON.parse(textResult);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.error('Gemini Extraction Error:', error);
    return [];
  }
};
