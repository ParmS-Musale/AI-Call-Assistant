const axios = require('axios');
require('dotenv').config();

const simulateFullFlow = async () => {
    try {
        console.log('🚀 Phase 1: Simulating Incoming Call...');
        
        // Use the Twilio number from .env as the "To" number
        const toPhoneNumber = process.env.TWILIO_PHONE_NUMBER || '+1234567890';
        
        const incomingPayload = {
            From: '+15559998888', // Fake caller
            To: toPhoneNumber,
            CallSid: 'CA' + Math.random().toString(36).substring(7)
        };

        console.log(`📡 Sending request to backend (Target: ${toPhoneNumber})...`);
        const response1 = await axios.post('http://localhost:5000/webhook/incoming-call', incomingPayload);
        
        console.log('✅ Phase 1 Done: Webhook processed.');
        console.log('\n--- TwiML Response from Backend ---');
        console.log(response1.data);
        console.log('------------------------------------\n');

        if (response1.data.includes('The number you have called is not available')) {
            console.log('⚠️  WARNING: Backend did not find a user with this phone number in the Database.');
            console.log('👉 Tip: Go to Settings in the Dashboard and make sure your Phone Number matches the one in .env');
        } else {
            console.log('🎉 SUCCESS! The AI generated a response.');
        }

        console.log('\n🚀 Phase 2: Simulating Recording Callback (Voicemail)...');
        
        const recordingPayload = {
            RecordingUrl: 'https://api.twilio.com/mock-audio.mp3',
            CallSid: incomingPayload.CallSid,
            RecordingSid: 'RE' + Math.random().toString(36).substring(7)
        };

        const response2 = await axios.post('http://localhost:5000/webhook/recording-callback', recordingPayload);
        
        console.log('✅ Phase 2 Done: Recording logged.');
        console.log('Status:', response2.status);
        console.log('\n✨ ALL STEPS COMPLETE! Check your Dashboard to see the new log entry.');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        console.log('Tip: Make sure your backend server is running (node server.js)');
        process.exit(1);
    }
};

simulateFullFlow();
