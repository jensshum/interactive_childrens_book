import { NextResponse } from 'next/server';
import { fal } from "@fal-ai/client";
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

fal.config({
  credentials: process.env.FAL_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { character, scene, pageNumber, isCharacterImage, characterImageUrl } = await request.json();

    if (isCharacterImage) {
      // Generate character image in the specified art style
      const stylePrompt = getStylePrompt(character.artStyle);
      const characterPrompt = `A ${character.age} year old ${character.gender} child named ${character.name} in ${stylePrompt}. 
      The image should be a portrait style, showing the child's face and upper body. 
      The style should be vibrant, engaging, and suitable for children.`;

      let imageUrl: string;
      
      if (character.photo) {
        const imageResult = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
          input: {
            image_url: character.photo,
            prompt: characterPrompt,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            strength: 0.90
          },
          logs: true,
        });
        
        imageUrl = imageResult.data.images[0].url;
      } else {
        const imageResult = await fal.subscribe("fal-ai/flux/dev/text-to-image", {
          input: {
            prompt: characterPrompt,
            num_inference_steps: 30,
            guidance_scale: 7.5,
            width: 768,
            height: 512,
            seed: pageNumber * 1000
          },
          logs: true,
        });
        
        imageUrl = imageResult.data.images[0].url;
      }

      return NextResponse.json({ imageUrl });
    } else {
      // Generate video from the character image and scene description
      if (!characterImageUrl) {
        throw new Error('Character image URL is required for video generation');
      }

      // First, generate the image description
      const imageDescriptionPrompt = `Describe what is happening in the Scene in simple terms. Your description should be able to be used to generate an image of the scene.
      Scene: ${scene}`;
      
      const descriptionResponse = await openai.chat.completions.create({
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

      const sceneDescription = descriptionResponse.choices[0].message.content || '';

      // Generate video from the character image
      try {
        const videoResult = await fal.subscribe("fal-ai/wan-i2v", {
          input: {
            prompt: sceneDescription,
            image_url: characterImageUrl,
          },
          logs: true,
        });
        
        return NextResponse.json({ 
          videoUrl: videoResult.data.video.url
        });
      } catch (videoError) {
        console.error('Error generating video:', videoError);
        return NextResponse.json({ 
          videoUrl: null
        });
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
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
    case 'storybook':
    default:
      return 'classic children\'s book illustration style';
  }
} 