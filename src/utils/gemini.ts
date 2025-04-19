import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API client
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Updated model access - using the current API version
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

export async function generateStoryContent(
  character: { name: string; gender: string },
  prompt: { theme: string; setting: string; additionalDetails?: string }
): Promise<string> {
  try {
    const storyPrompt = `Create a children's story with the following details:
    - Main character: ${character.name} (${character.gender})
    - Theme: ${prompt.theme}
    - Setting: ${prompt.setting}
    ${prompt.additionalDetails ? `- Additional details: ${prompt.additionalDetails}` : ''}
    
    The story should be:
    - Age-appropriate for children
    - Engaging and interactive
    - Include a clear beginning, middle, and end
    - Have a positive message or lesson
    - Be approximately 500 words long
    
    Format the story in clear paragraphs with proper spacing.`;

    const result = await model.generateContent(storyPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating story with Gemini:', error);
    throw error;
  }
}