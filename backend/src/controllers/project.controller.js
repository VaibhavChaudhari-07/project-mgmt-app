const Project = require("../models/Project");
const Task = require("../models/Task");


exports.createProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      createdBy: req.user.id,
      members: [req.user.id],
    });

    const populatedProject = await Project.findById(project._id).populate(
      "members",
      "name email"
    );

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

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

exports.updateProject = async (req, res) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { name, description },
      { new: true },
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



exports.deleteProject = async (req, res) => {
  try {
    const projectId = req.params.id;

    // Delete all tasks of this project
    await Task.deleteMany({ project: projectId });

    // Delete the project
    await Project.findByIdAndDelete(projectId);

    res.json({ message: "Project and related tasks deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


const User = require("../models/User");

exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const project = await Project.findById(req.params.id);

    if (project.members.includes(user._id))
      return res.status(400).json({ message: "User already member" });

    project.members.push(user._id);
    await project.save();

    res.json({ message: "Member added" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateMembers = async (req, res) => {
  try {
    const { members } = req.body;

    // Update project members
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { members },
      { new: true }
    ).populate("members", "name email");

    // 🔒 Remove invalid assignees from all tasks of this project
    await Task.updateMany(
      { project: project._id },
      {
        $pull: {
          assignees: { $nin: members },
        },
      }
    );

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);

    const removedUserId = req.params.userId;

    project.members = project.members.filter(
      (m) => m.toString() !== removedUserId
    );

    await project.save();

    // 🔒 Remove user from all tasks in this project
    await Task.updateMany(
      { project: project._id },
      {
        $pull: {
          assignees: removedUserId,
        },
      }
    );

    res.json({ message: "Member removed and cleaned from tasks" });
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
