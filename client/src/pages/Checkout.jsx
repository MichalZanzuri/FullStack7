import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function Checkout() {
  const { cart, getCartTotal, clearCart } = useCart();
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const navigate = useNavigate();

  // Form states
  const [shipping, setShipping] = useState({
    fullName: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const [payment, setPayment] = useState({
    cardholderName: '',
    cardNumber: '',
    expiry: '',
    cvv: ''
  });

  // UI state
  const [loading, setLoading] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (cart.length === 0 && !isSuccess) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="glass-card" style={{ maxWidth: '500px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '1.5rem' }}>Shopping Cart is Empty</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Cannot checkout without any items in the cart.</p>
          <Link to="/" className="btn btn-primary">Back to Catalog</Link>
        </div>
      </div>
    );
  }

  // Auto-format card number: 1234 5678 1234 5678
  const handleCardNumberChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    const matches = value.match(/.{1,4}/g);
    const formatted = matches ? matches.join(' ') : '';
    setPayment({ ...payment, cardNumber: formatted });
  };

  // Auto-format expiry: MM/YY
  const handleExpiryChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 4) value = value.slice(0, 4);
    if (value.length > 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setPayment({ ...payment, expiry: value });
  };

  // Auto-format CVV: 3 digits
  const handleCvvChange = (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 3) value = value.slice(0, 3);
    setPayment({ ...payment, cvv: value });
  };

  const handleInputChange = (e, section) => {
    const { name, value } = e.target;
    if (section === 'shipping') {
      setShipping({ ...shipping, [name]: value });
    } else {
      setPayment({ ...payment, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Basic Validation
    if (!shipping.fullName || !shipping.phone || !shipping.address || !shipping.city) {
      setError('Please fill all required shipping fields.');
      return;
    }
    if (!payment.cardholderName || payment.cardNumber.replace(/\s/g, '').length !== 16 || payment.expiry.length !== 5 || payment.cvv.length !== 3) {
      setError('Please ensure all credit card details are valid and complete.');
      return;
    }

    setLoading(true);
    
    // Simulate Premium Payment Processing Steps
    const stepsList = [
      'Verifying credit card details...',
      'Establishing secure connection to gateway...',
      'Authorizing transaction with card issuer...',
      'Saving your order in our database...'
    ];

    for (let i = 0; i < stepsList.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 1200));
    }

    // Submit Order to backend API
    try {
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
        throw new Error(data.message || 'Failed to create order on server.');
      }

      setIsSuccess(true);
      clearCart();
    } catch (err) {
      setError(err.message || 'An error occurred during order submission. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const stepsList = [
    'Verifying credit card details...',
    'Establishing secure connection to gateway...',
    'Authorizing transaction with card issuer...',
    'Saving your order in our database...'
  ];

  if (isSuccess) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
        <div className="glass-card" style={{ maxWidth: '600px', margin: '0 auto', border: '1px solid var(--accent-cyan)' }}>
          <span style={{ fontSize: '5rem', display: 'block', marginBottom: '1rem' }}>🎉</span>
          <h2 style={{ margin: '1.5rem 0', color: 'var(--accent-cyan)', fontSize: '2rem' }}>Payment Completed Successfully!</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '1.1rem' }}>
            Your order has been successfully placed and saved in the system.
          </p>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem' }}>
            Our engineering and support team has started reviewing your custom specification.
          </p>
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
            <Link to="/orders" className="btn btn-primary">My Orders</Link>
            <Link to="/" className="btn btn-secondary">Back to Catalog</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ color: 'var(--accent-cyan)' }}>🛒</span> Secure Checkout & Payment
      </h2>

      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '5rem 2rem', maxWidth: '600px', margin: '0 auto' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(6, 182, 212, 0.1)',
            borderTopColor: 'var(--accent-cyan)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 2rem'
          }} />
          <h3 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>Processing Secure Payment</h3>
          <p style={{ color: 'var(--accent-cyan)', fontSize: '1.1rem', fontWeight: 600, minHeight: '1.5rem' }}>
            {stepsList[processingStep]}
          </p>
          <div style={{
            width: '100%',
            height: '4px',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '2px',
            marginTop: '2rem',
            overflow: 'hidden',
            position: 'relative'
          }}>
            <div style={{
              position: 'absolute',
              height: '100%',
              background: 'var(--accent-cyan)',
              width: `${((processingStep + 1) / stepsList.length) * 100}%`,
              transition: 'width 0.8s ease-in-out'
            }} />
          </div>
        </div>
      ) : (
        <div className="grid grid-3" style={{ gap: '2rem', alignItems: 'start' }}>
          {/* Form details */}
          <form onSubmit={handleSubmit} style={{ gridColumn: 'span 2', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            {/* Shipping section */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                🚚 Shipping & Contact Details
              </h3>
              
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={shipping.fullName}
                  onChange={(e) => handleInputChange(e, 'shipping')}
                  className="form-input"
                  required
                  placeholder="John Doe"
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={shipping.phone}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    className="form-input"
                    required
                    placeholder="050-1234567"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={shipping.city}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    className="form-input"
                    required
                    placeholder="New York"
                  />
                </div>
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Shipping Address (Street & House No.)</label>
                  <input
                    type="text"
                    name="address"
                    value={shipping.address}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    className="form-input"
                    required
                    placeholder="100 Broadway St"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">ZIP Code (Optional)</label>
                  <input
                    type="text"
                    name="zip"
                    value={shipping.zip}
                    onChange={(e) => handleInputChange(e, 'shipping')}
                    className="form-input"
                    placeholder="10001"
                  />
                </div>
              </div>
            </div>

            {/* Payment Section */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <h3 style={{ fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem', color: 'var(--accent-cyan)' }}>
                💳 Credit Card Details
              </h3>

              {/* Styled Interactive Card Graphic */}
              <div style={{
                background: 'linear-gradient(135deg, #1e1e24 0%, #06b6d4 100%)',
                borderRadius: '12px',
                padding: '1.5rem',
                color: '#fff',
                position: 'relative',
                boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
                height: '180px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                marginBottom: '1rem',
                border: '1px solid rgba(255,255,255,0.1)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', letterSpacing: '0.1rem', opacity: 0.8, fontFamily: 'var(--font-display)' }}>COSTUMTECH PREMIUM CARD</span>
                  <svg width="40" height="25" viewBox="0 0 50 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="15" cy="15" r="15" fill="#EB001B" fillOpacity="0.8"/>
                    <circle cx="35" cy="15" r="15" fill="#F79E1B" fillOpacity="0.8"/>
                  </svg>
                </div>
                
                <div style={{ fontSize: '1.3rem', letterSpacing: '2px', fontFamily: 'var(--font-display)', margin: '1rem 0' }}>
                  {payment.cardNumber || '•••• •••• •••• ••••'}
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.6rem', opacity: 0.6 }}>CARDHOLDER NAME</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{payment.cardholderName.toUpperCase() || 'CARDHOLDER NAME'}</span>
                  </div>
                  <div>
                    <span style={{ display: 'block', fontSize: '0.6rem', opacity: 0.6 }}>EXPIRY</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{payment.expiry || 'MM/YY'}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Cardholder Name</label>
                <input
                  type="text"
                  name="cardholderName"
                  value={payment.cardholderName}
                  onChange={(e) => handleInputChange(e, 'payment')}
                  className="form-input"
                  required
                  placeholder="JOHN DOE"
                  style={{ textTransform: 'uppercase' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Card Number</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={payment.cardNumber}
                  onChange={handleCardNumberChange}
                  className="form-input"
                  required
                  placeholder="1234 5678 1234 5678"
                />
              </div>

              <div className="grid grid-2" style={{ gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Expiry Date (MM/YY)</label>
                  <input
                    type="text"
                    name="expiry"
                    value={payment.expiry}
                    onChange={handleExpiryChange}
                    className="form-input"
                    required
                    placeholder="MM/YY"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">CVV (3 Digits)</label>
                  <input
                    type="text"
                    name="cvv"
                    value={payment.cvv}
                    onChange={handleCvvChange}
                    className="form-input"
                    required
                    placeholder="123"
                  />
                </div>
              </div>
            </div>

          </form>

          {/* Checkout Summary panel */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-cyan)' }}>Order Summary</h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: '200px', overflowY: 'auto', paddingLeft: '5px' }}>
              {cart.map(item => (
                <div key={item.cartItemId} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', borderBottom: '1px solid rgba(255,255,255,0.03)', paddingBottom: '0.5rem' }}>
                  <div>
                    <span style={{ fontWeight: 600 }}>{item.product.name}</span>
                    <span style={{ color: 'var(--text-secondary)', marginRight: '0.5rem' }}>x{item.quantity}</span>
                  </div>
                  <span>{formatPrice(item.itemPrice * item.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span style={{ color: 'var(--text-secondary)' }}>Subtotal</span>
              <span>{formatPrice(getCartTotal())}</span>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 700, borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
              <span>Total Price</span>
              <span style={{ color: 'var(--accent-gold)' }}>{formatPrice(getCartTotal())}</span>
            </div>

            {error && (
              <div style={{ color: 'var(--accent-red)', fontSize: '0.85rem', textAlign: 'left' }}>⚠️ {error}</div>
            )}

            <button
              onClick={handleSubmit}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', marginTop: '0.5rem' }}
            >
              Place Secure Order
            </button>
            
            <Link to="/cart" style={{ textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-secondary)', textDecoration: 'underline' }}>
              Back to edit cart
            </Link>
          </div>

        </div>
      )}
      
      {/* Dynamic Keyframe Animations for Checkout Loading & Card styling */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
