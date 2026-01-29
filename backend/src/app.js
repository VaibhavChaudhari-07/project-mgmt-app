const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const projectRoutes = require("./routes/project.routes");
const taskRoutes = require("./routes/task.routes");
const dashboardRoutes = require("./routes/dashboard.routes");
const userRoutes = require("./routes/user.routes");
const teamRoutes = require("./routes/team.routes");
const commentRoutes = require("./routes/comment.routes");



const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);

app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);

app.get("/", (req, res) => {
  res.send("API Running");
});

app.use("/api/users", userRoutes);
app.use("/api/teams", teamRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/activity", require("./routes/activity.routes"));

app.use("/api/notifications", require("./routes/notification.routes"));


module.exports = app;

