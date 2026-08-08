import { mysqlPool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) DEFAULT 'User',
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await mysqlPool.query(query);

  // If table already existed without name column, add it safely
  try {
    const [cols] = await mysqlPool.query("SHOW COLUMNS FROM users LIKE 'name'");
    if (cols.length === 0) {
      await mysqlPool.query("ALTER TABLE users ADD COLUMN name VARCHAR(255) DEFAULT 'User' AFTER id");
    }
  } catch (err) {
    console.error('Error ensuring name column exists:', err.message);
  }
};

export const User = {
  async findByEmail(email) {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await mysqlPool.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ name, email, password, role = 'customer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await mysqlPool.query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name || 'User', email, hashedPassword, role]
    );
    return { id: result.insertId, name: name || 'User', email, role };
  }
};
