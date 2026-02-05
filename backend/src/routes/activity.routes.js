const router = require("express").Router();
const auth = require("../middleware/auth.middleware");
const { getMyActivity } = require("../controllers/activity.controller");

router.use(auth);

router.get("/", getMyActivity);

module.exports = router;
