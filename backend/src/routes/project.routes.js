const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const { updateMembers } = require("../controllers/project.controller");
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



router.get("/:id", async (req, res) => {
  const Project = require("../models/Project");
  const project = await Project.findById(req.params.id).populate(
    "members",
    "name email"
  );
  res.json(project);
});
router.put("/:id/members", updateMembers);



module.exports = router;
