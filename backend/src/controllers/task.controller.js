const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { logActivity } = require("./activity.helper");

/* ================= CREATE TASK ================= */
const createTask = async (req, res) => {
  try {
    const task = await Task.create({
      title: req.body.title,
      priority: req.body.priority,
      status: req.body.status || "todo",
      project: req.body.project,
      assignees: req.body.assignees || [],
      createdBy: req.user.id,
    });

    const populated = await Task.findById(task._id).populate(
      "assignees",
      "name email"
    );

    await logActivity({
      user: req.user.id,
      action: `created task "${task.title}"`,
      project: task.project,
    });

    for (const uid of task.assignees) {
      await Notification.create({
        user: uid,
        message: `New task assigned: ${task.title}`,
      });

      global.io?.to(uid.toString()).emit("notification", {
        message: `New task assigned: ${task.title}`,
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET TASKS ================= */
const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
      .populate("assignees", "name email")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE TASK ================= */
const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignees", "name email");

    if (req.body.status && oldTask.status !== req.body.status) {
      await logActivity({
        user: req.user.id,
        action: `changed status of task "${task.title}" to ${task.status}`,
        project: task.project,
      });
    } else {
      await logActivity({
        user: req.user.id,
        action: `updated task "${task.title}"`,
        project: task.project,
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TASK ================= */
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    await Task.findByIdAndDelete(req.params.id);

    if (task) {
      await logActivity({
        user: req.user.id,
        action: `deleted task "${task.title}"`,
        project: task.project,
      });
    }

    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
};