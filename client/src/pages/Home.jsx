import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      if (!res.ok) throw new Error('Failed to load products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/products/seed', { method: 'POST' });
      if (!res.ok) throw new Error('Seeding failed');
      await fetchProducts();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return (
    <div className="container">
      {/* Hero Banner */}
      <section className="glass-card" style={{
        position: 'relative',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '3rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="gradient-text">
          Customize Your Performance Machine
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto 2rem' }}>
          Configure premium parts, electric scooters, and elite components to your exact specifications. High-grade materials, custom power modules, and bespoke aesthetics.
        </p>
      </section>

      {/* Product List */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem' }}>Premium Catalog</h2>
          {products.length === 0 && !loading && (
            <button onClick={handleSeed} className="btn btn-secondary">
              Seed Demo Products
            </button>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading elite products...</div>}
        {error && <div style={{ color: 'var(--accent-red)', textAlign: 'center', padding: '2rem' }}>{error}</div>}

        {!loading && !error && products.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>No products found in the catalog.</p>
            <button onClick={handleSeed} className="btn btn-primary">
              Initialize Premium Catalog
            </button>
          </div>
        )}

        <div className="grid grid-3">
          {products.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
