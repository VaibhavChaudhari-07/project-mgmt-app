const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const {
  getMyNotifications,
  markRead,
} = require("../controllers/notification.controller");

router.use(auth);

router.get("/", getMyNotifications);
router.put("/read", markRead);

module.exports = router;
