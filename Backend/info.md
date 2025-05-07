backend/
├── controllers/
│   ├── authController.js
│   └── roomController.js
├── models/
│   ├── userModel.js
│   └── roomModel.js
├── routes/
│   ├── authRoutes.js
│   └── roomRoutes.js
├── sockets/
│   └── roomSocket.js
├── middleware/
│   └── authMiddleware.js
├── db.js
├── server.js
├── .env
└── package.json

записная
База данных: таблица users
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL
);

БД: таблица rooms
CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_private BOOLEAN NOT NULL,
  password TEXT,
  host_id INTEGER REFERENCES users(id) ON DELETE CASCADE
);

