import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { GoogleGenAI, Modality } from "@google/genai";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize the Gemini client
const gemini = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY
});

export async function POST(request: Request) {
  try {
    const { character, scene, pageNumber, debugMode } = await request.json();

    // First, generate the image description
    const imageDescriptionPrompt = `Describe what is happening in the Scene in extremely simple terms. Your description should be able to be used to generate an image of the scene.
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
    console.log("SCENE DESCRIPTION", sceneDescription);

    // Generate the image using Gemini
    const stylePrompt = getStylePrompt(character.artStyle);
    const imagePrompt = `A children's book illustration in ${stylePrompt}. 
    Scene: ${sceneDescription}
    The image should be vibrant, engaging, and suitable for children, and should portray what is happening in the Scene.`;

    console.log("Image prompt:", imagePrompt);
    
    let imageBase64: string;
    let imageUrl: string;
    
    // Add seed for consistent generation across runs with same page number
    const seed = pageNumber * 1000;
    
    // If we have a reference image, use it as a style reference
    if (character.photo || character.styledImage) {
      console.log("Using subject reference from image:", character.styledImage || character.photo);
      
      // Fetch the reference image and convert to base64
      const referenceImageUrl = character.styledImage || character.photo;
      const referenceImageBase64 = await fetchImageAsBase64(referenceImageUrl);
      
      // Prepare the content parts with the reference image
      const contents = [
        { text: `${imagePrompt} Base the style and character appearance on the reference image.` },
        {
          inlineData: {
            mimeType: getMimeType(referenceImageUrl),
            data: referenceImageBase64,
          },
        },
      ];
      
      // Call Gemini image generation model
      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          generationConfig: {
            seed: seed,
          }
        },
      });
      
      // Extract the image from the response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    } else {
      // Generate without a reference image
      const contents = [
        { text: imagePrompt }
      ];
      
      const response = await gemini.models.generateContent({
        model: "gemini-2.0-flash-preview-image-generation",
        contents: contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
          generationConfig: {
            seed: seed,
          }
        },
      });
      
      // Extract the image from the response
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          imageBase64 = part.inlineData.data;
          break;
        }
      }
    }
    
    // Upload the image to AWS S3
    const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
    
    // Configure S3 client
    const s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      }
    });
    
    // Set up the file details
    const bucketName = process.env.AWS_S3_BUCKET_NAME;
    const fileName = `images/page-${pageNumber}-${Date.now()}.png`;
    const buffer = Buffer.from(imageBase64, 'base64');
    
    // Upload to S3
    try {
      const uploadParams = {
        Bucket: bucketName,
        Key: fileName,
        Body: buffer,
        ContentType: 'image/png',
        // Remove ACL parameter - not needed and might cause errors if bucket has ACLs disabled
      };
      
      await s3Client.send(new PutObjectCommand(uploadParams));
      
      // Generate URL for the saved image
      imageUrl = `https://${bucketName}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${fileName}`;
      
      // Alternative for more complex setups, using CloudFront or custom domain:
      // imageUrl = `${process.env.S3_DOMAIN_PREFIX}/${fileName}`;
    } catch (s3Error) {
      console.error('Error uploading to S3:', s3Error);
      throw new Error(`Failed to upload image to S3: ${s3Error.message}`);
    }

    // Return just the image URL in debug mode
    if (debugMode) {
      return NextResponse.json({ 
        imageUrl: imageUrl,
        videoUrl: null
      });
    }

    // If not in debug mode, you might want to generate a video
    // This is a placeholder - you'll need to implement video generation
    try {
      // Example placeholder for video generation
      // In a real implementation, you'd call a video generation service
      const videoUrl = null; // Replace with actual video generation
      
      return NextResponse.json({ 
        imageUrl: imageUrl,
        videoUrl: videoUrl
      });
    } catch (videoError) {
      console.error('Error generating video:', videoError);
      return NextResponse.json({ 
        imageUrl: imageUrl,
        videoUrl: null
      });
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return NextResponse.json(
      { error: 'Failed to generate image' },
      { status: 500 }
    );
  }
}

// Helper function to fetch an image and convert it to base64
async function fetchImageAsBase64(imageUrl: string): Promise<string> {
  const response = await fetch(imageUrl);
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  return buffer.toString('base64');
}

// Helper function to determine MIME type from URL
function getMimeType(url: string): string {
  const extension = url.split('.').pop()?.toLowerCase();
  switch (extension) {
    case 'png':
      return 'image/png';
    case 'jpg':
    case 'jpeg':
      return 'image/jpeg';
    case 'gif':
      return 'image/gif';
    case 'webp':
      return 'image/webp';
    default:
      return 'image/jpeg'; // Default
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