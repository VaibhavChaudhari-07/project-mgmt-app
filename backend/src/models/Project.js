const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    // Per-project configurable permissions
    permissions: {
      // allow members to create issues/tasks
      memberCreateIssue: { type: Boolean, default: false },
      // allow members to change issue/task status
      memberChangeStatus: { type: Boolean, default: false },
      // allow project manager to edit workflow (configurable)
      pmEditWorkflow: { type: Boolean, default: false },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
