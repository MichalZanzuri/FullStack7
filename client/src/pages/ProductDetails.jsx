import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOptions, setSelectedOptions] = useState({});

  useEffect(() => {
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        setProduct(data);
        // Set default choices
        const defaults = {};
        data.customizationOptions?.forEach(opt => {
          if (opt.choices && opt.choices.length > 0) {
            defaults[opt.name] = opt.choices[0]; // first choice default
          }
        });
        setSelectedOptions(defaults);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleOptionChange = (optionName, choice) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: choice
    }));
  };

  const calculateTotalPrice = () => {
    if (!product) return 0;
    const optionCost = Object.values(selectedOptions).reduce((acc, curr) => acc + curr.priceModifier, 0);
    return product.price + optionCost;
  };

  const handleAddToCart = () => {
    addToCart(product, selectedOptions, 1);
    navigate('/cart');
  };

  if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading customization engine...</div>;
  if (error) return <div className="container" style={{ padding: '4rem', color: 'var(--accent-red)', textAlign: 'center' }}>{error}</div>;
  if (!product) return null;

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <div className="grid grid-2" style={{ gap: '3rem', alignItems: 'start' }}>
        
        {/* Product Image */}
        <div className="glass-card" style={{ padding: '1rem', borderRadius: 'var(--radius-lg)' }}>
          <img
            src={product.image}
            alt={product.name}
            style={{ width: '100%', borderRadius: 'var(--radius-md)', display: 'block', objectFit: 'cover' }}
          />
        </div>

        {/* Customization panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <span style={{ color: 'var(--accent-cyan)', fontWeight: 700, textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.1em' }}>
              {product.category}
            </span>
            <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>{product.name}</h2>
            <p style={{ color: 'var(--text-secondary)' }}>{product.description}</p>
          </div>

          {/* Configuration Choices */}
          <div style={{ borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)', padding: '1.5rem 0' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.5rem' }}>Configure Options</h3>
            {product.customizationOptions?.map(opt => (
              <div key={opt._id} style={{ marginBottom: '1.5rem' }}>
                <span className="form-label" style={{ fontWeight: 600 }}>{opt.name}</span>
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {opt.choices.map(choice => {
                    const isSelected = selectedOptions[opt.name]?.label === choice.label;
                    return (
                      <button
                        key={choice._id || choice.label}
                        onClick={() => handleOptionChange(opt.name, choice)}
                        className="glass"
                        style={{
                          padding: '0.75rem 1.25rem',
                          border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          textAlign: 'left',
                          transition: 'var(--transition-smooth)',
                          background: isSelected ? 'var(--accent-cyan-glow)' : 'rgba(27,27,34,0.3)',
                          display: 'flex',
                          flexDirection: 'column',
                          minWidth: '120px'
                        }}
                      >
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{choice.label}</span>
                        <span style={{ fontSize: '0.75rem', color: isSelected ? 'var(--accent-cyan)' : 'var(--text-secondary)', marginTop: '0.25rem' }}>
                          {choice.priceModifier === 0 ? 'Included' : `+$${choice.priceModifier}`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Total Price & Checkout trigger */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--bg-secondary)', padding: '1.5rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
            <div>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block' }}>Configured Price</span>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)' }}>
                ${calculateTotalPrice().toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
            <button onClick={handleAddToCart} className="btn btn-primary" style={{ padding: '1rem 2rem' }}>
              Add to Build
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
