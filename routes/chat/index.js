var express = require("express");
var router = express.Router();
const ctrl = require("../../controllers/users");
const guard = require("../../helpers/guard");
// const upload = require("../../../helpers/uploads");

router.post("/chat", guard, function (req, res, next) {
  const io = req.app.get("socketio");
  console.log("io", io);

  io.use((socket, next) => {
    console.log("io.use");
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(
        socket.handshake.query.token,
        JWT_SECRET_KEY,
        async (err, decoded) => {
          if (err) return next(new Error("auth error"));
          socket.decoded = decoded;
          await Users.toggleOnlineByToken(socket.handshake.query.token, true);
          next();
        }
      );
    }
  }).on("connection", async (client) => {
    console.log("client.handshake.query.token", client.handshake.query.token);
    const { admin } = await Users.findByToken(client.handshake.query.token);
    if (admin) {
      const allUsers = await Users.allUsers();
      client.emit("all users", allUsers);
      console.log("allUsers", allUsers);
    }
    const onlineUsers = await Users.onlineUsers();
    broadcast("online users", onlineUsers);
    console.log("onlineUsers", onlineUsers);

    client.on("message", (message) => {
      broadcast("message", message);
    });

    client.on("admin:toggle-mute", async (userId) => {
      const { _id, admin } = await Users.findByToken(
        client.handshake.query.token
      );
      if (admin && _id !== usetId) {
        await Users.toggleMute(userId);
        broadcast("user mute state toggled", userId);
      }
    });

    client.on("admin:toggle-bun", async (userId) => {
      const { _id, admin } = await Users.findByToken(
        client.handshake.query.token
      );
      if (admin && _id !== usetId) {
        await Users.toggleBun(userId);
        broadcast("user bun state toggled", userId);
      }
    });

    client.on("disconnect", async () => {
      await Users.toggleOnlineByToken(client.handshake.query.token, false);
      const onlineUsers = await Users.onlineUsers();
      broadcast("users", onlineUsers);
      console.log("onlineUsers", onlineUsers);
    });

    function broadcast(event, data) {
      client.emit(event, data);
      client.broadcast.emit(event, data);
    }
  });
});

module.exports = router;
