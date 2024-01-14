const { Server } = require("socket.io");

// global.onlineUsers = new Map();

function Socket(server) {
  const io = new Server(server, {
    cors: {
      //   origin: "http://localhost:5173",
    },
  });

  io.on("connection", (socket) => {
    // global.chatSocket = socket;
    console.log("Socket Connection initiated");

    // socket.on("send-message", (data) => {
    //   const to = onlineUsers.get(data.receiver);
    //   console.log(to, data.receiver, data);
    //   if (to) socket.to(to).emit("receive-message", data);
    // });

    socket.on("disconnect", () => {
      console.log("User Disconnected", socket.io);
    });
  });
}

module.exports = Socket;
