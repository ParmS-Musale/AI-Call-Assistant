const mongoose = require('mongoose');

const callLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  callerNumber: { type: String, required: true },
  callerName: { type: String, default: 'Unknown' },
  timestamp: { type: Date, default: Date.now },
  duration: { type: Number, default: 0 }, // seconds
  aiResponse: { type: String, default: '' },
  audioRecordingUrl: { type: String, default: '' },
  isSpam: { type: Boolean, default: false },
  callSummary: { type: String, default: '' },
  callType: {
    type: String,
    enum: ['missed', 'answered', 'voicemail', 'spam'],
    default: 'missed'
  },
  userStatusDuringCall: {
    type: String,
    enum: ['Available', 'Busy', 'Playing', 'Driving', 'Sleeping'],
    default: 'Busy'
  },
  hasVoicemail: { type: Boolean, default: false },
  transcription: { type: String, default: '' }
}, { timestamps: true });

callLogSchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model('CallLog', callLogSchema);
