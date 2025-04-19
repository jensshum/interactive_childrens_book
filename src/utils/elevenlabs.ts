// ElevenLabs API integration for text-to-speech

/**
 * Generates audio from text using ElevenLabs API
 * @param text The text to convert to speech
 * @param voiceId The ID of the voice to use (optional)
 * @returns A URL to the generated audio file
 */
export async function generateSpeech(text: string, voiceId?: string): Promise<string> {
  try {
    // Default to a friendly narrator voice if none provided
    const selectedVoiceId = voiceId || 'dpDWK7eq1QGTvUfhUToW'; // Default friendly narrator voice
    
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${selectedVoiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
      },
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

    // Convert the audio blob to a URL
    const audioBlob = await response.blob();
    return URL.createObjectURL(audioBlob);
  } catch (error) {
    console.error('Error generating speech with ElevenLabs:', error);
    throw error;
  }
}

/**
 * Gets a list of available voices from ElevenLabs
 * @returns An array of voice objects
 */
export async function getAvailableVoices(): Promise<any[]> {
  try {
    const response = await fetch('https://api.elevenlabs.io/v1/voices', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Filter to only include the 4 best premade voices and any cloned voices
    const voices = data.voices || [];
    const premadeVoices = voices
      .filter((voice: any) => voice.category === 'premade')
      .slice(0, 4);
    const clonedVoices = voices.filter((voice: any) => voice.category === 'cloned');
    
    return [...premadeVoices, ...clonedVoices];
  } catch (error) {
    console.error('Error fetching voices from ElevenLabs:', error);
    return [];
  }
}

/**
 * Clones a voice using ElevenLabs API
 * @param name The name for the cloned voice
 * @param audioBlob The audio blob containing the voice sample
 * @returns The ID of the cloned voice
 */
export async function cloneVoice(name: string, audioBlob: Blob): Promise<string> {
  try {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('files', audioBlob);

    const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
      method: 'POST',
      headers: {
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.voice_id;
  } catch (error) {
    console.error('Error cloning voice with ElevenLabs:', error);
    throw error;
  }
}

/**
 * Deletes a cloned voice
 * @param voiceId The ID of the voice to delete
 */
export async function deleteVoice(voiceId: string): Promise<void> {
  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/voices/${voiceId}`, {
      method: 'DELETE',
      headers: {
        'xi-api-key': import.meta.env.VITE_ELEVENLABS_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error(`ElevenLabs API error: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting voice with ElevenLabs:', error);
    throw error;
  }
} 