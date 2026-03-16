/**
 * Seed script — creates a demo user and sample call logs.
 * Run: node seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const CallLog = require('./models/CallLog');

const DEMO_USER = {
  name: 'Alex Johnson',
  email: 'demo@aicall.com',
  password: 'demo123',
  phone: '+1234567890',
  status: 'Busy',
  notificationsEnabled: true
};

const SAMPLE_CALLERS = [
  { name: 'Sarah Miller', number: '+1555234567' },
  { name: 'Mike Chen', number: '+1555345678' },
  { name: 'Emily Davis', number: '+1555456789' },
  { name: 'Jake Wilson', number: '+1555567890' },
  { name: 'Lisa Brown', number: '+1555678901' },
  { name: 'Tom Anderson', number: '+1555789012' },
  { name: 'Rachel Green', number: '+1555890123' },
  { name: 'Spam Caller', number: '+1800SPAM01' },
  { name: 'Unknown', number: '+1999000111' },
  { name: 'David Kim', number: '+1555901234' }
];

const STATUSES = ['Busy', 'Playing', 'Driving', 'Sleeping'];
const CALL_TYPES = ['missed', 'answered', 'voicemail', 'spam'];
const AI_RESPONSES = [
  "Hi! Alex is currently busy and can't take your call. They'll get back to you shortly.",
  "Hello! Alex is driving right now. For safety, they can't answer. Please leave a message!",
  "Hey there! Alex is resting. They'll return your call when they wake up.",
  "Alex is taking a break right now. Feel free to leave a message after the beep!",
  "Sorry, Alex is in a meeting. I'll make sure they know you called."
];
const SUMMARIES = [
  'Caller asked about project deadline',
  'Follow-up on yesterday\'s meeting',
  'Personal call — no urgent message',
  'Requesting callback about invoice',
  'Quick check-in, no message left',
  'Spam: auto-warranty scam',
  'Client wants to schedule a demo',
  'Voicemail left about dinner plans',
  'Urgent: server down notification',
  'Recruiter outreach — job opportunity'
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await User.deleteMany({});
    await CallLog.deleteMany({});

    // Create demo user
    const user = new User(DEMO_USER);
    await user.save();
    console.log(`✅ Demo user created: ${DEMO_USER.email} / ${DEMO_USER.password}`);

    // Create sample call logs (last 30 days)
    const logs = [];
    const now = Date.now();
    for (let i = 0; i < 35; i++) {
      const caller = SAMPLE_CALLERS[Math.floor(Math.random() * SAMPLE_CALLERS.length)];
      const isSpam = caller.name === 'Spam Caller';
      const callType = isSpam ? 'spam' : CALL_TYPES[Math.floor(Math.random() * 3)]; // exclude spam for normal callers
      const hasVoicemail = callType === 'voicemail';

      logs.push({
        userId: user._id,
        callerNumber: caller.number,
        callerName: caller.name,
        timestamp: new Date(now - Math.random() * 30 * 24 * 60 * 60 * 1000),
        duration: Math.floor(Math.random() * 180) + 5,
        aiResponse: AI_RESPONSES[Math.floor(Math.random() * AI_RESPONSES.length)],
        isSpam,
        callSummary: SUMMARIES[Math.floor(Math.random() * SUMMARIES.length)],
        callType,
        userStatusDuringCall: STATUSES[Math.floor(Math.random() * STATUSES.length)],
        hasVoicemail,
        transcription: hasVoicemail ? 'Hey, just wanted to check in. Call me back when you can.' : ''
      });
    }

    await CallLog.insertMany(logs);
    console.log(`✅ Created ${logs.length} sample call logs`);
    console.log('\n🎉 Seed complete! You can log in with:');
    console.log(`   Email: ${DEMO_USER.email}`);
    console.log(`   Password: ${DEMO_USER.password}`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
