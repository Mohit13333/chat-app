import express from "express";
import http from "http";
import { Server } from "socket.io";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server);
app.use(cors());

app.use(express.static("src"));

let users = 0;

io.on("connection", (socket) => {
  if (users >= 2) {
    socket.emit("chatFull");
    socket.disconnect();
    return;
  }
  users++;
  console.log(`User connected. Total users: ${users}`);
  socket.broadcast.emit("userConnected", `A new user has joined the chat.`);

  socket.on("chatMessage", (data) => {
    io.emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    users--;
    console.log(`User disconnected. Total users: ${users}`);
    socket.broadcast.emit("userDisconnected", ` A user has left the chat.`);
  });
});

server.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
