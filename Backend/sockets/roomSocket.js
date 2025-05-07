const { deleteRoom, getRoomById } = require('../models/roomModel');

const rooms = new Map(); // key: roomId, value: { hostId, sockets: Set }

function registerRoomSockets(io) {
  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    socket.on('joinRoom', async ({ roomId, userId }) => {
      const room = await getRoomById(roomId);
      if (!room) return socket.emit('error', 'Room not found');

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
