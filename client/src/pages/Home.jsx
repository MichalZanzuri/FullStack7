import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortBy, setSortBy] = useState('featured');

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

  // Compute unique categories
  const categories = ['All', ...new Set(products.map(p => p.category).filter(Boolean))];

  // Filtered & Sorted products
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }).sort((a, b) => {
    if (sortBy === 'price-low') return a.price - b.price;
    if (sortBy === 'price-high') return b.price - a.price;
    return 0; // featured default
  });

  return (
    <div className="container">
      {/* Hero Banner */}
      <section className="glass-card" style={{
        position: 'relative',
        padding: '3rem 2rem',
        borderRadius: 'var(--radius-lg)',
        marginBottom: '2.5rem',
        textAlign: 'center',
        background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(212, 175, 55, 0.08) 100%)',
        border: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }} className="gradient-text">
          Customize Your Performance Machine
        </h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '650px', margin: '0 auto 1.5rem', lineHeight: '1.6' }}>
          Configure premium parts, bespoke EDC gear, and high-performance hardware to your exact specifications. Real-time dynamic pricing, modular components, and live currency rates.
        </p>
      </section>

      {/* Search, Category Filter & Sorting Controls */}
      <div className="glass-card" style={{ padding: '1.25rem', marginBottom: '2.5rem' }}>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '1rem',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Search bar */}
          <div style={{ flex: '1 1 280px', position: 'relative' }}>
            <input
              type="text"
              className="form-input"
              placeholder="🔍 Search products, specs, gear..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ paddingLeft: '1rem' }}
            />
          </div>

          {/* Category Chips */}
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', flex: '2 1 320px' }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="btn"
                style={{
                  padding: '0.4rem 0.8rem',
                  fontSize: '0.75rem',
                  borderRadius: '20px',
                  background: selectedCategory === cat ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                  color: selectedCategory === cat ? '#000' : 'var(--text-secondary)',
                  border: selectedCategory === cat ? 'none' : '1px solid var(--border-color)',
                  cursor: 'pointer'
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Price Sorting */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="form-input"
              style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: 'auto', cursor: 'pointer' }}
            >
              <option value="featured">Featured</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List */}
      <div style={{ marginBottom: '4rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1.3rem' }}>
            Catalog Items <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>({filteredProducts.length})</span>
          </h2>
          {products.length === 0 && !loading && (
            <button onClick={handleSeed} className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '0.4rem 0.8rem' }}>
              Seed Demo Products
            </button>
          )}
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '3rem' }}>Loading elite products...</div>}
        {error && <div style={{ color: 'var(--accent-red)', textAlign: 'center', padding: '2rem' }}>{error}</div>}

        {!loading && !error && filteredProducts.length === 0 && (
          <div className="glass-card" style={{ textAlign: 'center', padding: '4rem' }}>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              {searchQuery || selectedCategory !== 'All' ? 'No products match your search/filter criteria.' : 'No products found in the catalog.'}
            </p>
            {products.length === 0 && (
              <button onClick={handleSeed} className="btn btn-primary">
                Initialize Premium Catalog
              </button>
            )}
          </div>
        )}

        <div className="grid grid-3">
          {filteredProducts.map(product => (
            <ProductCard key={product._id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
}
