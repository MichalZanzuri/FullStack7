import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function MyOrders() {
  const { token, user } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      fetch('/api/orders/myorders', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to load orders');
          return res.json();
        })
        .then(data => {
          setOrders(data);
          setLoading(false);
        })
        .catch(err => {
          setError(err.message);
          setLoading(false);
        });
    }
  }, [token]);

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem' }} className="gradient-text">My Orders History</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            Track and view your custom build configurations ({user?.name || user?.email})
          </p>
        </div>
        <Link to="/" className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
          Back to Store
        </Link>
      </div>

      {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your orders...</div>}
      {error && <div style={{ color: 'var(--accent-red)', padding: '2rem' }}>{error}</div>}

      {!loading && !error && orders.length === 0 && (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <span style={{ fontSize: '3rem', display: 'block', marginBottom: '1rem' }}>📦</span>
          <h3 style={{ marginBottom: '0.5rem' }}>No orders placed yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            You haven't configured any custom orders yet. Browse our catalog to start building!
          </p>
          <Link to="/" className="btn btn-primary">
            Explore Catalog
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {orders.map(order => (
          <div key={order.id} className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              paddingBottom: '1rem',
              marginBottom: '1rem',
              flexWrap: 'wrap',
              gap: '0.5rem'
            }}>
              <div>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>Order #{order.id}</span>
                <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginLeft: '1rem' }}>
                  {new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  background: order.status === 'Pending' ? '#d97706' : order.status === 'Processing' ? '#2563eb' : '#16a34a',
                  color: '#fff',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {order.status}
                </span>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-gold)' }}>
                  {formatPrice(order.total_price)}
                </span>
              </div>
            </div>

            {/* Items list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {Array.isArray(order.items) && order.items.map((item, idx) => (
                <div key={idx} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: 'rgba(255,255,255,0.02)',
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(255,255,255,0.05)'
                }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                      {item.quantity}x {item.name}
                    </div>
                    {item.selectedOptions && Object.keys(item.selectedOptions).length > 0 && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.3rem' }}>
                        {Object.entries(item.selectedOptions).map(([opt, choice]) => (
                          <span key={opt} style={{
                            fontSize: '0.7rem',
                            color: 'var(--accent-cyan)',
                            background: 'rgba(6, 182, 212, 0.1)',
                            padding: '2px 6px',
                            borderRadius: '4px'
                          }}>
                            {opt}: <strong>{choice}</strong>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
