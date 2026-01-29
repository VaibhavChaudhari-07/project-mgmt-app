const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("./activity.helper");

/* ================= PERMISSION HELPERS ================= */

const canManageProject = (role) => role === "admin" || role === "pm";
const canDeleteProject = (role) => role === "admin";

/* ================= CREATE PROJECT ================= */
exports.createProject = async (req, res) => {
  try {
    if (!canManageProject(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    await logActivity({
      user: req.user.id,
      action: `you created project "${name}"`,
      project: project._id,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= GET PROJECTS ================= */
exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      members: req.user.id,
    })
      .populate("members", "name email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE PROJECT ================= */
exports.updateProject = async (req, res) => {
  try {
    if (!canManageProject(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    await logActivity({
      user: req.user.id,
      action: `you updated project "${project.name}"`,
      project: project._id,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= DELETE PROJECT ================= */
exports.deleteProject = async (req, res) => {
  try {
    if (!canDeleteProject(req.user.role)) {
      return res.status(403).json({ message: "Only admin can delete projects" });
    }

    const project = await Project.findById(req.params.id);

    await Task.deleteMany({ project: project._id });
    await Project.findByIdAndDelete(project._id);

    await logActivity({
      user: req.user.id,
      action: `you deleted project "${project.name}"`,
      project: project._id,
    });

    res.json({ message: "Project and related tasks deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= ADD MEMBER ================= */
exports.addMember = async (req, res) => {
  try {
    if (!canManageProject(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await Project.findById(req.params.id);

    if (project.members.includes(user._id))
      return res.status(400).json({ message: "User already member" });

    project.members.push(user._id);
    await project.save();

    await logActivity({
      user: req.user.id,
      action: `you added ${user.name} to project "${project.name}"`,
      project: project._id,
    });

    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= UPDATE MEMBERS (BULK) ================= */
exports.updateMembers = async (req, res) => {
  try {
    if (!canManageProject(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { members } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { members },
      { new: true }
    ).populate("members", "name email");

    await Task.updateMany(
      { project: project._id },
      { $pull: { assignees: { $nin: members } } }
    );

    await logActivity({
      user: req.user.id,
      action: `you updated members of project "${project.name}"`,
      project: project._id,
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

/* ================= REMOVE MEMBER ================= */
exports.removeMember = async (req, res) => {
  try {
    if (!canManageProject(req.user.role)) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const project = await Project.findById(req.params.id);
    const removedUser = await User.findById(req.params.userId);

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );

    await project.save();

    await Task.updateMany(
      { project: project._id },
      { $pull: { assignees: req.params.userId } }
    );

    await logActivity({
      user: req.user.id,
      action: `you removed ${removedUser.name} from project "${project.name}"`,
      project: project._id,
    });

    res.json({ message: "Member removed and cleaned from tasks" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};