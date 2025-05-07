const express = require('express');
const http = require('http');
const cors = require('cors');
const dotenv = require('dotenv');
const { Server } = require('socket.io');

dotenv.config();
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const authRoutes = require('./routes/authRoutes');
const roomRoutes = require('./routes/roomRoutes');
const registerRoomSockets = require('./sockets/roomSocket');

app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/rooms', roomRoutes);

registerRoomSockets(io);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
