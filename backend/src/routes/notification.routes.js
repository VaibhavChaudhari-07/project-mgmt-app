const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  getMyNotifications,
  markRead,
} = require("../controllers/notification.controller");

router.get("/", auth, getMyNotifications);
router.put("/read", auth, markRead);
router.get("/unread-count", auth, require("../controllers/notification.controller").getUnreadCount);

module.exports = router;
