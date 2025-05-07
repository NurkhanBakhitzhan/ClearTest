const db = require('../db');

const createRoom = async ({ name, isPrivate, password, hostId }) => {
  const result = await db.query(
    `INSERT INTO rooms (name, is_private, password, host_id)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, isPrivate, password || null, hostId]
  );
  return result.rows[0];
};

const getAllPublicRooms = async () => {
  const result = await db.query(
    `SELECT id, name FROM rooms WHERE is_private = false`
  );
  return result.rows;
};

const getRoomById = async (id) => {
  const result = await db.query(
    `SELECT * FROM rooms WHERE id = $1`,
    [id]
  );
  return result.rows[0];
};

const deleteRoom = async (id) => {
  await db.query(`DELETE FROM rooms WHERE id = $1`, [id]);
};

module.exports = {
  createRoom,
  getAllPublicRooms,
  getRoomById,
  deleteRoom,
};
