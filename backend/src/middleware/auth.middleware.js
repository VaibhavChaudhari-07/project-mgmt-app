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
    // Do not log sensitive user info in production by default.
    // If you need debug logging, enable it explicitly (e.g. set DEBUG_AUTH=true).
    if (process.env.DEBUG_AUTH === 'true') {
      console.debug("Auth middleware - User fetched:", { id: user._id, name: user.name, email: user.email, role: user.role });
      console.debug("Auth middleware - req.user set to:", req.user);
    }

    next();
  } catch (err) {
    console.error("Auth middleware error:", err.message);
    res.status(401).json({ message: "Invalid token" });
  }
};