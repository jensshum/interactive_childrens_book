// app/api/text-to-speech/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, voiceId } = await request.json();
    
    // Default to a friendly narrator voice if none provided
    console.log("VOICE ID", voiceId);
    const selectedVoiceId = voiceId || 'dPah2VEoifKnZT37774q'; // Default friendly narrator voice
    console.log("SELECTED VOICE ID", selectedVoiceId);
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: new Headers({
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY || ''
      }),
      body: JSON.stringify({
        text,
        model_id: 'eleven_monolingual_v1',
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75
        }
      })
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    // Convert the audio response to an audio blob and return it
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Cache-Control': 'public, max-age=21600' // Cache for 6 hours
      }
    });
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}