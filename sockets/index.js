// ./sockets/index.js
const bookSocket = require('./bookingSocket');

module.exports = (io) => {
  console.log('Socket.IO initialized - waiting for connections'); // Should show at server start

  io.on('connection', (socket) => {
    console.log('🟢 New client connected:', socket.id);

    // Attach modular socket logic
    bookSocket(io, socket);

    // Test event handler (optional, good for debugging)
    socket.on('hello', (data) => {
      console.log('Received hello:', data);
      socket.emit('hello-response', { message: 'Hello from server!' });
    });

    socket.on('disconnect', () => {
      console.log('🔴 Client disconnected:', socket.id);
    });
  });
};
