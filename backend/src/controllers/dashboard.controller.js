const Project = require("../models/Project");
const Task = require("../models/Task");

exports.getSummary = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1️⃣ Get project IDs where user is a member
    const projects = await Project.find(
      { members: userId },
      { _id: 1 }
    );

    const projectIds = projects.map((p) => p._id);

    // 2️⃣ Counts
    const totalProjects = projectIds.length;

    const totalTasks = await Task.countDocuments({
      project: { $in: projectIds },
    });

    const completedTasks = await Task.countDocuments({
      project: { $in: projectIds },
      status: "done",
    });

    const pendingTasks = totalTasks - completedTasks;

    // 3️⃣ Group by status
    const byStatus = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // 4️⃣ Group by priority
    const byPriority = await Task.aggregate([
      { $match: { project: { $in: projectIds } } },
      {
        $group: {
          _id: "$priority",
          count: { $sum: 1 },
        },
      },
    ]);

    // 5️⃣ Recent tasks
    const recentTasks = await Task.find({
      project: { $in: projectIds },
    })
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