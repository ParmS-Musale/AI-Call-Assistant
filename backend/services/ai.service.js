/**
 * AI Service — generates natural language call responses.
 * Uses OpenAI when OPENAI_API_KEY is set, otherwise falls back to mock responses.
 */

const generateResponse = async (userName, status, customMessage, callerNumber) => {
  const cleanMsg = customMessage ? customMessage.trim() : '';

  // If OpenAI key is configured, use the real API
  if (process.env.OPENAI_API_KEY) {
    try {
      const { default: OpenAI } = await import('openai');
      const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a polite and professional AI call assistant for ${userName}. 
                      The user is currently "${status}". 
                      Their custom message for this status is: "${cleanMsg}".
                      Generate a brief, natural-sounding voice response for an incoming call.
                      Keep it under 3 sentences. Be warm and professional.
                      If the custom message is in a language like Hindi or Marathi, generate the entire response in that language.`
          },
          {
            role: 'user',
            content: `Generate a response for a call from ${callerNumber}.`
          }
        ],
        max_tokens: 150,
        temperature: 0.7
      });

      return completion.choices[0].message.content;
    } catch (error) {
      console.error('OpenAI API error, falling back to mock:', error.message);
    }
  }

  // Mock fallback
  const mockResponses = {
    Busy: cleanMsg ? cleanMsg : `Hi there! This is ${userName}'s AI assistant. ${userName} is currently busy and can't take your call right now. Please leave a message.`,
    Playing: cleanMsg ? cleanMsg : `Hey! ${userName} is taking a break right now. Feel free to leave a message!`,
    Driving: cleanMsg ? cleanMsg : `Hello! ${userName} is driving at the moment and can't answer. Please leave a message.`,
    Sleeping: cleanMsg ? cleanMsg : `Hi! ${userName} is resting right now. You can leave a message.`,
    Available: cleanMsg ? cleanMsg : `Hello! This is ${userName}'s AI assistant. They should be available shortly.`
  };

  return mockResponses[status] || mockResponses.Busy;
};

/**
 * Transcribes audio from a URL using OpenAI Whisper.
 */
const transcribeAudio = async (audioUrl) => {
  if (!process.env.OPENAI_API_KEY) {
    return "Mock transcription: The caller mentioned they want to discuss the project deadline.";
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const axios = (await import('axios')).default;
    const fs = await import('fs');
    const path = await import('path');
    const os = await import('os');

    // Download file temporarily
    const tempPath = path.join(os.tmpdir(), `recording-${Date.now()}.mp3`);
    const response = await axios({
      method: 'get',
      url: audioUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tempPath),
      model: "whisper-1",
    });

    // Clean up
    fs.unlinkSync(tempPath);

    return transcription.text;
  } catch (error) {
    console.error('Transcription error:', error);
    return "Could not transcribe audio.";
  }
};

/**
 * Generates a short summary of the transcribed text.
 */
const generateCallSummary = async (transcription) => {
  if (!process.env.OPENAI_API_KEY) {
    return transcription.split(' ').slice(0, 10).join(' ') + "...";
  }

  try {
    const { default: OpenAI } = await import('openai');
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'Summarize the following voicemail transcription in one short sentence (under 15 words).'
        },
        {
          role: 'user',
          content: transcription
        }
      ],
      max_tokens: 50,
      temperature: 0.5
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Summary error:', error);
    return "Voicemail received.";
  }
};

module.exports = { generateResponse, transcribeAudio, generateCallSummary };
