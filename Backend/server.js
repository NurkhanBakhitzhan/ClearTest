const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');

app.use(cors());
app.use(express.json());
app.use(cookieParser());
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
