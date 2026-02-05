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
  updateMe,
  deleteMe
} = require("../controllers/user.controller");

router.use(auth);

router.get("/me", auth, getMe);
router.put("/me", auth, updateMe);
router.delete("/me",auth,deleteMe);

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

// Get required users for current user
router.get("/me/required-users", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("requiredUsers", "name email role");
    res.json(user.requiredUsers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Update required users for current user
router.put("/me/required-users", auth, async (req, res) => {
  try {
    const { userIds } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { requiredUsers: userIds || [] },
      { new: true }
    ).populate("requiredUsers", "name email role");
    res.json(user.requiredUsers || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
