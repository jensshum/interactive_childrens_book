import { NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { character, prompt } = await request.json();

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

    return NextResponse.json({ 
      content: response.choices[0].message.content || '' 
    });
  } catch (error) {
    console.error('Error generating story:', error);
    return NextResponse.json(
      { error: 'Failed to generate story' },
      { status: 500 }
    );
  }
} 