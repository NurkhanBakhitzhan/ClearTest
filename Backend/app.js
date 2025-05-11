// app.js
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/roomRoutes');

const app = express();

app.use(cors({
  origin: 'http://127.0.0.1:5500', // или 'http://localhost:5500', если ты с него открываешь HTML
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());

app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);

module.exports = app;
