import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }
    navigate('/checkout');
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2 style={{ margin: '1.5rem 0', color: 'var(--accent-cyan)' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your custom configuration order has been securely saved in our MySQL database. Our engineering team is reviewing your specification sheet.
          </p>
          <Link to="/" className="btn btn-primary">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }}>Your Specifications Sheet</h2>

      {cart.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No custom builds added yet.</p>
          <Link to="/" className="btn btn-primary">Browse Catalog</Link>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
          
          {/* Cart items list */}
          <div style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {cart.map(item => (
              <div key={item.cartItemId} className="glass-card" style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                <img
                  src={item.product.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'}
                  alt={item.product.name}
                  style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: 'var(--radius-sm)' }}
                />
                
                <div style={{ flexGrow: 1 }}>
                  <h3 style={{ fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.product.name}</h3>
                  
                  {/* Selected configuration specifications */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    {Object.entries(item.selectedOptions).map(([optName, choice]) => (
                      <span key={optName} style={{
                        fontSize: '0.7rem',
                        background: 'rgba(255,255,255,0.05)',
                        border: '1px solid var(--border-color)',
                        padding: '2px 8px',
                        borderRadius: '10px',
                        color: 'var(--text-secondary)'
                      }}>
                        {optName}: <strong style={{ color: 'var(--accent-cyan)' }}>{choice.label}</strong>
                      </span>
                    ))}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)' }} onClick={() => updateQuantity(item.cartItemId, item.quantity - 1)}>-</button>
                      <span style={{ fontSize: '0.9rem', fontWeight: 600 }}>{item.quantity}</span>
                      <button className="btn" style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-tertiary)' }} onClick={() => updateQuantity(item.cartItemId, item.quantity + 1)}>+</button>
                    </div>

                    <button onClick={() => removeFromCart(item.cartItemId)} style={{
                      background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: 700
                    }}>
                      Remove
                    </button>
                  </div>
                </div>

                <div style={{ textAlign: 'right', minWidth: '100px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>
                    {formatPrice(item.itemPrice * item.quantity)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Summary / Checkout Panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span style={{ fontWeight: 600 }}>
                {formatPrice(getCartTotal())}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-gold)' }}>
                {formatPrice(getCartTotal())}
              </span>
            </div>

            {checkoutStatus && checkoutStatus !== 'success' && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{checkoutStatus}</div>
            )}

            <button
              onClick={handleCheckout}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem' }}
            >
              {user ? 'המשך לתשלום 💳' : 'Login to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
