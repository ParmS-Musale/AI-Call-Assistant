const express = require('express');
const CallLog = require('../models/CallLog');
const auth = require('../middleware/auth');
const router = express.Router();

// GET /api/call-logs
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 20, type, search } = req.query;
    const query = { userId: req.userId };

    if (type && type !== 'all') query.callType = type;
    if (search) {
      query.$or = [
        { callerNumber: { $regex: search, $options: 'i' } },
        { callerName: { $regex: search, $options: 'i' } },
        { callSummary: { $regex: search, $options: 'i' } }
      ];
    }

    const total = await CallLog.countDocuments(query);
    const logs = await CallLog.find(query)
      .sort({ timestamp: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// GET /api/call-logs/stats
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.userId;
    const now = new Date();
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);

    const [totalCalls, missedCalls, voicemails, spamCalls, recentCalls, dailyStats] = await Promise.all([
      CallLog.countDocuments({ userId }),
      CallLog.countDocuments({ userId, callType: 'missed' }),
      CallLog.countDocuments({ userId, hasVoicemail: true }),
      CallLog.countDocuments({ userId, isSpam: true }),
      CallLog.countDocuments({ userId, timestamp: { $gte: sevenDaysAgo } }),
      CallLog.aggregate([
        { $match: { userId: require('mongoose').Types.ObjectId.createFromHexString(userId), timestamp: { $gte: thirtyDaysAgo } } },
        { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
          count: { $sum: 1 },
          missed: { $sum: { $cond: [{ $eq: ['$callType', 'missed'] }, 1, 0] } },
          voicemail: { $sum: { $cond: [{ $eq: ['$callType', 'voicemail'] }, 1, 0] } }
        }},
        { $sort: { _id: 1 } }
      ])
    ]);

    res.json({
      totalCalls,
      missedCalls,
      voicemails,
      spamCalls,
      recentCalls,
      dailyStats
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// GET /api/call-logs/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const log = await CallLog.findOne({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ message: 'Call log not found.' });
    res.json(log);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// DELETE /api/call-logs/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const log = await CallLog.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!log) return res.status(404).json({ message: 'Call log not found.' });
    res.json({ message: 'Call log deleted.' });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
