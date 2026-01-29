const express = require("express");
const router = express.Router();

const {
  createComment,
  getCommentsByTicket
} = require("../controllers/comment.controller"); // adjust path if needed

router.post("/", createComment);
router.get("/:ticketId", getCommentsByTicket);

module.exports = router;
