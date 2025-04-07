// server/socketServer.js
const { Server } = require("socket.io");
const http = require("http");
const express = require("express");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    // origin: "http://localhost:3000",
    origin: "*", 
    methods: ["GET", "POST"],
  },
});

const users = new Map();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.emit("requestUsername");

  socket.on("setUsername", ({ username, room }) => {
    users.set(socket.id, username);
    socket.join(room);
    console.log(`User ${username} (ID: ${socket.id}) joined room ${room}`);

    io.emit("userList", Array.from(users.values()));
    socket.emit("message", `Welcome to the chat, ${username}! You are in room: ${room}`);
    socket.to(room).emit("message", `${username} has joined the room ${room}`);
  });

  socket.on("sendMessage", ({ message, room }) => {
    const username = users.get(socket.id) || "Anonymous";
    console.log(`Received from ${username} in room ${room}: ${message}`);
    io.to(room).emit("message", `${username}: ${message}`);
  });

  socket.on("disconnect", () => {
    const username = users.get(socket.id) || "Anonymous";
    console.log(`User ${username} (ID: ${socket.id}) disconnected`);
    users.delete(socket.id);
    io.emit("userList", Array.from(users.values()));
    io.emit("message", `${username} has left the chat`);
  });
});

const PORT = 8080;
server.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});


