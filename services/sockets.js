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

const createMessageData = (type, message, username, color) => {
  const id = nanoid();
  messageDate = getFormattedDate();
  return { id, type, message, messageDate, username, color };
};

const checkMessageTimeout = (client) => {
  const currentTime = new Date();
  if (client.data.lastMessageAt) {
    return currentTime - client.data.lastMessageAt > 15000;
  } else return true;
};

module.exports = function (io) {
  io.use((socket, next) => {
    if (socket.handshake.query?.token) {
      jwt.verify(socket.handshake.query.token, JWT_SECRET_KEY, (err) => {
        if (err) {
          return next(new Error("Token error"));
        }
        next();
      });
    }
  })
    // middelware to prevent same user connection and banned users
    .use(async (socket, next) => {
      const user = await Users.findByToken(socket.handshake.query.token);
      if (user) {
        const socketsList = connectedSocketsList(io);
        const doubleSocket = socketsList?.find(
          (item) => item.user?._id.toString() === user?.id
        );
        if (doubleSocket) {
          return next(new Error("double connection"));
        } else {
          if (user.banned) {
            return next(new Error("Banned by admin"));
          } else {
            socket.data.user = user;
            await Users.toggleOnline(user.id, true);
            next();
          }
        }
      } else {
        return next(new Error("User not found"));
      }
    })
    .on("connection", async (client) => {
      // Get connected sockets array
      const socketsList = connectedSocketsList(io);
      console.log("connectedSockets", socketsList.length);
      // Send userdata on client
      client.emit("user data", client.data.user);
      // Get and send online users list
      const onlineUsers = await Users.onlineUsers();
      broadcast("users", onlineUsers);

      const adminData = socketsList.find((client) => client.user?.admin);

      if (adminData?.socketId) {
        const allUsers = await Users.allUsers();
        io.to(adminData.socketId).emit("all users", allUsers);
      }
      if (client.data.user) {
        const userConnectedMessage = createMessageData(
          "info",
          "connected",
          client.data.user.username
        );
        broadcast("message", userConnectedMessage);
      }

      client.on("message", async (message, userId) => {
        const user = await Users.findById(userId);
        // If user are alowed to send a messages - broadcast to everyone
        if (!user?.muted) {
          if (checkMessageTimeout(client)) {
            if (message.length <= 200) {
              const messageData = createMessageData(
                "text",
                message,
                user.username,
                user.color
              );
              client.data.lastMessageAt = new Date();
              client.emit("message:accepted");
              broadcast("message", messageData);
            } else client.emit("message:denied length");
          } else client.emit("message:denied timeout");
        } else client.emit("message:denied muted");
      });

      if (client.data.user?.admin) {
        client.on("admin:toggle-mute", async (userId) => {
          // check is admin muting
          await Users.toggleMute(userId);
          const { _id, banned, muted, online, username } = await Users.findById(
            userId
          );
          const muteMessageData = createMessageData(
            "info",
            `${muted ? "muted" : "unmuted"}`,
            username
          );
          const socketsList = connectedSocketsList(io);
          const muttedUser = socketsList.find(
            (client) => client.user?._id.toString() === userId.toString()
          );
          if (muttedUser) {
            io.to(muttedUser.socketId).emit("user data:mute", muted);
          }
          broadcast("muted:message", {
            user: {
              username,
              _id,
              banned,
              muted,
              online,
            },
            muteMessageData,
          });
        });

        client.on("admin:toggle-ban", async (userId) => {
          if (userId) {
            // check is admin baning
            const { admin } = await Users.findById(client.data.user._id);
            if (admin) {
              await Users.toggleBan(userId);
              const { _id, banned, muted, online, admin, username } =
                await Users.findById(userId);
              const banMessageData = createMessageData(
                "info",
                `${banned ? "banned" : "unbanned"}`,
                username
              );
              broadcast("banned:message", {
                user: { _id, banned, muted, online, admin, username },
                banMessageData,
              });
              if (banned) {
                // Get connected sockets array
                const socketsList = connectedSocketsList(io);
                const bannedUser = socketsList.find(
                  (client) => client.user?._id.toString() === userId.toString()
                );
                if (bannedUser) {
                  const { _id, banned, muted, online, username } = bannedUser;
                  io.to(bannedUser?.socketId).emit("user data:ban", {
                    username,
                    _id,
                    banned,
                    muted,
                    online,
                  });
                  io.sockets.sockets.get(bannedUser.socketId).disconnect(true);
                }
              }
            }
          }
        });
      }

      // client.on("disconnecting", (reason) => {
      //   console.log("disconnecting");
      // });

      client.on("disconnecting", async (reason) => {
        console.log("disconnecting reason", reason);
        if (client.data.user) {
          console.log("disconnect", client.data.user.username);
          await Users.toggleOnline(client.data.user._id, false);
          const userDisconnectedMessage = createMessageData(
            "info",
            "disconnected",
            client.data.user.username
          );
          broadcast("message", userDisconnectedMessage);

          const onlineUsers = await Users.onlineUsers();
          broadcast("users", onlineUsers);

          if (adminData?.socketId) {
            const allUsers = await Users.allUsers();
            io.to(adminData.socketId).emit("all users", allUsers);
          }
        }
      });

      function broadcast(event, data) {
        client.emit(event, data);
        client.broadcast.emit(event, data);
      }
    });
};
