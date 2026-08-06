import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();
  const { user, token } = useAuth();
  const navigate = useNavigate();

  const [checkoutStatus, setCheckoutStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCheckout = async () => {
    if (!user) {
      navigate('/login?redirect=cart');
      return;
    }

    try {
      setLoading(true);
      const orderItems = cart.map(item => ({
        productId: item.product._id,
        name: item.product.name,
        price: item.itemPrice,
        quantity: item.quantity,
        selectedOptions: Object.entries(item.selectedOptions).reduce((acc, [optName, choice]) => {
          acc[optName] = choice.label;
          return acc;
        }, {})
      }));

      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          items: orderItems,
          totalPrice: getCartTotal()
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Checkout failed');
      }

      setCheckoutStatus('success');
      clearCart();
    } catch (err) {
      setCheckoutStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (checkoutStatus === 'success') {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }}>
          <span style={{ fontSize: '4rem' }}>🎉</span>
          <h2 style={{ margin: '1.5rem 0', color: 'var(--accent-cyan)' }}>Order Confirmed!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            Your custom configuration order has been securely saved in our system. Our engineering team is reviewing your specification sheet.
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
                  src={item.product.image}
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
                    ${(item.itemPrice * item.quantity).toLocaleString(undefined, { minimumFractionDigits: 2 })}
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
                ${getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700 }}>
              <span>Total</span>
              <span style={{ color: 'var(--accent-gold)' }}>
                ${getCartTotal().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            {checkoutStatus && checkoutStatus !== 'success' && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem' }}>{checkoutStatus}</div>
            )}

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem' }}
            >
              {loading ? 'Processing...' : user ? 'Submit Custom Order' : 'Login to Checkout'}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
