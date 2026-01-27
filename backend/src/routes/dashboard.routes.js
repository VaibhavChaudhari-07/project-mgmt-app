const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { getSummary } = require("../controllers/dashboard.controller");

router.use(auth);
router.get("/summary", getSummary);

module.exports = router;
