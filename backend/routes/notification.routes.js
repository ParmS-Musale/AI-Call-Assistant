const express = require('express');
const auth = require('../middleware/auth');
const {
  getUserNotifications,
  getUnreadCount,
  markAsRead
} = require('../services/notification.service');
const router = express.Router();

// GET /api/notifications
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const notifications = await getUserNotifications(req.userId, parseInt(limit));
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const count = await getUnreadCount(req.userId);
    res.json({ count });
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', auth, async (req, res) => {
  try {
    const notification = await markAsRead(req.params.id);
    if (!notification) return res.status(404).json({ message: 'Notification not found.' });
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Server error.', error: error.message });
  }
});

module.exports = router;
