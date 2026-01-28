const Comment = require("../models/Comment");

exports.createComment = async (req, res) => {
  try {
    const { ticketId, text } = req.body;

    const comment = await Comment.create({
      ticket: ticketId,
      user: req.user.id,
      text,
    });

    const populated = await Comment.findById(comment._id).populate(
      "user",
      "name email"
    );

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
