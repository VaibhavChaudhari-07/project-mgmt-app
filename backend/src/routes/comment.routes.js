const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createComment,
  getCommentsByTicket,
  deleteComment,
} = require("../controllers/comment.controller");

router.use(auth);

router.post("/", createComment);
router.get("/:ticketId", getCommentsByTicket);
router.delete("/:id", deleteComment);

module.exports = router;