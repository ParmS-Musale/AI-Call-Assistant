const express = require('express');
const User = require('../models/User');
const CallLog = require('../models/CallLog');
const { generateResponse } = require('../services/ai.service');
const { generateTwiML, generateVoicemailTwiML } = require('../services/twilio.service');
const router = express.Router();

// POST /webhook/incoming-call — Twilio voice webhook
router.post('/incoming-call', async (req, res) => {
  try {
    const { From: callerNumber, To: calledNumber, CallSid: callSid } = req.body;

    // Find user by phone number
    const user = await User.findOne({ phone: calledNumber });

    if (!user) {
      // No user found — return a generic message
      const twiml = generateTwiML('The number you have called is not available. Please try again later.');
      return res.type('text/xml').send(twiml);
    }

    if (user.status === 'Available') {
      // User is available — let the call ring through (or forward)
      const twiml = generateTwiML('The person you are calling is available. Please hold while we connect you.');
      return res.type('text/xml').send(twiml);
    }

    // User is unavailable — generate AI response
    const customMessage = user.customMessages.get(user.status) || '';
    const aiResponse = await generateResponse(user.name, user.status, customMessage, callerNumber);

    // Log the call
    await CallLog.create({
      userId: user._id,
      callerNumber: callerNumber || 'Unknown',
      callerName: 'Caller',
      aiResponse,
      callType: 'answered',
      userStatusDuringCall: user.status
    });

    // Return TwiML with AI response + voicemail prompt
    const twiml = generateVoicemailTwiML(aiResponse);
    res.type('text/xml').send(twiml);
  } catch (error) {
    console.error('Webhook error:', error);
    const twiml = generateTwiML('Sorry, we are experiencing technical difficulties. Please try again later.');
    res.type('text/xml').send(twiml);
  }
});

// POST /webhook/recording-callback
router.post('/recording-callback', async (req, res) => {
  try {
    const { RecordingUrl, RecordingSid, CallSid } = req.body;

    // Find the most recent call log without a recording and update it
    const log = await CallLog.findOneAndUpdate(
      { audioRecordingUrl: '', callType: 'answered' },
      {
        audioRecordingUrl: RecordingUrl || '',
        hasVoicemail: true,
        callType: 'voicemail'
      },
      { sort: { timestamp: -1 }, new: true }
    );

    res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('Recording callback error:', error);
    res.status(200).send('<Response></Response>');
  }
});

// POST /webhook/status-callback
router.post('/status-callback', async (req, res) => {
  try {
    const { CallSid, CallStatus, CallDuration } = req.body;

    if (CallStatus === 'completed' && CallDuration) {
      await CallLog.findOneAndUpdate(
        { createdAt: { $gte: new Date(Date.now() - 60000) } },
        { duration: parseInt(CallDuration) },
        { sort: { timestamp: -1 } }
      );
    }

    res.status(200).send('<Response></Response>');
  } catch (error) {
    console.error('Status callback error:', error);
    res.status(200).send('<Response></Response>');
  }
});

module.exports = router;
