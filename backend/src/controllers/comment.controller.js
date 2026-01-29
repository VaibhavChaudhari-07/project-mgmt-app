const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { logActivity } = require("./activity.helper");

exports.createComment = async (req, res) => {
  try {
    const { ticketId, text } = req.body;

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user.id,
      text,
    });

    const populated = await Comment.findById(comment._id).populate("user", "name email");

    const task = await Task.findById(ticketId);

    if (task) {
      await logActivity({
        user: req.user.id,
        action: `commented on task "${task.title}"`,
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
