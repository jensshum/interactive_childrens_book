import OpenAI from 'openai';

// Initialize the OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

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

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are a creative children's story writer who creates engaging, age-appropriate stories."
        },
        {
          role: "user",
          content: storyPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating story with ChatGPT:', error);
    throw error;
  }
}

export async function generateImageDescription(scene: string): Promise<string> {
  try {
    const imageDescriptionPrompt = `Describe what is happening in the Scene in simple terms. Your description should be able to be used to generate an image of the scene.
    Scene: ${scene}`;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: "You are an expert at describing scenes for image generation. Provide clear, detailed descriptions that can be used to create illustrations."
        },
        {
          role: "user",
          content: imageDescriptionPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 200
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error generating scene description with ChatGPT:', error);
    throw error;
  }
} 