import { mysqlPool } from '../config/db.js';

export const createOrderTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      items JSON NOT NULL, -- list of items with their configurations and prices
      total_price DECIMAL(10, 2) NOT NULL,
      status VARCHAR(50) DEFAULT 'Pending',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `;
  await mysqlPool.query(query);
};

export const Order = {
  async create({ userId, items, totalPrice }) {
    const [result] = await mysqlPool.query(
      'INSERT INTO orders (user_id, items, total_price) VALUES (?, ?, ?)',
      [userId, JSON.stringify(items), totalPrice]
    );
    return { id: result.insertId, userId, items, totalPrice, status: 'Pending' };
  },

  async findByUserId(userId) {
    const [rows] = await mysqlPool.query('SELECT * FROM orders WHERE user_id = ? ORDER BY created_at DESC', [userId]);
    return rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
  },

  async findAll() {
    const [rows] = await mysqlPool.query(`
      SELECT o.*, u.name as user_name, u.email as user_email 
      FROM orders o 
      JOIN users u ON o.user_id = u.id 
      ORDER BY o.created_at DESC
    `);
    return rows.map(row => ({
      ...row,
      items: JSON.parse(row.items)
    }));
  },

  async updateStatus(id, status) {
    await mysqlPool.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
    return { id, status };
  }
};
