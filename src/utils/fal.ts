import { fal } from "@fal-ai/client";
import { generateStoryContent, generateImageDescription } from './chatgpt';

fal.config({
  credentials: import.meta.env.VITE_OPENAI_API_KEY,
});

export { generateStoryContent, generateImageDescription };

export async function generateStoryImage(
  character: { name: string; gender: string; photo?: string; artStyle?: string },
  scene: string,
  pageNumber: number
): Promise<string> {
  try {
    const stylePrompt = getStylePrompt(character.artStyle);
    const sceneDescription = await generateImageDescription(scene);
    // Create the prompt for the image generation
    const imagePrompt = `A children's book illustration in ${stylePrompt}. 
    Scene: ${sceneDescription}
    The image should be vibrant, engaging, and suitable for children, and should portray what is happening in the Scene.`;
    
    // Generate the initial image
    let imageUrl: string;
    
    // If there's a reference photo, use image-to-image, otherwise use text-to-image
    if (character.photo) {
      console.log("Generating image from reference photo...");
      const imageResult = await fal.subscribe("fal-ai/flux/dev/image-to-image", {
        input: {
          image_url: character.photo,
          prompt: imagePrompt,
          // Optional parameters
          num_inference_steps: 30,
          guidance_scale: 7.5,
          strength: 0.90  // How much to preserve of the original image (lower = more preservation)
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generating image...", update.status);
          }
        },
      });
      
      imageUrl = imageResult.data.images[0].url;
    } else {
      // If no reference photo is available, use text-to-image
      console.log("Generating image from text prompt...");
      const imageResult = await fal.subscribe("fal-ai/flux/dev/text-to-image", {
        input: {
          prompt: imagePrompt,
          // Optional parameters
          num_inference_steps: 30,
          guidance_scale: 7.5,
          width: 768,
          height: 512,
          seed: pageNumber * 1000  // Using page number as seed for consistency
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            console.log("Generating image...", update.status);
          }
        },
      });
      
      imageUrl = imageResult.data.images[0].url;
    }
    
    console.log(imageUrl);
    // Now that we have the image, generate a video from it
    try {
      console.log("Generating video from the generated image...");
      const videoResult = await fal.subscribe("fal-ai/wan-i2v", {
        input: {
          prompt: sceneDescription,
          image_url: imageUrl,
          // No end_image_url needed as per requirements
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            update.logs.map((log) => log.message).forEach(console.log);
          }
        },
      });
      
      console.log("Video generated successfully:", videoResult.requestId);
      return videoResult.data.video.url;
    } catch (videoError) {
      console.error('Error generating video with fal.ai:', videoError);
      // Fall back to using the image if video generation fails
      return imageUrl;
    }
  } catch (error) {
    console.error('Error generating image with fal.ai:', error);
    // Fallback to Unsplash if image generation fails
    return `https://source.unsplash.com/random/800x600?children,storybook&sig=${pageNumber}`;
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