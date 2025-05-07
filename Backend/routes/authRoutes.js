const express = require('express');
const router = express.Router();
const { register, login } = require('../controllers/authController');
const { username, password, email } = req.body;

router.post('/register', register);
router.post('/login', login);

module.exports = router;
