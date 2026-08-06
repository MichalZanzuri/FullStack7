import React from 'react';
import { Link } from 'react-router-dom';

export default function ProductCard({ product }) {
  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{
        position: 'relative',
        paddingBottom: '60%',
        overflow: 'hidden',
        borderRadius: 'var(--radius-sm)',
        marginBottom: '1rem',
        background: '#18181b'
      }}>
        <img
          src={product.image}
          alt={product.name}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transition: 'var(--transition-smooth)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        />
      </div>

      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <span style={{
          fontSize: '0.7rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: 'var(--accent-cyan)',
          fontWeight: 700,
          marginBottom: '0.25rem'
        }}>
          {product.category}
        </span>
        <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', minHeight: '2.5rem' }}>
          {product.name}
        </h3>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-secondary)',
          marginBottom: '1rem',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {product.description}
        </p>

        <div style={{
          marginTop: 'auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', display: 'block', textTransform: 'uppercase' }}>
              Starting at
            </span>
            <span style={{ fontSize: '1.2rem', fontWeight: 700, color: '#fff' }}>
              ${product.price.toLocaleString()}
            </span>
          </div>

          <Link to={`/products/${product._id}`} className="btn btn-primary" style={{ padding: '0.5rem 1rem', fontSize: '0.75rem' }}>
            Customize
          </Link>
        </div>
      </div>
    </div>
  );
}
