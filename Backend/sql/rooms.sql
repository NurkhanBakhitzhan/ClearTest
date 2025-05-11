CREATE TABLE rooms (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  is_private BOOLEAN DEFAULT FALSE,
  password TEXT,
  host_id INTEGER REFERENCES users(id)
);
