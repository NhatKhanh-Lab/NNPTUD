const Notification = require("../models/Notification");

const createNotification = async (payload, session = null) => {
  if (session) {
    const records = await Notification.create([payload], { session });
    return records[0];
  }

  return Notification.create(payload);
};

const findNotificationsByUser = (userId) => Notification.find({ user: userId }).sort({ createdAt: -1 });

const markAsReadForUser = (notificationId, userId) =>
  Notification.findOneAndUpdate({ _id: notificationId, user: userId }, { isRead: true }, { new: true });

module.exports = {
  createNotification,
  findNotificationsByUser,
  markAsReadForUser
};
