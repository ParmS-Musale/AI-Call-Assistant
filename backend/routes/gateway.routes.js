const express = require('express');
const router = express.Router();
const User = require('../models/User');
const CallLog = require('../models/CallLog');
const { generateResponse } = require('../services/ai.service');

// POST /api/gateway/incoming-call
// Triggered by Android Automation (e.g., MacroDroid) when a call is received
router.post('/incoming-call', async (req, res) => {
  try {
    const { callerNumber, userId } = req.body;
    
    // Find user by ID if provided, otherwise fallback to the first user
    let user;
    if (userId) {
      user = await User.findById(userId);
    } else {
      user = await User.findOne();
    }

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const customMessage = user.customMessages.get(user.status) || '';
    
    // Generate AI response specifically for SMS
    let aiResponse = await generateResponse(user.name, user.status, customMessage, callerNumber);
    
    // Shorten it for SMS if it's too long
    if (aiResponse.length > 160) {
      aiResponse = aiResponse.substring(0, 157) + '...';
    }

    // Log the event as an 'SMS Reply' call type
    await CallLog.create({
      userId: user._id,
      callerNumber: callerNumber || 'Unknown',
      callerName: 'Call (Auto-SMS)',
      aiResponse,
      callType: 'answered', // Or create a new type if preferred
      userStatusDuringCall: user.status
    });

    // Return ONLY the message text for MacroDroid to send as SMS
    res.send(aiResponse);

  } catch (error) {
    console.error('Gateway Error:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
});

module.exports = router;
