const ApiError = require("../utils/ApiError");
const { getSocketServer } = require("../config/socket");
const notificationRepository = require("../repositories/notificationRepository");

const buildNotificationEvent = ({ userId, title, message, type = "system" }) => ({
  userId,
  title,
  message,
  type
});

const emitRealtimeNotification = (notification) => {
  const io = getSocketServer();
  if (!io) {
    return;
  }

  io.to(`user:${notification.user}`).emit("notification:new", notification);
};

const createNotification = async (payload, session = null) => {
  const notification = await notificationRepository.createNotification(
    {
      user: payload.userId,
      title: payload.title,
      message: payload.message,
      type: payload.type || "system"
    },
    session
  );

  return notification;
};

const dispatchNotifications = async (events = []) => {
  const createdNotifications = [];

  for (const event of events) {
    const notification = await createNotification(event);
    emitRealtimeNotification(notification);
    createdNotifications.push(notification);
  }

  return createdNotifications;
};

const getMyNotifications = (userId) => notificationRepository.findNotificationsByUser(userId);

const markNotificationAsRead = async (notificationId, userId) => {
  const notification = await notificationRepository.markAsReadForUser(notificationId, userId);
  if (!notification) {
    throw new ApiError(404, "Khong tim thay thong bao");
  }

  return notification;
};

module.exports = {
  buildNotificationEvent,
  createNotification,
  dispatchNotifications,
  getMyNotifications,
  markNotificationAsRead
};
