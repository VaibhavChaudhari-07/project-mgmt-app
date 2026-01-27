const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const {
  createProject,
  getProjects,
  updateProject,
  deleteProject,
  addMember,
  removeMember
} = require("../controllers/project.controller");

router.use(auth);

router.post("/", createProject);
router.get("/", getProjects);
router.put("/:id", updateProject);
router.delete("/:id", deleteProject);
router.post("/:id/members", addMember);
router.delete("/:id/members/:userId", removeMember);


module.exports = router;
