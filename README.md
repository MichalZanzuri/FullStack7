# ⚡ CostumTech - Premium Customizable E-Commerce Platform

Welcome to **CostumTech**, a state-of-the-art full-stack web application designed for configuration and purchase of premium custom-built tech gear and mechanical products (such as high-fidelity audio headphones, mechanical keyboards, luxury smartwatches, and commuter bags).

The application features a sleek, high-end dark-themed UI built using modern design principles (Glassmorphism, custom glowing accents, interactive animations, and responsive structures).

---

## 🛠️ Tech Stack & Architecture

This repository uses a robust and scalable dual-database architecture:

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | **React (Vite)** | Modern single-page UI, custom CSS variables, and clean component architecture. |
| **Backend** | **Node.js + Express** | High-performance modular REST API. |
| **Catalog Database** | **MongoDB (Mongoose)** | Flexible schema for customizable products and option choices. |
| **Transactional Database** | **MySQL (mysql2)** | Relational database for robust management of Users and Orders. |

---

## ✨ Premium Features

- 🏎️ **Live Customization Options**: Dynamically configure product options (color finishes, cushion materials, mechanical switches, straps) with real-time price modifier updates.
- 🛒 **Interactive Specs Sheet (Cart)**: Preview and edit your custom specifications sheet, including item quantity adjustments and pricing totals.
- 💳 **Secure Checkout & payment Simulator**:
  - Live-rendered interactive credit card graphic.
  - Form validation and smart field formatters (credit card spacing, expiry date `MM/YY`).
  - Animated multi-stage payment clearance simulation.
- 🔐 **Role-based Authentication**: JWT authentication with protected routes for Customers and Administrators.
- 📊 **Admin Dashboard**: Comprehensive order tracking, status updates, and catalog statistics.
- 💬 **WhatsApp Quick Connect**: One-click integrated floating button for direct customer service communication.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16+)
- [MongoDB](https://www.mongodb.com/) (Local instance or Atlas connection URI)
- [MySQL](https://www.mysql.com/) (Database instance running locally or hosted)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/MichalZanzuri/FullStack7.git
   cd FullStack7
   ```

2. **Configure Environment Variables**:
   In the `/server` directory, create a `.env` file based on `.env.example`:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27015/ecommerce
   JWT_SECRET=your_jwt_secret_key
   MYSQL_HOST=localhost
   MYSQL_USER=root
   MYSQL_PASSWORD=your_mysql_password
   MYSQL_DATABASE=ecommerce_db
   ```

---

### Running the Project

#### 1. Start the Backend Server
Navigate to the `/server` directory and run the initialization command:
```bash
cd server
npm install
node index.js
```
*(On startup, the server automatically connects to MongoDB, seeds the catalog if empty, creates tables in MySQL, and registers a default Admin account: `admin@store.com` / `admin`)*

#### 2. Start the Client Application
Navigate to the `/client` directory and launch the dev environment:
```bash
cd client
npm install
cmd /c npm run dev
```
Open [http://localhost:3000/](http://localhost:3000/) in your browser to experience the application.

---

## 📂 Project Structure

```
├── client/                     # React Frontend
│   ├── src/
│   │   ├── components/         # Reusable layouts (Navbar, ProductCard)
│   │   ├── context/            # Auth, Cart, and Currency providers
│   │   ├── pages/              # View pages (Home, Cart, Checkout, MyOrders, AdminDashboard)
│   │   ├── App.jsx             # Routes setup
│   │   └── index.css           # Custom Glassmorphism design system & variables
│   └── package.json
│
└── server/                     # Express Backend
    ├── config/                 # Database configurations (MySQL & MongoDB)
    ├── controllers/            # Route controllers
    ├── middlewares/            # Authentication & error validation middlewares
    ├── models/                 # Database models & schemas
    ├── routes/                 # Express Router modules
    ├── index.js                # Server entry point
    └── package.json
```

---

## 🔒 Security & Verification

All customer routes `/orders`, `/checkout`, and admin actions `/admin` are protected by JWT tokens. The payment page features verification checking to guarantee only valid card specifications proceed to the database.
