const sqlite3 = require('sqlite3');
const crypto = require('crypto');
const fs = require('fs');

fs.mkdirSync('.db/', { recursive: true });

const db = new sqlite3.Database('.db/space_blog.db');

// create db if not exists
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
        username TEXT UNIQUE,
        fullname TEXT,
        password_hash BLOB,
        salt BLOB
    )`);

  db.run(`CREATE TABLE IF NOT EXISTS posts (
        owner_id INTEGER UNIQUE,
        title TEXT,
        content TEXT
    )`);

  // add admin user
  const salt = crypto.randomBytes(16);
  db.run('INSERT OR IGNORE INTO users (username, password_hash, salt) VALUES (?, ?, ?)', [
    process.env.ADMIN_USERNAME,
    crypto.pbkdf2Sync(process.env.ADMIN_PASSWORD, salt, 310000, 32, 'sha256'),
    salt
  ]);
});

module.exports = db;