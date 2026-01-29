const Activity = require("../models/Activity");

exports.getMyActivity = async (req, res) => {
  try {
    const list = await Activity.find({ user: req.user.id })
      .populate("user", "name email")
      .populate("project", "name")
      .sort({ createdAt: -1 })
      .limit(50);

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
