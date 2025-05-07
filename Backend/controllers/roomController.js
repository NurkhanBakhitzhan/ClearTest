const bcrypt = require('bcryptjs');
const {
  createRoom,
  getAllPublicRooms,
  getRoomById,
} = require('../models/roomModel');

const create = async (req, res) => {
  const { name, isPrivate, password } = req.body;
  const hostId = req.userId;

  const hashedPassword = password
    ? await bcrypt.hash(password, 10)
    : null;

  try {
    const room = await createRoom({
      name,
      isPrivate,
      password: hashedPassword,
      hostId,
    });
    res.json(room);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create room' });
  }
};

const listPublic = async (req, res) => {
  try {
    const rooms = await getAllPublicRooms();
    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: 'Failed to get rooms' });
  }
};

module.exports = {
  create,
  listPublic,
};
