import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { character } = await request.json();

    if (!character.photo) {
      return NextResponse.json(
        { error: 'No reference photo provided' },
        { status: 400 }
      );
    }

    const stylePrompt = getStylePrompt(character.artStyle);
    const imagePrompt = `An illustration in ${stylePrompt}. 
    A ${character.age}-year-old ${character.gender} character.
    The image should be a portrait-style illustration.`;

    console.log('Generating styled character image with prompt:', imagePrompt);

    const imageResult = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
      input: {
        image_url: character.photo,
        prompt: imagePrompt,
        num_inference_steps: 30,
        guidance_scale: 7.5,
        strength: 0.95 // Lower strength to preserve more of the original character's features
      },
      logs: true,
    });
    
    const imageUrl = imageResult.data.images[0].url;

    return NextResponse.json({ 
      imageUrl: imageUrl
    });
  } catch (error) {
    console.error('Error generating styled character image:', error);
    return NextResponse.json(
      { error: 'Failed to generate styled character image' },
      { status: 500 }
    );
  }
}

function getStylePrompt(style?: string): string {
  switch (style) {
    case 'watercolor':
      return 'soft and dreamy watercolor painting style';
    case 'cartoon':
      return 'playful cartoon illustration style';
    case 'pixar':
      return '3D rendered Pixar-style';
    case 'anime':
      return 'Japanese anime-style illustration';
    case 'ghibli':
      return 'Studio Ghibli animation style';
    case 'storybook':
    default:
      return 'classic children\'s book illustration style';
  }
} 