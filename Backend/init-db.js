// init-db.js
const fs = require('fs');
const path = require('path');
const db = require('./db');

async function runMigrations() {
  const files = ['users.sql', 'sessions.sql'];

  for (const file of files) {
    const filePath = path.join(__dirname, 'sql', file);
    const query = fs.readFileSync(filePath, 'utf-8');
    console.log(`🟡 Running ${file}...`);
    await db.query(query);
    console.log(`✅ ${file} applied.`);
  }

  process.exit();
}

runMigrations().catch((err) => {
  console.error('❌ Migration error:', err);
  process.exit(1);
});
