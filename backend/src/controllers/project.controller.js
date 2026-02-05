const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const { logActivity } = require("./activity.helper");
const { sendNotification, sendNotifications } = require("../helpers/notification.helper");

// Controller methods for projects with owner-based permissions.

exports.createProject = async (req, res) => {
  try {
    console.log("CreateProject - User object:", req.user);
    
    // Allow any authenticated user to create projects
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Permission denied - not authenticated" });
    }

    const { name, description, permissions } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
      permissions: permissions || {},
    });

    await logActivity({
      user: req.user.id,
      action: `you created project "${name}"`,
      project: project._id,
    });

    // Send notification to self (project creator)
    await sendNotification(
      req.user.id,
      `You created project "${name}"`,
      "project",
      "Project"
    );

    console.log("Project created successfully:", project._id);
    res.status(201).json(project);
  } catch (err) {
    console.log("Error creating project:", err.message);
    res.status(500).json({ message: err.message });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find({ members: req.user.id })
      .populate("members", "name email")
      .populate("createdBy", "name role")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "role"
    );

    // Allow any authenticated user to update projects
    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const { name, description } = req.body;

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true }
    );

    await logActivity({
      user: req.user.id,
      action: `you updated project "${updated.name}"`,
      project: updated._id,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "role"
    );

    // Only owner (who created the project) can delete it
    if (String(project.createdBy._id) !== String(req.user.id)) {
      return res.status(403).json({ message: "Permission denied" });
    }

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

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const member = await User.findOne({ email });
    if (!member) return res.status(404).json({ message: "User not found" });

    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "role"
    );

    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    if (project.members.includes(member._id))
      return res.status(400).json({ message: "User already member" });

    project.members.push(member._id);
    await project.save();

    await logActivity({
      user: req.user.id,
      action: `you added ${member.name} to project "${project.name}"`,
      project: project._id,
    });

    // Send notification to added member
    const adderUser = await User.findById(req.user.id);
    await sendNotification(
      member._id,
      `You are added to project "${project.name}" by ${adderUser.name}`,
      "project",
      "Project Invitation"
    );

    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateMembers = async (req, res) => {
  try {
    const { members } = req.body;

    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "role"
    );

    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const updated = await Project.findByIdAndUpdate(
      req.params.id,
      { members },
      { new: true }
    ).populate("members", "name email");

    // Determine added and removed members
    const oldMembers = (project.members || []).map((m) => m._id.toString());
    const newMembers = members.map((m) => m.toString());
    const addedMembers = newMembers.filter((m) => !oldMembers.includes(m));
    const removedMembers = oldMembers.filter((m) => !newMembers.includes(m));

    const updaterUser = await User.findById(req.user.id);

    // Notify added members
    if (addedMembers.length > 0) {
      await sendNotifications(
        addedMembers,
        `You are assigned to project "${updated.name}" by ${updaterUser.name}`,
        "project",
        "Project"
      );
    }

    // Notify removed members
    if (removedMembers.length > 0) {
      await sendNotifications(
        removedMembers,
        `You were removed from project "${updated.name}" by ${updaterUser.name}`,
        "project",
        "Project"
      );
    }

    await Task.updateMany(
      { project: updated._id },
      { $pull: { assignees: { $nin: members } } }
    );

    await logActivity({
      user: req.user.id,
      action: `you updated members of project "${updated.name}"`,
      project: updated._id,
    });

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id).populate(
      "createdBy",
      "role"
    );

    if (!req.user || !req.user.id) {
      return res.status(403).json({ message: "Permission denied" });
    }

    const removedUser = await User.findById(req.params.userId);

    // Prevent removing owner
    if (String(project.createdBy._id || project.createdBy) === String(req.params.userId)) {
      return res.status(400).json({ message: "Cannot remove project owner" });
    }

    project.members = project.members.filter(
      (m) => m.toString() !== req.params.userId
    );

    await project.save();

    await Task.updateMany(
      { project: project._id },
      { $pull: { assignees: req.params.userId } }
    );

    // Send notification to removed member
    const removerUser = await User.findById(req.user.id);
    await sendNotification(
      req.params.userId,
      `You were removed from project "${project.name}" by ${removerUser.name}`,
      "project",
      "Project"
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
