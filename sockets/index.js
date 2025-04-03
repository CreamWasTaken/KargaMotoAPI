// ./sockets/index.js
module.exports = (io) => {
    console.log('Socket.IO initialized - waiting for connections'); // This should appear on startup
    
    io.on('connection', (socket) => {
      console.log('🟢 New client connected:', socket.id);
      
      // Test event handler
      socket.on('hello', (data) => {
        console.log('Received hello:', data);
        socket.emit('hello-response', { message: 'Hello from server!' });
      });
      
      socket.on('disconnect', () => {
        console.log('🔴 Client disconnected:', socket.id);
      });
    });
  };