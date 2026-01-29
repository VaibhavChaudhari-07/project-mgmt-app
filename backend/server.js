const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = require("./src/app");
const connectDB = require("./src/config/db");

connectDB();

app.use("/api/users", require("./src/routes/user.routes"));

const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

global.io = io;

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("join", (userId) => {
    socket.join(userId);
    console.log("User joined room:", userId);
  });

  socket.on("disconnect", () => {
    console.log("Socket disconnected");
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
