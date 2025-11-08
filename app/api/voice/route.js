// app/api/voice/route.js
import { NextResponse } from 'next/server';
import { analyzeVoiceTranscript } from '@/lib/claude';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio');

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Audio file is required' },
        { status: 400 }
      );
    }

    // Check if OpenAI API key is available for Whisper
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        {
          error: 'OpenAI API key not configured',
          message: 'Please add OPENAI_API_KEY to your .env.local file for voice transcription'
        },
        { status: 500 }
      );
    }

    // Step 1: Transcribe audio using OpenAI Whisper
    const whisperFormData = new FormData();
    whisperFormData.append('file', audioFile);
    whisperFormData.append('model', 'whisper-1');

    const whisperResponse = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
      },
      body: whisperFormData,
    });

    if (!whisperResponse.ok) {
      const error = await whisperResponse.text();
      console.error('Whisper API error:', error);
      return NextResponse.json(
        { error: 'Failed to transcribe audio', details: error },
        { status: 500 }
      );
    }

    const transcriptionData = await whisperResponse.json();
    const transcript = transcriptionData.text;

    // Step 2: Analyze transcript using Claude
    const analysis = await analyzeVoiceTranscript(transcript);

    return NextResponse.json({
      success: true,
      transcript,
      analysis: {
        keywords: analysis.keywords || [],
        tone: analysis.tone || 'casual',
        sentiment: analysis.tone || 'neutral',
        summary: analysis.summary || transcript.substring(0, 100),
        actionItems: analysis.categories || [],
      },
    });
  } catch (error) {
    console.error('Voice API error:', error);
    return NextResponse.json(
      { error: 'Failed to process voice note', details: error.message },
      { status: 500 }
    );
  }
}
