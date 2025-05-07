const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
require('dotenv').config();

const router = express.Router();

// Вспомогательные функции
function generateAccessToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '15m' });
}

function generateRefreshToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
}

// Регистрация
router.post('/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    const userExists = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await db.query('INSERT INTO users (username, password_hash) VALUES ($1, $2)', [username, hashedPassword]);
    res.status(201).json({ message: 'Пользователь зарегистрирован' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Логин
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(401).json({ message: 'Неверные данные' });
    }

    const accessToken = generateAccessToken(user.id);
    const refreshToken = generateRefreshToken(user.id);

    // HttpOnly, Secure можно добавить, если работаешь через HTTPS
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      sameSite: 'Strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 дней
    });

    res.json({ accessToken });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Обновление токена
router.post('/refresh-token', (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: 'Нет refresh токена' });

  try {
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const newAccessToken = generateAccessToken(payload.userId);
    res.json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(403).json({ message: 'Неверный refresh токен' });
  }
});

// Логаут
router.post('/logout', (req, res) => {
  res.clearCookie('refreshToken');
  res.json({ message: 'Вы вышли' });
});

module.exports = router;
