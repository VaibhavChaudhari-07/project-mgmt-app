const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  getMyNotifications,
  markAsRead,
  markTabAsRead,
  deleteNotification,
  getUnreadCount,
} = require("../controllers/notification.controller");

router.get("/", auth, getMyNotifications);
router.get("/unread-count", auth, getUnreadCount);
router.put("/mark-tab-read", auth, markTabAsRead);
router.put("/:id/read", auth, markAsRead);
router.delete("/:id", auth, deleteNotification);

module.exports = router;
