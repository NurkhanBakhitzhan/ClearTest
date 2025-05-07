const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { create, listPublic } = require('../controllers/roomController');

router.get('/', listPublic);
router.post('/', auth, create);

module.exports = router;
