const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { create, listPublic } = require('../controllers/roomController');

router.get('/', listPublic);
router.post('/', auth, create);

// GET /rooms/list?mode=public
router.get('/rooms/list', async (req, res) => {
    const rooms = await db.query(`SELECT id, name, mode FROM rooms WHERE mode = 'public'`);
    res.json(rooms.rows);
  });

module.exports = router;
