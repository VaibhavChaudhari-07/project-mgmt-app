const Activity = require("../models/Activity");

exports.logActivity = async ({ user, action, project }) => {
  try {
    if (!action || !action.trim()) return; // ✅ prevent bad records

    await Activity.create({
      user,
      action,
      project,
    });
  } catch (err) {
    console.error("Activity log failed:", err.message);
  }
};