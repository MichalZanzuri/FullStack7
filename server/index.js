import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { connectMySQL, connectMongoDB } from './config/db.js';
import { createUserTable } from './models/User.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Initialize Databases
const initDBs = async () => {
  await connectMySQL();
  await connectMongoDB();
  
  // Create tables in MySQL if not exist
  try {
    await createUserTable();
    console.log('MySQL User table initialized.');
  } catch (err) {
    console.error('Failed to initialize MySQL database tables:', err.message);
  }
};

initDBs();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Premium Customizable E-commerce API Boilerplate is running.' });
});

// Global error-handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
