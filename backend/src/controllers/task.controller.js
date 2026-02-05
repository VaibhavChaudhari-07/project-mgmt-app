const Task = require("../models/Task");
const Notification = require("../models/Notification");
const User = require("../models/User");
const { logActivity } = require("./activity.helper");
const { sendNotifications } = require("../helpers/notification.helper");

/**
 * Task controller with owner-based permission checks.
 */

const createTask = async (req, res) => {
  try {
    const project = await require("../models/Project")
      .findById(req.body.project)
      .populate("createdBy", "role");

    const { canPerform } = require("../helpers/permission.helper");
    if (!(await canPerform(req.user, project, "create_task"))) {
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

    // Send notifications to assignees
    if (task.assignees.length > 0) {
      const creatorUser = await User.findById(req.user.id);
      await sendNotifications(
        task.assignees,
        `Task "${task.title}" created and assigned to you by ${creatorUser.name}`,
        "task",
        "Tasks"
      );
    }

    for (const uid of task.assignees) {
      global.io?.to(uid.toString()).emit("notification", {
        message: `Task assigned: ${task.title}`,
        type: "task",
        tab: "Tasks",
      });
    }

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getTasksByProject = async (req, res) => {
  try {
    const tasks = await Task.find({ project: req.params.projectId })
        .populate("assignees", "name email")
        .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const updateTask = async (req, res) => {
  try {
    const oldTask = await Task.findById(req.params.id);
    if (!oldTask) return res.status(404).json({ message: "Task not found" });

    const project = await require("../models/Project")
      .findById(oldTask.project)
      .populate("createdBy", "role");

    const { canPerform } = require("../helpers/permission.helper");
    if (!(await canPerform(req.user, project, "edit_any_task", oldTask))) {
      return res.status(403).json({ message: "Permission denied" });
    }

    // Ensure the task creator cannot be removed from assignees
    if (req.body.assignees) {
      const createdById = oldTask.createdBy ? oldTask.createdBy.toString() : null;
      if (createdById && !req.body.assignees.map(String).includes(createdById)) {
        req.body.assignees = [...req.body.assignees.map(String), createdById];
      }
    }

    const task = await Task.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("assignees", "name email");

    // Handle assignee changes
    if (req.body.assignees) {
      const oldAssignees = (oldTask.assignees || []).map((a) => a.toString());
      const newAssignees = req.body.assignees.map((a) => a.toString());
      const addedAssignees = newAssignees.filter((a) => !oldAssignees.includes(a));
      const removedAssignees = oldAssignees.filter((a) => !newAssignees.includes(a));

      const updaterUser = await User.findById(req.user.id);

      // Notify newly assigned users
      if (addedAssignees.length > 0) {
        await sendNotifications(
          addedAssignees,
          `You were assigned to task "${task.title}" by ${updaterUser.name}`,
          "task",
          "Tasks"
        );
      }

      // Notify removed users
      if (removedAssignees.length > 0) {
        await sendNotifications(
          removedAssignees,
          `You were removed from task "${task.title}" by ${updaterUser.name}`,
          "task",
          "Tasks"
        );
      }
    }

    // Handle status changes
    if (req.body.status && oldTask.status !== req.body.status) {
      const updaterUser = await User.findById(req.user.id);
      const statusMap = {
        todo: "To Do",
        inprogress: "In Progress",
        review: "Review",
        done: "Done",
      };

      await sendNotifications(
        task.assignees.map((a) => a._id),
        `${updaterUser.name} changed status from ${statusMap[oldTask.status]} → ${statusMap[req.body.status]} on "${task.title}"`,
        "status",
        "Tasks"
      );

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

const updateTaskStatusByMember = async (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await require("../models/Project")
      .findById(task.project)
      .populate("createdBy", "role");

    const { canPerform } = require("../helpers/permission.helper");
    if (!(await canPerform(req.user, project, "change_status", task))) {
      return res.status(403).json({ message: "Permission denied" });
    }

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

const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });

    const project = await require("../models/Project")
      .findById(task.project)
      .populate("createdBy", "role");

    const { canPerform } = require("../helpers/permission.helper");
    if (!(await canPerform(req.user, project, "delete_task", task))) {
      return res.status(403).json({ message: "Permission denied" });
    }

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

const getMyTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ assignees: req.user.id })
      .populate("assignees", "name email")
      .populate("createdBy", "name role")
      .populate("project", "name")
      .sort({ priority: 1, createdAt: -1 });

    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  createTask,
  getTasksByProject,
  getMyTasks,
  updateTask,
  updateTaskStatusByMember,
  deleteTask,
};