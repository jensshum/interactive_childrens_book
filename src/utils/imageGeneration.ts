import OpenAI from 'openai';
import { StoryCharacter } from '../types/story';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

export async function generateStoryImage(
  character: StoryCharacter,
  scene: string
): Promise<string> {
  try {
    const stylePrompt = getStylePrompt(character.artStyle);
    const response = await openai.images.generate({
      model: "dall-e-3",
      prompt: `Create a ${stylePrompt} illustration of a scene from a children's storybook. The main character should look like the reference photo but in ${character.artStyle} style. Scene description: ${scene}`,
      n: 1,
      size: "1024x1024",
      quality: "standard",
    });

    return response.data[0].url;
  } catch (error) {
    console.error('Error generating image:', error);
    throw error;
  }
}

function getStylePrompt(style: StoryCharacter['artStyle']): string {
  switch (style) {
    case 'watercolor':
      return 'soft and dreamy watercolor painting';
    case 'cartoon':
      return 'playful cartoon illustration';
    case 'pixar':
      return '3D animated Pixar-style rendering';
    case 'anime':
      return 'Japanese anime-style illustration';
    case 'storybook':
      return 'classic children\'s book illustration';
    default:
      return 'storybook illustration';
  }
}