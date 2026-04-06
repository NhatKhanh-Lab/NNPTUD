const notificationService = require("../services/notificationService");

exports.getMyNotifications = async (req, res) => {
  const notifications = await notificationService.getMyNotifications(req.user._id);
  res.json({ success: true, data: notifications });
};

exports.markNotificationAsRead = async (req, res) => {
  const notification = await notificationService.markNotificationAsRead(req.params.id, req.user._id);
  res.json({ success: true, data: notification });
};
