const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    const totalProjects = await Project.countDocuments({
      members: userId,
    });

    const totalTasks = await Task.countDocuments({
      createdBy: userId,
    });

    const completedTasks = await Task.countDocuments({
      createdBy: userId,
      status: "done",
    });

    const pendingTasks = totalTasks - completedTasks;

    const byStatus = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);

    const byPriority = await Task.aggregate([
      { $match: { createdBy: req.user._id } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    const recentTasks = await Task.find({ createdBy: userId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      byStatus,
      byPriority,
      recentTasks,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
