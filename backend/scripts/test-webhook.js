const axios = require('axios');

const simulateFullFlow = async () => {
    try {
        console.log('🚀 Phase 1: Simulating Incoming Call...');
        
        // 1. Simulate Incoming Call
        // Note: Replace with a real user's "To" number from your DB if needed
        const incomingPayload = {
            From: '+1234567890',
            To: '+1234567890', // Assuming a user exists with this phone
            CallSid: 'CA' + Math.random().toString(36).substring(7)
        };

        await axios.post('http://localhost:5000/webhook/incoming-call', incomingPayload);
        console.log('✅ Phase 1 Done: Incoming call logged.');

        console.log('\n🚀 Phase 2: Simulating Recording Callback (Voicemail)...');
        
        // 2. Simulate Recording Callback
        const recordingPayload = {
            RecordingUrl: 'https://api.twilio.com/mock-audio.mp3',
            CallSid: incomingPayload.CallSid,
            RecordingSid: 'RE' + Math.random().toString(36).substring(7)
        };

        const response = await axios.post('http://localhost:5000/webhook/recording-callback', recordingPayload);
        
        console.log('✅ Phase 2 Done: Webhook processed.');
        console.log('Status:', response.status);
        console.log('\n⏳ Waiting 3 seconds for background processing (AI & Notifications)...');
        
        setTimeout(() => {
            console.log('\n✨ DONE! Check your Dashboard and Voice Messages page.');
            console.log('🔔 You should see a "New Voicemail" notification in the TopBar.');
            process.exit(0);
        }, 3000);

    } catch (error) {
        console.error('❌ Error:', error.response?.data || error.message);
        process.exit(1);
    }
};

simulateFullFlow();
