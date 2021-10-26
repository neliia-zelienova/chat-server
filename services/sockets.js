const jwt = require("jsonwebtoken");
const Users = require("../controllers/db/users");
const Messages = require("../controllers/db/messages");
const { nanoid } = require("nanoid");
require("dotenv").config();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

const MAX_MESSAGE_LENGTH = 200;

const connectedSocketsList = (io) => {
  return [...io.sockets.sockets.values()].map(
    (item) =>
      item && {
        socketId: item.id,
        user: item.data.user,
      }
  );
};

const createMessageData = (type, message, username) => {
  const id = nanoid();
  return { id, type, message, username };
};

const sendAllUsers = async (io, socketsList, Model) => {
  const adminData = socketsList.filter((client) => client.user.admin);
  if (adminData) {
    const allUsers = await Model.allUsers();
    adminData.forEach((item) =>
      io.to(item?.socketId).emit("all users", allUsers)
    );
  }
};

const reactOnStateChange = async (io, state, userId, Users, broadcast) => {
  const user = await Users.findById(userId);
  const socketsList = connectedSocketsList(io);
  const toggledUser = socketsList.find(
    (client) => client.user?.id.toString() === userId.toString()
  );
  if (toggledUser) {
    io.to(toggledUser.socketId).emit(`user data:${state}`, user[state]);
    if (user.banned) {
      io.sockets.sockets.get(toggledUser.socketId).disconnect(true);
    }
  }
  const toggleMessageData = createMessageData(
    "info",
    user.muted ? `${state}` : `un${state}`,
    user.username
  );
  broadcast(`${state}:message`, {
    user,
    toggleMessageData,
  });
};

module.exports = function (io) {
  let userId = null;
  io.use((socket, next) => {
    if (socket.handshake.query?.token) {
      jwt.verify(
        socket.handshake.query.token,
        JWT_SECRET_KEY,
        (err, decoded) => {
          if (err) {
            return next(new Error("Token error"));
          }
          userId = decoded.id;
          next();
        }
      );
    }
  })
    // middelware to prevent same user connection and banned users
    .use(async (socket, next) => {
      const user = await Users.findById(userId);
      if (user) {
        const socketsList = connectedSocketsList(io);
        const doubleSocket = socketsList?.find(
          (item) => item.user?.id.toString() === userId
        );
        if (doubleSocket) {
          return next(new Error("Double connection"));
        } else {
          if (user.banned) {
            return next(new Error("Banned by admin"));
          } else {
            socket.data.user = user;
            await Users.toggleOnline(userId, true);
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
      const history = await Messages.historyMessages();
      client.emit("history", history);
      // Get and send online users list
      const onlineUsers = await Users.onlineUsers();
      broadcast("users", onlineUsers);

      await sendAllUsers(io, socketsList, Users);

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
        let reason = "";
        // If user are alowed to send a messages - broadcast to everyone
        if (!user?.muted) {
          const mesageAllowed = await Users.newMesageAllowed(userId);
          if (mesageAllowed) {
            if (message.length <= MAX_MESSAGE_LENGTH) {
              const data = await Messages.create({
                text: message,
                userId,
              });
              client.emit("message:accepted");
              broadcast("message", data);
            } else reason = "length";
          } else reason = "timeout";
        } else reason = "muted";
        if (reason) {
          client.emit(`message:denied ${reason}`);
        }
      });

      if (client.data.user?.admin) {
        client.on("admin:toggle-mute", async (userId) => {
          await Users.toggleMute(userId);
          await reactOnStateChange(io, "muted", userId, Users, broadcast);
        });

        client.on("admin:toggle-ban", async (userId) => {
          if (userId) {
            // check is admin baning
            await Users.toggleBan(userId);
            await reactOnStateChange(io, "banned", userId, Users, broadcast);
          }
        });
      }

      // client.on("disconnecting", (reason) => {
      //   console.log("disconnecting");
      // });

      client.on("disconnecting", async (reason) => {
        if (client.data.user) {
          await Users.toggleOnline(client.data.user.id, false);
          const userDisconnectedMessage = createMessageData(
            "info",
            "disconnected",
            client.data.user.username
          );
          broadcast("message", userDisconnectedMessage);

          const onlineUsers = await Users.onlineUsers();
          broadcast("users", onlineUsers);

          // const socketsList = connectedSocketsList(io);
          await sendAllUsers(io, socketsList, Users);
        }
      });

      function broadcast(event, data) {
        client.emit(event, data);
        client.broadcast.emit(event, data);
      }
    });
};
