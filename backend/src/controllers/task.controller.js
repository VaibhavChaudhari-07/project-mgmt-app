const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { logActivity } = require("./activity.helper");

/* ================= PERMISSION HELPERS ================= */

const canCreateTask = (role) => role === "admin" || role === "pm";
const canUpdateTask = (role) => role === "admin" || role === "pm";
const canDeleteTask = (role) => role === "admin";
const canUpdateStatusOnly = (role) => role === "member";

/* ================= CREATE TASK ================= */
const createTask = async (req, res) => {
  try {
    if (!canCreateTask(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

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
      action: `you created task "${task.title}"`,
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

/* ================= UPDATE TASK (ADMIN / PM) ================= */
const updateTask = async (req, res) => {
  try {
    if (!canUpdateTask(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignees", "name email");

    if (req.body.status && oldTask.status !== req.body.status) {
      await logActivity({
        user: req.user.id,
        action: `you changed status of task "${task.title}" to ${task.status}`,
        project: task.project,
      });
    } else {
      await logActivity({
        user: req.user.id,
        action: `you updated task "${task.title}"`,
        project: task.project,
      });
    }

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE STATUS (MEMBER ONLY) ================= */
const updateTaskStatusByMember = async (req, res) => {
  try {
    if (!canUpdateStatusOnly(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const oldStatus = task.status;
    task.status = status;
    await task.save();

    await logActivity({
      user: req.user.id,
      action: `you changed status of task "${task.title}" from ${oldStatus} to ${status}`,
      project: task.project,
    });

    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE TASK ================= */
const deleteTask = async (req, res) => {
  try {
    if (!canDeleteTask(req.user.role)) {
      return res.status(403).json({ message: "Only admin can delete tasks" });
    }

    const task = await Task.findById(req.params.id);

    await Task.findByIdAndDelete(req.params.id);

    if (task) {
      await logActivity({
        user: req.user.id,
        action: `you deleted task "${task.title}"`,
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
  updateTaskStatusByMember,
  deleteTask,
};