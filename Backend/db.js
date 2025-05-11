const { Pool } = require('pg');
require('dotenv').config();

const db = new Pool({
  connectionString: process.env.DB_URL,
});

db.connect()
  .then(() => console.log('✅ PostgreSQL connected'))
  .catch((err) => console.error('❌ PostgreSQL connection error:', err));

module.exports = db;
