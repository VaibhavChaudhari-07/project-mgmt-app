const Notification = require("../models/Notification");

/**
 * Send notifications to multiple users
 * @param {Array} userIds - Array of user IDs to notify
 * @param {String} message - Notification message
 * @param {String} type - Notification type (project, task, status, comment, user_invitation)
 * @param {String} tab - Tab where notification appears (Project, Tasks, Comments, Project Invitation)
 */
exports.sendNotifications = async (userIds, message, type, tab) => {
  try {
    if (!userIds || userIds.length === 0) return;

    const notifications = userIds.map((userId) => ({
      user: userId,
      message,
      type,
      tab,
      read: false,
    }));

    await Notification.insertMany(notifications);
    
    // Emit via socket if available
    if (global.io) {
      userIds.forEach((userId) => {
        global.io.to(userId.toString()).emit("notification", {
          message,
          type,
          tab,
        });
      });
    }
  } catch (err) {
    console.error("Error sending notifications:", err.message);
  }
};

/**
 * Send notification to a single user
 */
exports.sendNotification = async (userId, message, type, tab) => {
  await exports.sendNotifications([userId], message, type, tab);
};
