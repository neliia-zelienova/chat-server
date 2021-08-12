const jwt = require("jsonwebtoken");
const Users = require("../model/users");
const { nanoid } = require("nanoid");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const connectedSocketsList = (io) => {
  return [...io.sockets.sockets.values()].map(
    (item) =>
      item && {
        socketId: item.id,
        user: item.data.user,
      }
  );
};

const getFormattedDate = () => {
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
  return new Date().toLocaleString([], options);
};

const createMessageData = (type, message, username) => {
  const id = nanoid();
  messageDate = getFormattedDate();
  return { id, type, message, messageDate, username };
};

module.exports = function (io) {
  io.use((socket, next) => {
    if (socket.handshake.query && socket.handshake.query.token) {
      jwt.verify(socket.handshake.query.token, JWT_SECRET_KEY, async (err) => {
        if (err) {
          return next(new Error("Token error"));
        }
        const user = await Users.findByToken(socket.handshake.query.token);
        if (user) {
          socket.data.user = user;
          if (user) {
            await Users.toggleOnline(user._id, true);
          }
        }
        next();
      });
    }
  })
    // middleware for bunned users
    .use(async (socket, next) => {
      const user = await Users.findById(socket.data?.user?._id);
      if (user?.bunned) return next(new Error("Bunned by admin"));
      next();
    })
    // middelware to prevent connection same user
    // .use(async (socket, next) => {
    //   const socketsList = connectedSocketsList(io);
    //   const doubleSocket = socketsList?.find(
    //     (item) => item.user._id.toString() === socket.data.user._id.toString()
    //   );
    //   if (doubleSocket) return next(new Error("Already connected"));
    //   next();
    // })
    .on("connection", async (client) => {
      // Get connected sockets array
      const socketsList = connectedSocketsList(io);
      console.log("connectedSockets", socketsList.length);

      // Send userdata on client
      io.to(client.id).emit("user data", client.data.user);
      // Get and send online users list
      const onlineUsers = await Users.onlineUsers();
      broadcast("users", onlineUsers);

      const adminData = socketsList.find((client) => client.user?.admin);

      if (adminData?.socketId) {
        const allUsers = await Users.allUsers();
        io.to(adminData?.socketId).emit("all users", allUsers);
      }

      client.on("message", async (message, userId) => {
        const user = await Users.findById(userId);
        console.log("user", user);
        // If user are alowed to send a messages - broadcast to everyone
        if (!user?.muted) {
          console.log("user.username", user.username);
          const messageData = createMessageData("text", message, user.username);
          broadcast("message", messageData);
        }
      });

      client.on("admin:toggle-mute", async (userId) => {
        // check is admin muting
        const { admin } = await Users.findById(client.data.user._id);
        if (admin) {
          await Users.toggleMute(userId);
          const { username } = await Users.findById(userId);
          const muteMessageData = createMessageData(
            "info",
            "User mute state changed",
            username
          );
          broadcast("message", muteMessageData);
          const onlineUsers = await Users.onlineUsers();

          broadcast("users", onlineUsers);
          const allUsers = await Users.allUsers();
          console.log("allUsers", allUsers);
          io.to(client.id).emit("all users", allUsers);
        }
      });

      client.on("admin:toggle-bun", async (userId) => {
        // check is admin bunning
        const { admin } = await Users.findById(client.data.user._id);
        if (admin) {
          await Users.toggleBun(userId);
          const user = await Users.findById(userId);
          const bunMessageData = createMessageData(
            "info",
            "User bun state changed",
            user.username
          );
          broadcast("message", bunMessageData);
          if (user.bunned) {
            // Get connected sockets array
            const socketsList = connectedSocketsList(io);
            const bunnedUser = socketsList.find(
              (client) => client.user._id.toString() === userId.toString()
            );
            if (bunnedUser) {
              io.to(bunnedUser?.socketId).emit("bunned", "Bunned by admin");
              io.sockets.sockets.get(bunnedUser?.socketId).disconnect(true);
            }
          }
          const onlineUsers = await Users.onlineUsers();
          broadcast("users", onlineUsers);
          const allUsers = await Users.allUsers();
          io.to(client.id).emit("all users", allUsers);
        }
      });

      client.on("disconnect", async () => {
        console.log("disconnect", client.data.user.username);
        await Users.toggleOnline(client.data.user._id, false);

        const userDisconnectedMessage = createMessageData(
          "info",
          "User disconnected",
          client.data.user.username
        );
        broadcast("message", userDisconnectedMessage);

        const onlineUsers = await Users.onlineUsers();
        broadcast("users", onlineUsers);

        const connectedSockets = connectedSocketsList(io);
        const admin = connectedSockets.find(
          (socket) => socket.user?.admin === true
        );
        if (admin?.socketId) {
          const allUsers = await Users.allUsers();
          io.to(admin?.socketId).emit("all users", allUsers);
        }
      });

      function broadcast(event, data) {
        client.emit(event, data);
        client.broadcast.emit(event, data);
      }
    });
};
