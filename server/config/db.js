import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// In-Memory database for fallback
export const mockDb = {
  users: [],
  orders: [],
  userIdCounter: 1,
  orderIdCounter: 1
};

// Mock MySQL Pool
const mockMysqlPool = {
  async query(sql, params = []) {
    const lowerSql = sql.toLowerCase().trim();
    
    // CREATE TABLE
    if (lowerSql.startsWith('create table')) {
      return [{}];
    }
    
    // ALTER TABLE
    if (lowerSql.startsWith('alter table')) {
      return [{}];
    }

    // SHOW COLUMNS FROM users LIKE 'name'
    if (lowerSql.includes('show columns') && lowerSql.includes('users') && lowerSql.includes('name')) {
      return [[{ Field: 'name' }]];
    }

    // SELECT * FROM users WHERE email = ?
    if (lowerSql.startsWith('select * from users where email =')) {
      const email = params[0];
      const user = mockDb.users.find(u => u.email === email);
      return [user ? [user] : []];
    }

    // SELECT id, name, email, role, created_at FROM users WHERE id = ?
    if (lowerSql.startsWith('select id, name, email, role, created_at from users where id =')) {
      const id = Number(params[0]);
      const user = mockDb.users.find(u => u.id === id);
      if (user) {
        return [[{ id: user.id, name: user.name, email: user.email, role: user.role, created_at: user.created_at }]];
      }
      return [[]];
    }

    // INSERT INTO users
    if (lowerSql.startsWith('insert into users')) {
      const id = mockDb.userIdCounter++;
      const user = {
        id,
        name: params[0] || 'User',
        email: params[1],
        password: params[2],
        role: params[3] || 'customer',
        created_at: new Date()
      };
      mockDb.users.push(user);
      return [{ insertId: id }];
    }

    // INSERT INTO orders
    if (lowerSql.startsWith('insert into orders')) {
      const id = mockDb.orderIdCounter++;
      const order = {
        id,
        user_id: Number(params[0]),
        items: params[1],
        total_price: params[2],
        status: 'Pending',
        created_at: new Date()
      };
      mockDb.orders.push(order);
      return [{ insertId: id }];
    }

    // SELECT * FROM orders WHERE user_id = ?
    if (lowerSql.startsWith('select * from orders where user_id =')) {
      const userId = Number(params[0]);
      const filtered = mockDb.orders.filter(o => o.user_id === userId)
        .sort((a, b) => b.created_at - a.created_at);
      return [filtered];
    }

    // SELECT o.*, u.name as user_name, u.email as user_email FROM orders JOIN users
    if (lowerSql.includes('select o.*, u.name') && lowerSql.includes('join users')) {
      const joined = mockDb.orders.map(o => {
        const u = mockDb.users.find(user => user.id === o.user_id) || {};
        return {
          ...o,
          user_name: u.name || 'Unknown',
          user_email: u.email || 'unknown@store.com'
        };
      }).sort((a, b) => b.created_at - a.created_at);
      return [joined];
    }

    // UPDATE orders SET status = ? WHERE id = ?
    if (lowerSql.startsWith('update orders set status =')) {
      const status = params[0];
      const id = Number(params[1]);
      const order = mockDb.orders.find(o => o.id === id);
      if (order) {
        order.status = status;
      }
      return [{}];
    }

    return [[]];
  },
  
  async getConnection() {
    return {
      release() {}
    };
  }
};

// Real MySQL pool
let realPool = null;
try {
  realPool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '',
    database: process.env.MYSQL_DATABASE || 'ecommerce_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });
} catch (e) {
  console.log('Could not initialize MySQL pool, falling back to mock.');
}

// Exported mysqlPool wrapper
export const mysqlPool = {
  async query(sql, params) {
    if (process.env.USE_MOCK_MYSQL === 'true' || !realPool) {
      return mockMysqlPool.query(sql, params);
    }
    try {
      return await realPool.query(sql, params);
    } catch (err) {
      console.error('MySQL real query failed, falling back to mock database:', err.message);
      process.env.USE_MOCK_MYSQL = 'true';
      return mockMysqlPool.query(sql, params);
    }
  },
  async getConnection() {
    if (process.env.USE_MOCK_MYSQL === 'true' || !realPool) {
      return mockMysqlPool.getConnection();
    }
    try {
      return await realPool.getConnection();
    } catch (err) {
      process.env.USE_MOCK_MYSQL = 'true';
      return mockMysqlPool.getConnection();
    }
  }
};

// Test MySQL connection
export const connectMySQL = async () => {
  if (process.env.USE_MOCK_MYSQL === 'true' || !realPool) {
    console.log('MySQL using In-Memory Fallback.');
    return;
  }
  try {
    const connection = await realPool.getConnection();
    console.log('MySQL Connected successfully.');
    connection.release();
  } catch (error) {
    console.error('MySQL connection error, falling back to In-Memory:', error.message);
    process.env.USE_MOCK_MYSQL = 'true';
  }
};

// MongoDB connection
export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_customizable', {
      serverSelectionTimeoutMS: 2000 // Quick timeout to fallback fast
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error, falling back to In-Memory: ${error.message}`);
    process.env.USE_MOCK_MONGODB = 'true';
  }
};
