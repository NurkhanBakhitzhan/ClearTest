const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { createRoom, listPublic } = require('../controllers/roomController');

router.get('/', listPublic);
router.post('/', auth, createRoom);

module.exports = router;
