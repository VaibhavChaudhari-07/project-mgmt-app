const Team = require("../models/Team");

exports.getTeams = async (req, res) => {
  const teams = await Team.find({ createdBy: req.user._id })
    .populate("members", "name email");
  res.json(teams);
};

exports.createTeam = async (req, res) => {
  const { name, members } = req.body;

  const team = await Team.create({
    name,
    members: members || [],
    createdBy: req.user._id,
  });

  const populated = await Team.findById(team._id).populate(
    "members",
    "name email"
  );

  res.status(201).json(populated);
};

exports.updateTeam = async (req, res) => {
  const team = await Team.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true }
  ).populate("members", "name email");

  res.json(team);
};

exports.deleteTeam = async (req, res) => {
  await Team.findByIdAndDelete(req.params.id);
  res.json({ message: "Team deleted" });
};
