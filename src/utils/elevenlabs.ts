// utils/elevenlabs.ts

/**
 * Generates audio from text using ElevenLabs API via our backend route
 * @param text The text to convert to speech
 * @param voiceId The ID of the voice to use (optional)
 * @returns A URL to the generated audio file
 */
export async function generateSpeech(text: string, voiceId?: string): Promise<string> {
  try {
    const response = await fetch('/api/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text, voiceId })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    // Convert the audio blob to a URL
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech:', error);
    throw error;
  }
}

/**
 * Gets a list of available voices from ElevenLabs
 * @returns An array of voice objects
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    const response = await fetch('/api/voices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voices || [];
  } catch (error) {
    console.error('Error fetching voices:', error);
    return [];
  }
}