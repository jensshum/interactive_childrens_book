// utils/elevenlabs.ts

/**
 * Generates audio from text using ElevenLabs API via our backend route
 * @param text The text to convert to speech
 * @param voiceId The ID of the voice to use (optional)
 * @returns A URL to the generated audio file
 */
export async function generateSpeech(text: string, voiceId?: string): Promise<string> {
  try {
    const response = await fetch('/api/voice/text-to-speech', {
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
    const response = await fetch('/api/voice/voices', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text(); // Get raw response text
      throw new Error(`API error: ${response.status} ${response.statusText}\nResponse body: ${errorText}`);
    }

    const text = await response.text(); // Get raw response text first
    // console.log('Raw response:', text); // Log raw response for debugging
    try {
      const data = JSON.parse(text); // Attempt to parse as JSON
      return data.voices || [];
    } catch (jsonError: unknown) {
      const error = jsonError as Error;
      throw new Error(`Failed to parse JSON: ${error.message}\nRaw response: ${text}`);
    }
  } catch (error) {
    console.error('Error fetching voices:', error); // Log full error
    return [];
  }
}

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