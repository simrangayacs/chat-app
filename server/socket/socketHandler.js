 const onlineUsers = new Map();

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("register_user", (userId) => {
      console.log("📌 REGISTER:", userId, typeof userId);
      onlineUsers.set(userId, socket.id);
      console.log("📋 Online users now:", Array.from(onlineUsers.keys()));
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });

    socket.on("send_message", (data) => {
      console.log("📤 SEND MESSAGE - looking for receiver:", data.receiver, typeof data.receiver);
      console.log("📋 Current online users:", Array.from(onlineUsers.keys()));
      const receiverSocket = onlineUsers.get(data.receiver);
      console.log("🎯 Found receiver socket:", receiverSocket);
      if (receiverSocket) {
        io.to(receiverSocket).emit("receive_message", data);
        console.log("✅ Message sent to receiver");
      } else {
        console.log("❌ Receiver not found in online users!");
      }
    });

    socket.on("typing", (data) => {
      const receiverSocket = onlineUsers.get(data.receiver);
      if (receiverSocket) io.to(receiverSocket).emit("user_typing", data.sender);
    });

    socket.on("stop_typing", (data) => {
      const receiverSocket = onlineUsers.get(data.receiver);
      if (receiverSocket) io.to(receiverSocket).emit("user_stop_typing");
    });

    socket.on("disconnect", () => {
      for (let [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) onlineUsers.delete(userId);
      }
      io.emit("update_online_users", Array.from(onlineUsers.keys()));
    });
  });
};