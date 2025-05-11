require('dotenv').config();
const http = require('http');
const app = require('./app');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 3001;

// Создаем HTTP-сервер на базе Express
const server = http.createServer(app);

// Настраиваем Socket.IO с поддержкой CORS и credentials
const io = new Server(server, {
  cors: {
    origin: 'http://127.0.0.1:5500',
    credentials: true
  }
});

// Обработка соединений Socket.IO
io.on('connection', (socket) => {
  console.log('🔥 Socket.IO client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('❌ Socket.IO client disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
