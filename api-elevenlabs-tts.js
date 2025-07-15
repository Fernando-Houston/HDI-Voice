// Next.js API Route: /pages/api/elevenlabs-tts.js
// This keeps your API key secure on the server side

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { 
    text, 
    voiceId = 'Z3R5wn05IrDiVCyEkUrK', // Your provided voice ID as default
    modelId = 'eleven_monolingual_v1',
    voiceSettings = {
      stability: 0.5,
      similarity_boost: 0.5,
      style: 0.0,
      use_speaker_boost: true
    }
  } = req.body;

  if (!text) {
    return res.status(400).json({ message: 'Text is required' });
  }

  try {
    const response = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: 'POST',
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': process.env.ELEVENLABS_API_KEY
      },
      body: JSON.stringify({
        text: text,
        model_id: modelId,
        voice_settings: voiceSettings
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('ElevenLabs API error:', response.status, errorData);
      
      // Handle specific error cases
      if (response.status === 401) {
        return res.status(401).json({ message: 'Invalid API key' });
      } else if (response.status === 429) {
        return res.status(429).json({ message: 'Rate limit exceeded. Please try again later.' });
      } else if (response.status === 422) {
        return res.status(422).json({ message: 'Invalid voice ID or text format' });
      }
      
      throw new Error(`ElevenLabs API error: ${response.status}`);
    }

    const audioBuffer = await response.arrayBuffer();
    
    // Set appropriate headers for audio streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', audioBuffer.byteLength);
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    
    res.send(Buffer.from(audioBuffer));
  } catch (error) {
    console.error('ElevenLabs TTS error:', error);
    res.status(500).json({ 
      message: 'Voice generation failed', 
      error: error.message 
    });
  }
}