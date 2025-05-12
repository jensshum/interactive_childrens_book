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
    const { character, scene, pageNumber, debugMode } = await request.json();

    // First, generate the image description
    const imageDescriptionPrompt = `Describe what is happening in the Scene in simple terms. Your description should be able to be used to generate an image of the scene.
    Scene: ${scene};`

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

    // Generate the image
    const stylePrompt = getStylePrompt(character.artStyle);
    const imagePrompt = `A children's book illustration in ${stylePrompt}. 
    Scene: ${sceneDescription}
    The image should be vibrant, engaging, and suitable for children, and should portray what is happening in the Scene.;
    `
    let imageUrl: string;
    console.log(imagePrompt);

    if (character.photo || character.styledImage) {
      console.log("WORKING IN THE sUBJECT REFERENCE from this IMAGE");
      console.log(character.styledImage || character.photo);
      const imageResult = await fal.subscribe("fal-ai/minimax/image-01/subject-reference", {
        input: {
          image_url: character.styledImage || character.photo,
          prompt: imagePrompt,
          num_inference_steps: 30,
          guidance_scale: 7.5,
          // strength: 0.1
        },
        logs: true,
      });

      imageUrl = imageResult.data.images[0].url;
    } else {
      const imageResult = await fal.subscribe("fal-ai/flux/dev/text-to-image", {
        input: {
          prompt: imagePrompt,
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

    // Generate video from the image only if not in debug mode
    if (!debugMode) {
      try {
        const videoResult = await fal.subscribe("fal-ai/wan-i2v", {
          input: {
            prompt: sceneDescription,
            image_url: imageUrl,
          },
          logs: true,
        });

        return NextResponse.json({ 
          videoUrl: videoResult.data.video.url,
          imageUrl: imageUrl
        });
      } catch (videoError) {
        console.error('Error generating video:', videoError);
        return NextResponse.json({ 
          imageUrl: imageUrl,
          videoUrl: null
        });
      }
    }

    // In debug mode, just return the image URL
    return NextResponse.json({ 
      imageUrl: imageUrl,
      videoUrl: null
    });
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