const { deleteRoom, getRoomById, createRoom } = require('../models/roomModel');
const bcrypt = require('bcrypt'); // Если будешь хэшировать пароль

const rooms = new Map(); // key: roomId, value: { hostId, sockets: Set }

function registerRoomSockets(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // ✅ Обработчик СОЗДАНИЯ комнаты
    socket.on('createRoom', async ({ name, mode, password, userId }) => {
      try {
        const isPrivate = (mode === 'private');
        const isProtected = (mode === 'protected');
        const finalPassword = isProtected ? password : null;

        const newRoom = await createRoom({
          name,
          isPrivate: isPrivate || isProtected,
          password: finalPassword,
          hostId: userId,
        });

        rooms.set(newRoom.id, { hostId: userId, sockets: new Set([socket.id]) });

        socket.join(newRoom.id);
        socket.data.roomId = newRoom.id;
        socket.data.userId = userId;
        socket.data.isHost = true;

        socket.emit('roomCreated', { roomId: newRoom.id });
        console.log(`✅ Комната создана: ${newRoom.name} (ID: ${newRoom.id}) пользователем ${userId}`);
      } catch (err) {
        console.error('❌ Ошибка при создании комнаты:', err);
        socket.emit('joinError', 'Ошибка при создании комнаты');
      }
    });

    // другие обработчики:
    socket.on('joinRoom', async ({ roomId, userId, password }) => {
      const room = await getRoomById(roomId);
      if (!room) return socket.emit('joinError', 'Room not found');

      if (room.is_private) {
        if (room.password) {
          const match = await bcrypt.compare(password || '', room.password);
          if (!match) return socket.emit('joinError', 'Неверный пароль');
        }
      }

      socket.join(roomId);

      if (!rooms.has(roomId)) {
        rooms.set(roomId, { hostId: room.host_id, sockets: new Set() });
      }

      rooms.get(roomId).sockets.add(socket.id);
      socket.data.roomId = roomId;
      socket.data.userId = userId;
      socket.data.isHost = room.host_id === userId;

      io.to(roomId).emit('roomUpdate', {
        users: Array.from(rooms.get(roomId).sockets),
      });
    });

    socket.on('leaveRoom', async () => {
      const { roomId, isHost } = socket.data;
      if (!roomId) return;

      socket.leave(roomId);
      if (rooms.has(roomId)) {
        const roomData = rooms.get(roomId);
        roomData.sockets.delete(socket.id);

        if (isHost) {
          io.to(roomId).emit('roomClosed');
          rooms.delete(roomId);
          await deleteRoom(roomId);
        } else {
          io.to(roomId).emit('roomUpdate', {
            users: Array.from(roomData.sockets),
          });
        }
      }
    });

    socket.on('disconnect', async () => {
      const { roomId, isHost } = socket.data;
      if (!roomId) return;

      if (rooms.has(roomId)) {
        const roomData = rooms.get(roomId);
        roomData.sockets.delete(socket.id);

        if (isHost) {
          io.to(roomId).emit('roomClosed');
          rooms.delete(roomId);
          await deleteRoom(roomId);
        } else {
          io.to(roomId).emit('roomUpdate', {
            users: Array.from(roomData.sockets),
          });
        }
      }
    });
  });
}

module.exports = registerRoomSockets;
