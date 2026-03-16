/**
 * Notification Service — in-app notification storage.
 * Extensible to email/push notifications later.
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  message: { type: String, required: true },
  type: { type: String, enum: ['call', 'voicemail', 'spam', 'system'], default: 'system' },
  read: { type: Boolean, default: false },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
}, { timestamps: true });

const Notification = mongoose.model('Notification', notificationSchema);

const createNotification = async (userId, title, message, type = 'system', metadata = {}) => {
  return Notification.create({ userId, title, message, type, metadata });
};

const getUserNotifications = async (userId, limit = 20) => {
  return Notification.find({ userId }).sort({ createdAt: -1 }).limit(limit);
};

const markAsRead = async (notificationId) => {
  return Notification.findByIdAndUpdate(notificationId, { read: true }, { new: true });
};

const getUnreadCount = async (userId) => {
  return Notification.countDocuments({ userId, read: false });
};

module.exports = { createNotification, getUserNotifications, markAsRead, getUnreadCount, Notification };
