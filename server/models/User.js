import { mysqlPool } from '../config/db.js';
import bcrypt from 'bcryptjs';

export const createUserTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('customer', 'admin') DEFAULT 'customer',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
  await mysqlPool.query(query);
};

export const User = {
  async findByEmail(email) {
    const [rows] = await mysqlPool.query('SELECT * FROM users WHERE email = ?', [email]);
    return rows[0];
  },

  async findById(id) {
    const [rows] = await mysqlPool.query('SELECT id, email, role, created_at FROM users WHERE id = ?', [id]);
    return rows[0];
  },

  async create({ email, password, role = 'customer' }) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await mysqlPool.query(
      'INSERT INTO users (email, password, role) VALUES (?, ?, ?)',
      [email, hashedPassword, role]
    );
    return { id: result.insertId, email, role };
  }
};
