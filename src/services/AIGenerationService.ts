
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { QuizQuestion, QuestionTypeStrings, TrueFalseQuestion, BaseQuestion } from '../types';
import { generateUniqueId } from '../utils/idGenerators';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Simplified JSON structure for a TrueFalseQuestion to guide Gemini
const trueFalseQuestionJSONStructure = `{
  "prompt": "string (the question text, e.g., 'The sky is blue.')",
  "correctAnswer": "boolean (true or false, e.g., true)",
  "explanation": "string (optional explanation, e.g., 'The sky appears blue due to Rayleigh scattering.')",
  "points": "number (optional, e.g., 10)",
  "learningObjective": "string (optional, e.g., 'Understand basic atmospheric optics.')",
  "difficulty": "string (optional, must be one of: 'easy', 'medium', 'hard', e.g., 'easy')",
  "category": "string (optional, e.g., 'Science')",
  "topic": "string (optional, e.g., 'Atmospheric Physics')",
  "glossary": "array of strings (optional, e.g., [\\"Rayleigh scattering\\", \\"Atmosphere\\"])",
  "bloomLevel": "string (optional, e.g., \\"Remembering\\")",
  "gradeBand": "string (optional, e.g., \\"Grades 6-8\\")",
  "contextCode": "string (optional, e.g., \\"SCI.PHYS.OPT.001\\")"
}`;
// Add more structures here for other question types in the future

export const generateQuizQuestion = async (
  topic: string,
  questionType: QuestionTypeStrings,
  difficulty?: string,
): Promise<QuizQuestion | null> => {
  if (questionType !== 'true_false') {
    console.error("AI Generation currently only supports 'True/False' questions.");
    throw new Error("AI Generation currently only supports 'True/False' questions. Other types are coming soon!");
  }

  const requestedQuestionTypeDescription = "True/False";
  const systemInstruction = `You are an expert quiz question generator.
Your task is to generate a single, high-quality ${requestedQuestionTypeDescription} question based on the provided topic and difficulty.
Your response MUST be a single, valid JSON object that strictly adheres to the following structure. Do NOT include any text, explanations, or markdown formatting outside of this JSON object.

Expected JSON Structure for a ${requestedQuestionTypeDescription} question:
${trueFalseQuestionJSONStructure}

Constraints and Guidelines:
- 'prompt': Must be a clear, concise, and unambiguous statement that can be evaluated as true or false.
- 'correctAnswer': Must be a boolean value (true or false).
- 'explanation': (Optional) Provide a brief, accurate explanation for the answer.
- 'points': (Optional) Assign a reasonable integer value, typically between 5 and 20. Default to 10 if unsure.
- 'difficulty': (Optional) If provided in the user prompt, use it. Otherwise, infer from the topic or default to 'medium'. Must be one of 'easy', 'medium', or 'hard'.
- 'topic': (Optional) Should be closely related to the user-provided topic.
- 'category': (Optional) A general subject area (e.g., 'Science', 'History', 'Mathematics').
- 'learningObjective': (Optional) A brief statement of what the question assesses.
- 'glossary': (Optional) An array of relevant keywords or terms.
- 'bloomLevel': (Optional) The cognitive level according to Bloom's Taxonomy (e.g., 'Remembering', 'Understanding', 'Applying').
- 'gradeBand': (Optional) Target grade level (e.g., 'Grades 3-5', 'High School').
- 'contextCode': (Optional) An internal or standard-based code for the question.


Ensure the generated question is factually accurate and appropriate for the given topic and difficulty.
`;

  const userPrompt = `Generate a ${requestedQuestionTypeDescription} question about the following topic: "${topic}".
${difficulty ? `The desired difficulty is: "${difficulty}".` : 'Use a medium difficulty if not obvious from the topic.'}
Return ONLY the JSON object.`;
  
  let genAIResponse: GenerateContentResponse | undefined;

  try {
    console.log("Sending prompt to Gemini:", userPrompt, "System Instruction:", systemInstruction);
    genAIResponse = await ai.models.generateContent({
      model: 'gemini-2.5-flash-preview-04-17',
      contents: userPrompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
      }
    });

    let jsonStr = genAIResponse.text.trim();
    console.log("Raw AI Response Text:", jsonStr);

    const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
    const match = jsonStr.match(fenceRegex);
    if (match && match[2]) {
      jsonStr = match[2].trim();
      console.log("Stripped JSON Content:", jsonStr);
    }
    
    const generatedData = JSON.parse(jsonStr);
    console.log("Parsed AI Response JSON:", generatedData);

    if (questionType === 'true_false') {
      if (
        typeof generatedData.prompt === 'string' &&
        typeof generatedData.correctAnswer === 'boolean'
      ) {
        const baseQuestionPart: Omit<BaseQuestion, 'id' | 'questionType'> = {
          prompt: generatedData.prompt,
          points: typeof generatedData.points === 'number' && generatedData.points >= 0 ? generatedData.points : 10,
          explanation: typeof generatedData.explanation === 'string' ? generatedData.explanation : undefined,
          learningObjective: typeof generatedData.learningObjective === 'string' ? generatedData.learningObjective : undefined,
          glossary: Array.isArray(generatedData.glossary) ? generatedData.glossary.filter((g: any) => typeof g === 'string') : undefined,
          bloomLevel: typeof generatedData.bloomLevel === 'string' ? generatedData.bloomLevel : undefined,
          difficulty: ['easy', 'medium', 'hard'].includes(generatedData.difficulty) ? generatedData.difficulty : 'medium',
          contextCode: typeof generatedData.contextCode === 'string' ? generatedData.contextCode : undefined,
          gradeBand: typeof generatedData.gradeBand === 'string' ? generatedData.gradeBand : undefined,
          course: typeof generatedData.course === 'string' ? generatedData.course : undefined, // Added course
          category: typeof generatedData.category === 'string' ? generatedData.category : undefined,
          topic: typeof generatedData.topic === 'string' ? generatedData.topic : (topic || undefined), 
        };

        const aiQuestion: TrueFalseQuestion = {
          ...baseQuestionPart,
          id: generateUniqueId('ai_tf_'), 
          questionType: 'true_false',
          correctAnswer: generatedData.correctAnswer,
        };
        return aiQuestion;
      } else {
        console.error("Generated JSON for True/False question is missing required fields (prompt, correctAnswer) or has incorrect types.", generatedData);
        throw new Error("AI response for True/False question had invalid structure. Required: 'prompt' (string), 'correctAnswer' (boolean).");
      }
    }
    
    return null; 
  } catch (error: any) {
    console.error("Error generating or processing AI question:", error);
    let errorMessage = `Failed to generate question with AI: ${error.message || String(error)}`;
    if (error.message && error.message.toLowerCase().includes("api key not valid")) {
        errorMessage = "Invalid API Key for Gemini. Please ensure your API key is correctly configured and has permissions for the Gemini API.";
    } else if (error.message && error.message.toLowerCase().includes("deadline exceeded")) {
        errorMessage = "The request to Gemini API timed out. The service might be busy or there could be network issues. Please try again later.";
    } else if (error instanceof SyntaxError) {
        errorMessage = `Failed to parse AI response as JSON. Raw response: ${genAIResponse?.text?.substring(0, 200) || "N/A"}`;
    }
    throw new Error(errorMessage);
  }
};
