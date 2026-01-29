const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { logActivity } = require("./activity.helper");

/* ================= PERMISSION HELPERS ================= */

const canCreateComment = (role) =>
  role === "admin" || role === "pm" || role === "member";

const canDeleteComment = (role, isOwner) =>
  role === "admin" || isOwner;

/* ================= CREATE COMMENT ================= */

exports.createComment = async (req, res) => {
  try {
    if (!canCreateComment(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { ticketId, text } = req.body;

    if (!text?.trim()) {
      return res.status(400).json({ message: "Comment text required" });
    }

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user.id,
      text,
    });

    const populated = await Comment.findById(comment._id).populate(
      "user",
      "name email"
    );

    const task = await Task.findById(ticketId);

    if (task) {
      await logActivity({
        user: req.user.id,
        action: `you commented on task "${task.title}"`,
        project: task.project,
      });

      for (const uid of task.assignees) {
        await Notification.create({
          user: uid,
          message: `New comment on task "${task.title}"`,
        });

        global.io?.to(uid.toString()).emit("notification");
      }
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET COMMENTS ================= */

exports.getCommentsByTicket = async (req, res) => {
  try {
    const comments = await Comment.find({
      ticket: req.params.ticketId,
    })
      .populate("user", "name email")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE COMMENT ================= */

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    const isOwner = comment.user.toString() === req.user.id.toString();

    if (!canDeleteComment(req.user.role, isOwner)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    await Comment.findByIdAndDelete(comment._id);

    const task = await Task.findById(comment.ticket);

    if (task) {
      await logActivity({
        user: req.user.id,
        action: `you deleted a comment on task "${task.title}"`,
        project: task.project,
      });
    }

    res.json({ message: "Comment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};