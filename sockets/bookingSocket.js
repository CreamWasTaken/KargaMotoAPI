const { Users, Drivers,Bookings,Favorites } = require("../model/schema");


module.exports = (io, socket) => {
    console.log(`User connected: ${socket.id}`);
  
    // Join a specific chat room
    socket.on('joinRoom', ({ roomId, username }) => {
      socket.join(roomId);
      console.log(`${username} joined room ${roomId}`);
  
      // Notify others in the room
      socket.to(roomId).emit('userJoined', {
        username,
        message: `${username} has joined the chat.`,
      });
    });
  
    // Handle sending messages
    socket.on('sendMessage', ({ roomId, message, username }) => {
      const payload = {
        username,
        message,
        time: new Date().toISOString(),
      };
  
      // Emit the message to everyone in the room
      io.to(roomId).emit('receiveMessage', payload);
    });
  
    // Leave room
    socket.on('leaveRoom', ({ roomId, username }) => {
      socket.leave(roomId);
      console.log(`${username} left room ${roomId}`);
  
      // Notify others
      socket.to(roomId).emit('userLeft', {
        username,
        message: `${username} has left the chat.`,
      });
    });
  
    // Disconnect
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  };
  