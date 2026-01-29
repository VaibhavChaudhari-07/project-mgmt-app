const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "user" },

    preferences: {
      theme: { type: String, default: "light" },
      language: { type: String, default: "en" },
    },

    notifications: {
      taskAssigned: { type: Boolean, default: true },
      taskStatusChanged: { type: Boolean, default: true },
      newComment: { type: Boolean, default: true },
      projectUpdates: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", userSchema);
