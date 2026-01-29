const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // fetch full user to get role
    const user = await User.findById(decoded.id).select("id name email role");

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role, // ✅ role now available everywhere
    };

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};