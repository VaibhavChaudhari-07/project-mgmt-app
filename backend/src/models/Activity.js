const mongoose = require("mongoose");

const ActivitySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  action: { type: String, required: true },   // ✅ REQUIRED
  project: { type: mongoose.Schema.Types.ObjectId, ref: "Project" },
}, { timestamps: true });

module.exports = mongoose.model("Activity", ActivitySchema);