import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CurrencyProvider } from './context/CurrencyContext';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import ProductDetails from './pages/ProductDetails';
import Cart from './pages/Cart';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/AdminDashboard';

import MyOrders from './pages/MyOrders';

// Protected Route component for roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Security Session...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1 }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/products/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Customer Orders Route */}
          <Route path="/orders" element={
            <ProtectedRoute>
              <MyOrders />
            </ProtectedRoute>
          } />

          {/* Admin Protected Dashboard */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CurrencyProvider>
        <CartProvider>
          <Router>
            <AppContent />
          </Router>
        </CartProvider>
      </CurrencyProvider>
    </AuthProvider>
  );
}
