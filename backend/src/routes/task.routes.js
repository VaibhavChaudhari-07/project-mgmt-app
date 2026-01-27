const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask,
} = require("../controllers/task.controller");

router.use(auth);

router.post("/", createTask);
router.get("/project/:projectId", getTasksByProject);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

module.exports = router;
