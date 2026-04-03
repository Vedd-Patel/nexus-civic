import axios from 'axios';
import logger from './logger';

export const transcribeAudio = async (audioBase64: string): Promise<{ transcript: string; language: string }> => {
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const buffer = Buffer.from(audioBase64, 'base64');
      const blob = new Blob([buffer], { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('file', blob, 'audio.mp3');

      const response = await axios.post('https://api.elevenlabs.io/v1/speech-to-text', formData, {
        headers: {
          'xi-api-key': process.env.ELEVENLABS_API_KEY,
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        transcript: response.data.text || '[Transcription returned empty]',
        language: 'en',
      };
    } catch (error) {
      logger.error('ElevenLabs STT error:', error);
      return { transcript: '[Voice transcription failed]', language: 'en' };
    }
  }

  return { transcript: '[Voice unavailable]', language: 'en' };
};

export const generateSpeech = async (text: string): Promise<Buffer | null> => {
  if (process.env.ELEVENLABS_API_KEY) {
    try {
      const response = await axios.post(
        'https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', // Example voice ID (Rachel)
        {
          text,
          model_id: 'eleven_monolingual_v1',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5,
          },
        },
        {
          headers: {
            'xi-api-key': process.env.ELEVENLABS_API_KEY,
            'Content-Type': 'application/json',
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(response.data);
    } catch (error) {
      logger.error('ElevenLabs TTS error:', error);
      return null;
    }
  }

  return null;
};
