import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const { cart, clearCart } = useCart();
  const { currency, setCurrency, availableCurrencies, symbols } = useCurrency();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    clearCart();
    navigate('/');
    setMobileMenuOpen(false);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <nav className="glass" style={{
      position: 'sticky',
      top: 0,
      zIndex: 1000,
      padding: '0.85rem 0',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '2rem'
    }}>
      <div className="container" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        {/* Brand */}
        <Link to="/" onClick={() => setMobileMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '1.5rem' }}>⚡</span>
          <h1 style={{ fontSize: '1.25rem', margin: 0, letterSpacing: '0.1em' }} className="gradient-text">
            CustomTech
          </h1>
        </Link>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {/* Currency Selector (External Live API) */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.3rem',
            background: 'rgba(255,255,255,0.05)',
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>💱</span>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              style={{
                background: 'transparent',
                color: 'var(--text-primary)',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none'
              }}
              title="Live Currency Exchange Rate"
            >
              {availableCurrencies.map(cur => (
                <option key={cur} value={cur} style={{ background: '#18181b', color: '#fff' }}>
                  {cur} ({symbols[cur]})
                </option>
              ))}
            </select>
          </div>

          <Link to="/" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Store
          </Link>
          
          <Link to="/cart" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '1.25rem' }}>🛒</span>
            {totalItems > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-10px',
                background: 'var(--accent-cyan)',
                color: '#000',
                borderRadius: '50%',
                padding: '2px 6px',
                fontSize: '0.7rem',
                fontWeight: 'bold'
              }}>
                {totalItems}
              </span>
            )}
          </Link>

          {user ? (
            <>
              <Link to="/orders" style={{ fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
                My Orders
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="btn btn-secondary" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem' }}>
                  Admin Hub
                </Link>
              )}
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                👤 {user.name || user.email.split('@')[0]}
              </span>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.35rem 0.75rem', fontSize: '0.75rem', background: '#27272a' }}>
                Logout
              </button>
            </>
          ) : (
            <Link to="/login" className="btn btn-primary" style={{ padding: '0.45rem 1rem', fontSize: '0.75rem' }}>
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            color: '#fff',
            fontSize: '1.5rem',
            cursor: 'pointer'
          }}
        >
          {mobileMenuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          background: 'var(--bg-secondary)',
          borderTop: '1px solid var(--border-color)',
          marginTop: '0.85rem'
        }}>
          <Link to="/" onClick={() => setMobileMenuOpen(false)}>Store</Link>
          <Link to="/cart" onClick={() => setMobileMenuOpen(false)}>Cart ({totalItems})</Link>
          {user ? (
            <>
              <Link to="/orders" onClick={() => setMobileMenuOpen(false)}>My Orders</Link>
              {user.role === 'admin' && <Link to="/admin" onClick={() => setMobileMenuOpen(false)}>Admin Hub</Link>}
              <button onClick={handleLogout} className="btn btn-secondary" style={{ width: '100%' }}>Logout</button>
            </>
          ) : (
            <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="btn btn-primary">Sign In</Link>
          )}
        </div>
      )}
    </nav>
  );
}
