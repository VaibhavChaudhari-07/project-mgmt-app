const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const User = require("../models/User");

const {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  getMe,
  updateMe
} = require("../controllers/user.controller");

router.use(auth);

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);

router.get("/", getUsers);
router.post("/", createUser);
router.put("/:id", updateUser);
router.delete("/:id", deleteUser);

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

router.put("/me", auth, async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { $set: req.body },
    { new: true }
  ).select("-password");

  res.json(user);
});

module.exports = router;
