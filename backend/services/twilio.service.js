/**
 * Twilio Service — generates TwiML XML for voice responses.
 * Works without Twilio SDK for basic TwiML generation.
 */

const generateTwiML = (message) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${escapeXml(message)}</Say>
</Response>`;
};

const generateVoicemailTwiML = (aiMessage) => {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice" language="en-US">${escapeXml(aiMessage)}</Say>
  <Say voice="alice" language="en-US">You can leave a message after the beep.</Say>
  <Record maxLength="120" action="/webhook/recording-callback" transcribe="true" playBeep="true" />
  <Say voice="alice" language="en-US">We did not receive a recording. Goodbye.</Say>
</Response>`;
};

const escapeXml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

module.exports = { generateTwiML, generateVoicemailTwiML };
