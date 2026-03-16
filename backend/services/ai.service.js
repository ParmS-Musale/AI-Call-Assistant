/**
 * AI Service — generates natural language call responses.
 * Uses OpenAI when OPENAI_API_KEY is set, otherwise falls back to mock responses.
 */

const generateResponse = async (userName, status, customMessage, callerNumber) => {
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
                      Their custom message for this status is: "${customMessage}".
                      Generate a brief, natural-sounding voice response for an incoming call.
                      Keep it under 3 sentences. Be warm and professional.`
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
    Busy: `Hi there! This is ${userName}'s AI assistant. ${userName} is currently busy and can't take your call right now. ${customMessage ? customMessage : 'Please leave a message after the tone and they will get back to you as soon as possible.'}`,
    Playing: `Hey! ${userName} is taking a break right now. ${customMessage ? customMessage : "They'll return your call soon. Feel free to leave a message!"}`,
    Driving: `Hello! ${userName} is driving at the moment and can't answer the phone for safety reasons. ${customMessage ? customMessage : "They'll call you back when they've safely stopped. Please leave a message."}`,
    Sleeping: `Hi! ${userName} is resting right now. ${customMessage ? customMessage : "They'll get back to you when they wake up. You can leave a message after the tone."}`,
    Available: `Hello! This is ${userName}'s AI assistant. They should be available shortly. Please hold on.`
  };

  return mockResponses[status] || mockResponses.Busy;
};

module.exports = { generateResponse };
