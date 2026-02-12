import { NextRequest, NextResponse } from 'next/server';

const ELEVENLABS_API_KEY = process.env.ELEVENLABS_API_KEY || 'sk_96f201261a9b6a7fbd7dd9468f729faa49664ff534ecda13';

export async function POST(request: NextRequest) {
  try {
    const { voiceId, text, stability = 0.5, similarity = 0.75 } = await request.json();
    
    if (!voiceId || !text) {
      return NextResponse.json({ error: 'Missing voiceId or text' }, { status: 400 });
    }
    
    // Call ElevenLabs API
    const response = await fetch(
      `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
      {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability,
            similarity_boost: similarity,
            style: 0.5,
            use_speaker_boost: true,
          },
        }),
      }
    );
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('ElevenLabs error:', errorData);
      return NextResponse.json(
        { error: errorData?.detail?.message || 'Generation failed' },
        { status: response.status }
      );
    }
    
    // Stream the audio back
    const audioBuffer = await response.arrayBuffer();
    
    return new NextResponse(audioBuffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': audioBuffer.byteLength.toString(),
      },
    });
  } catch (error) {
    console.error('Voice generation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
