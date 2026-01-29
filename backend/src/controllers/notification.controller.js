const Notification = require("../models/Notification");

exports.getMyNotifications = async (req, res) => {
  const list = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
  res.json(list);
};

exports.markRead = async (req, res) => {
  await Notification.updateMany(
    { user: req.user.id, read: false },
    { $set: { read: true } }
  );
  res.json({ success: true });
};

exports.getUnreadCount = async (req, res) => {
  const count = await Notification.countDocuments({
    user: req.user.id,
    read: false,
  });
  res.json({ count });
};
