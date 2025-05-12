// app/api/voices/route.ts
import { NextResponse } from 'next/server';

interface Voice {
  voice_id: string;
  name: string;
  category: 'premade' | 'cloned';
  preview_url?: string;
  labels?: Record<string, string>;
}

export async function GET() {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    
    // Filter to only include the 4 best premade voices and any cloned voices
    const voices = (data.voices || []) as Voice[];
    const premadeVoices = voices
      .filter((voice) => voice.category === 'premade')
      .slice(0, 4);
    const clonedVoices = voices.filter((voice) => voice.category === 'cloned');
    
    return NextResponse.json({
      voices: [...premadeVoices, ...clonedVoices]
    });
  } catch (error) {
    console.error('Error fetching voices from ElevenLabs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch voices', voices: [] },
      { status: 500 }
    );
  }
}