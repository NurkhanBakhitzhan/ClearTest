const db = require('./db');

(async () => {
  try {
    const result = await db.query('SELECT NOW()');
    console.log('🕒 Время на сервере БД:', result.rows[0].now);
    process.exit();
  } catch (err) {
    console.error('❌ Ошибка запроса:', err);
    process.exit(1);
  }
})();
