const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
  updateTaskStatusByMember, // 👈 new
} = require("../controllers/task.controller");

router.use(auth);

// Admin / PM
router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

// All members
router.get("/project/:projectId", getTasksByProject);

// Member status-only update
router.patch("/:id/status", updateTaskStatusByMember);

module.exports = router;