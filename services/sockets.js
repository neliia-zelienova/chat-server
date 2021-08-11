const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const { nanoid } = require("nanoid");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

module.exports = function (io) {
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, JWT_SECRET_KEY, async (err) => {
        if (err) {
          return next(new Error("Token error"));
        }
        const user = await Users.findByToken(socket.handshake.query.token);
        socket.data.user = user;
        await Users.toggleOnline(user.id, true);
        next();
      });
    }
  }).on("connection", async (client) => {
    const { _id, username, online, bunned, mutted, admin, socketId } =
      await Users.findByToken(client.handshake.query.token);

    // Send userdata on client
    io.to(client.id).emit("user data", {
      _id,
      username,
      online,
      bunned,
      mutted,
      admin,
    });
    // Get and send online users list
    const onlineUsers = await Users.onlineUsers();
    broadcast("users", onlineUsers);
    // if admin connected - send all users list
    const adminUser = await Users.getAdmin();
    console.log(
      "io.sockets.sockets.get()",
      [...io.sockets.sockets.values()].map((item) => ({
        socketId: item.id,
        user: item.data.user,
      }))
      // io.sockets.sockets.find((item) => item.data.user._id === adminUser._id)
    );
    if (client.data.user._id === adminUser._id) {
      const allUsers = await Users.allUsers();
      io.to(adminUser?.socketId).emit("all users", allUsers);
    }

    client.on("message", (message, userId) => {
      const id = nanoid();
      let options = {
        timeZone: "Europe/Kiev",
        hour12: false,
        year: "numeric",
        month: "numeric",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
      };
      const messageDate = new Date().toLocaleString([], options);
      broadcast("message", { message, userId, messageDate, id });
    });

    client.on("admin:toggle-mute", async (userId) => {
      // check is admin mute
      const { _id, admin } = await Users.findByToken(
        client.handshake.query.token
      );
      if (admin && _id !== userId) {
        await Users.toggleMute(userId);
        broadcast("user mute state toggled", userId);
        const onlineUsers = await Users.onlineUsers();
        broadcast("users", onlineUsers);
      }
    });

    client.on("admin:toggle-bun", async (userId) => {
      // check is admin bun
      const { _id, admin } = await Users.findByToken(
        client.handshake.query.token
      );
      if (admin && _id !== userId) {
        await Users.toggleBun(userId);
        broadcast("user bun state toggled", userId);
        console.log("userId", userId);
        const { socketId, bunned } = await Users.findById(userId);
        console.log("socketId, bunned", socketId, bunned);
        if (socketId && bunned) {
          io.sockets.sockets.get(socketId).disconnect();
        }
      }
    });

    client.on("disconnect", async () => {
      console.log("in socket disconnect", client.id);
      await Users.updateSocketId(client.handshake.query.token, null);
      const { admin } = await Users.findByToken(client.handshake.query.token);
      const onlineUsers = await Users.onlineUsers();
      broadcast("users", onlineUsers);
      const adminUser = await Users.getAdminSocketId();
      if (adminUser?.socketId) {
        const allUsers = await Users.allUsers();
        io.to(adminUser?.socketId).emit("all users", allUsers);
      }
    });

    function broadcast(event, data) {
      client.emit(event, data);
      client.broadcast.emit(event, data);
    }
  });
};
