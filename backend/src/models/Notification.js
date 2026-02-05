const mongoose = require("mongoose");

const schema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  message: String,
  read: { type: Boolean, default: false },
  type: { 
    type: String, 
    enum: ["project", "task", "status", "comment", "user_invitation"],
    default: "project"
  },
  tab: {
    type: String,
    enum: ["Project", "Tasks", "Comments", "Project Invitation"],
    default: "Project"
  },
}, { timestamps: true });

module.exports = mongoose.model("Notification", schema);
