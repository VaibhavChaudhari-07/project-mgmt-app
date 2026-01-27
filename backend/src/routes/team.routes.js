const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");

const {
  getTeams,
  createTeam,
  updateTeam,
  deleteTeam,
} = require("../controllers/team.controller");

router.use(auth);

router.get("/", getTeams);
router.post("/", createTeam);
router.put("/:id", updateTeam);
router.delete("/:id", deleteTeam);

module.exports = router;
