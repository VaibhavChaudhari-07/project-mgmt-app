const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createComment,
  getCommentsByTicket,
} = require("../controllers/comment.controller");

router.use(auth);

router.post("/", createComment);
router.get("/ticket/:ticketId", getCommentsByTicket);

module.exports = router;
