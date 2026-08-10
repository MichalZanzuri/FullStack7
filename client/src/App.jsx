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

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/972500000000"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          width: '3.5rem',
          height: '3.5rem',
          backgroundColor: '#25D366',
          borderRadius: '50%',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          color: '#ffffff',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
          cursor: 'pointer',
          zIndex: 9999,
          transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
          textDecoration: 'none'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.15)';
          e.currentTarget.style.boxShadow = '0 6px 16px rgba(37, 211, 102, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
        title="Chat with us on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="#ffffff"
        >
          <path d="M12.031 2c-5.523 0-10 4.477-10 10 0 1.775.463 3.44 1.272 4.898L2.031 22l5.244-1.237a9.92 9.92 0 004.756 1.206c5.522 0 10-4.477 10-10s-4.478-10-10-10zm0 18.334c-1.576 0-3.13-.408-4.5-1.185l-.323-.183-3.143.74.753-3.036-.204-.316c-.827-1.285-1.263-2.778-1.263-4.321 0-4.41 3.59-8 8-8s8 3.59 8 8-3.59 8-8 8zm4.846-6.626c-.266-.134-1.573-.775-1.817-.863-.243-.087-.42-.132-.596.133-.176.264-.68.863-.833 1.04-.153.176-.307.198-.573.065a7.228 7.228 0 01-2.128-1.313 7.978 7.978 0 01-1.472-1.832c-.156-.266-.017-.41.117-.543.12-.12.266-.31.4-.464.133-.155.177-.265.265-.443.089-.177.045-.332-.022-.464-.067-.133-.596-1.436-.817-1.967-.215-.518-.432-.448-.596-.456-.154-.008-.33-.008-.507-.008a.979.979 0 00-.707.33c-.243.266-.928.907-.928 2.21 0 1.303.948 2.56 1.08 2.738.132.176 1.866 2.85 4.52 3.994.63.272 1.123.435 1.508.558.634.2 1.21.172 1.666.105.508-.077 1.573-.64 1.794-1.26.22-.617.22-1.147.155-1.258-.067-.11-.243-.199-.51-.333z" />
        </svg>
      </a>
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
