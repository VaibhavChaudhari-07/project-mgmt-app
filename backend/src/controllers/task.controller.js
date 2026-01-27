const Task = require("../models/Task");

exports.createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      priority: req.body.priority,
      status: req.body.status || "todo",
      project: req.body.project,
      assignees: req.body.assignees || [],   // ✅ MULTI ASSIGNEE
      createdBy: req.user.id,
    });

    const populated = await Task.findById(task._id)
      .populate("assignees", "name email");

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignees", "name email")   // ✅ MULTI ASSIGNEE
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateTask = async (req, res) => {
  try {
    const updateData = {};

    if (req.body.title !== undefined) updateData.title = req.body.title;
    if (req.body.priority !== undefined) updateData.priority = req.body.priority;
    if (req.body.status !== undefined) updateData.status = req.body.status;
    if (req.body.assignees !== undefined) updateData.assignees = req.body.assignees;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate("assignees", "name email");

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.deleteTask = async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
