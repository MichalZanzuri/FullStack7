import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { connectMySQL, connectMongoDB } from './config/db.js';
import { createUserTable, User } from './models/User.js';
import { createOrderTable } from './models/Order.js';
import { Product } from './models/Product.js';
import { errorHandler } from './middlewares/errorHandler.js';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Seed sample customizable products if DB is empty
const seedProducts = async () => {
  try {
    const count = await Product.countDocuments();
    if (count === 0) {
      console.log('Seeding initial customizable products...');
      const sampleProducts = [
        {
          name: 'AeroForge Wireless Noise-Cancelling Headphones',
          description: 'High-fidelity audio with customizable acoustic profiles, ear cushions, and headband finishes.',
          price: 299,
          category: 'Audio',
          image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80',
          stock: 25,
          customizationOptions: [
            {
              name: 'Color Finish',
              choices: [
                { label: 'Midnight Black', priceModifier: 0 },
                { label: 'Brushed Titanium', priceModifier: 30 },
                { label: 'Rose Gold Accent', priceModifier: 45 }
              ]
            },
            {
              name: 'Ear Cushion Material',
              choices: [
                { label: 'Memory Foam Breathable Mesh', priceModifier: 0 },
                { label: 'Cooling-Gel Infused Velour', priceModifier: 25 },
                { label: 'Italian Top-Grain Leather', priceModifier: 50 }
              ]
            },
            {
              name: 'Custom Engraving',
              choices: [
                { label: 'None', priceModifier: 0 },
                { label: 'Laser-Etched Monogram', priceModifier: 15 }
              ]
            }
          ]
        },
        {
          name: 'Titan Mechanical Ergonomic Keyboard',
          description: 'Custom gasket-mounted mechanical keyboard with swappable switches and artisan keycaps.',
          price: 179,
          category: 'Work & Gaming',
          image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&auto=format&fit=crop&q=80',
          stock: 18,
          customizationOptions: [
            {
              name: 'Switch Type',
              choices: [
                { label: 'Linear Silent Red', priceModifier: 0 },
                { label: 'Tactile Holy Panda', priceModifier: 20 },
                { label: 'Clicky Jade Box', priceModifier: 15 }
              ]
            },
            {
              name: 'Keycap Colorway',
              choices: [
                { label: 'Cyberpunk Neon Dark', priceModifier: 0 },
                { label: 'Retro 80s Cream', priceModifier: 15 },
                { label: 'Handcrafted Walnut Wood', priceModifier: 45 }
              ]
            },
            {
              name: 'Case Material',
              choices: [
                { label: 'Polycarbonate Frosted', priceModifier: 0 },
                { label: 'CNC Anodized Aluminum', priceModifier: 50 }
              ]
            }
          ]
        },
        {
          name: 'Luminary Chronograph Smartwatch',
          description: 'Precision luxury timepiece featuring OLED sapphire touch display and modular designer straps.',
          price: 349,
          category: 'Wearables',
          image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80',
          stock: 12,
          customizationOptions: [
            {
              name: 'Bezel & Case',
              choices: [
                { label: 'Space Gray Aluminum', priceModifier: 0 },
                { label: 'Mirror Stainless Steel', priceModifier: 60 },
                { label: 'Matte Forged Carbon', priceModifier: 110 }
              ]
            },
            {
              name: 'Strap Style',
              choices: [
                { label: 'Sport Active Silicone', priceModifier: 0 },
                { label: 'Magnetic Milanese Mesh', priceModifier: 40 },
                { label: 'Vintage Tuscan Leather', priceModifier: 65 }
              ]
            },
            {
              name: 'Connectivity',
              choices: [
                { label: 'Bluetooth & GPS', priceModifier: 0 },
                { label: 'Standalone 5G eSIM Cellular', priceModifier: 70 }
              ]
            }
          ]
        },
        {
          name: 'Vanguard Modular EDC Backpack',
          description: 'Weatherproof modular commuter pack with magnetic FIDLOCK attachments and configurable compartments.',
          price: 149,
          category: 'Gear & Bags',
          image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80',
          stock: 30,
          customizationOptions: [
            {
              name: 'Fabric Type',
              choices: [
                { label: '1000D Cordura Waterproof', priceModifier: 0 },
                { label: 'Waxed Heritage Canvas', priceModifier: 35 },
                { label: 'X-Pac Ultra-Lightweight Laminate', priceModifier: 50 }
              ]
            },
            {
              name: 'Modular Attachment',
              choices: [
                { label: 'Standard Laptop Sleeve (16")', priceModifier: 0 },
                { label: 'Padded DSLR Camera Core', priceModifier: 40 },
                { label: 'Thermal Hydration Pack', priceModifier: 30 }
              ]
            }
          ]
        }
      ];
      await Product.insertMany(sampleProducts);
      console.log('Sample products seeded successfully.');
    }
  } catch (err) {
    console.error('Error seeding products:', err.message);
  }
};

// Initialize Databases
const initDBs = async () => {
  await connectMySQL();
  await connectMongoDB();
  
  // Create tables in MySQL if not exist
  try {
    await createUserTable();
    await createOrderTable();
    console.log('MySQL Tables (users & orders) initialized.');

    // Seed default admin user if not exists
    const adminUser = await User.findByEmail('admin@store.com');
    if (!adminUser) {
      await User.create({
        name: 'Store Admin',
        email: 'admin@store.com',
        password: 'admin',
        role: 'admin'
      });
      console.log('Default admin created: admin@store.com / admin');
    }
  } catch (err) {
    console.error('Failed to initialize MySQL database tables:', err.message);
  }

  // Seed initial products in MongoDB
  await seedProducts();
};

initDBs();

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/upload', uploadRoutes);

// Root test endpoint
app.get('/', (req, res) => {
  res.json({ message: 'Premium Customizable E-commerce API is running.' });
});

// Global error-handling middleware
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
