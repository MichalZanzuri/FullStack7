import mysql from 'mysql2/promise';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// MySQL connection pool
export const mysqlPool = mysql.createPool({
  host: process.env.MYSQL_HOST || '127.0.0.1',
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD !== undefined ? process.env.MYSQL_PASSWORD : '',
  database: process.env.MYSQL_DATABASE || 'ecommerce_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Test MySQL connection
export const connectMySQL = async () => {
  try {
    const connection = await mysqlPool.getConnection();
    console.log('MySQL Connected successfully.');
    connection.release();
  } catch (error) {
    console.error('MySQL connection error:', error.message);
  }
};

// MongoDB connection
export const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce_customizable');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};
