import.meta;
import http from "http";
import express from "express";
import socketio from "socket.io";
import { fileURLToPath } from "url";
import path, { dirname } from "path";
import Filter from "bad-words";
import { generateMessage, generateLocationMessage } from "./utils/messages.js";
import { addUser, removeUser, getUser, getUsers } from "./utils/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const publicDirectoryPath = path.join(__dirname, "../public");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const port = process.env.PORT || 3000;

app.use(express.static(publicDirectoryPath));
// app.get("/", (req, res) => {
//   res.sendFile("/index.html");
// });

app.use((req, res) => {
  console.log(req.method, req.path);
});

let count = 0;

io.on("connection", (socket) => {
  socket.on("join", ({ username, room }, callback) => {
    const id = socket.id;
    const { error, user } = addUser({ id, username, room });
    if (error) {
      return callback(error);
    }
    socket.join(user.room);
    socket.emit("message", generateMessage(`Welcome, ${user.username}!`));

    socket.broadcast
      .to(room)
      .emit(
        "message",
        generateMessage(
          `A new user(${user.username}) has just joined the chat room!`
        )
      );
    io.to(user.room).emit("roomData", {
      room: user.room,
      users: getUsers(user.room),
    });
    callback(undefined);
  });
  socket.on("sendMessage", (message, callback) => {
    const filter = new Filter();
    if (filter.isProfane(message)) {
      return callback("Profanity is not allowed!");
    }
    const user = getUser(socket.id);
    if (!user) return callback("No User");
    socket.broadcast
      .to(user.room)
      .emit("message", generateMessage(message, user.username));
    callback(undefined, Date(Date.now()));
  });

  socket.on("sendLocation", ({ longitude, latitude }, callback) => {
    const user = getUser(socket.id);
    if (!user) return callback("No User");

    socket.broadcast
      .to(user.room)
      .emit(
        "location",
        generateLocationMessage(
          `https://www.google.com/maps?q=${latitude},${longitude}`,
          user.username
        )
      );

    callback(undefined);
  });

  socket.on("disconnect", () => {
    const user = removeUser(socket.id);
    if (user) {
      io.to(user.room).emit(
        "message",
        generateMessage(`A user(${user.username}) has disconnected`)
      );
      io.to(user.room).emit("roomData", {
        room: user.room,
        users: getUsers(user.room),
      });
    }
  });
  // socket.emit("countUpdated", count);
  // socket.on("incrementCount", () => {
  //   count++;
  //   io.emit("countUpdated", count);
  // });
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});
