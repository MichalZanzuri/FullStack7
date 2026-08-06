import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Form for new product
  const [newProduct, setNewProduct] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: '',
    stock: 10,
    customizationOptions: []
  });

  // Helper states for adding dynamic options in forms
  const [optName, setOptName] = useState('');
  const [choicesRaw, setChoicesRaw] = useState(''); // e.g. "Matte Black:0, Gloss Red:50"

  const fetchData = async () => {
    try {
      const ordersData = await fetch('/api/orders', {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        if (!res.ok) throw new Error('Failed to load orders');
        return res.json();
      });
      setOrders(ordersData);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setOrdersLoading(false);
    }

    try {
      const productsData = await fetch('/api/products').then(res => {
        if (!res.ok) throw new Error('Failed to load products');
        return res.json();
      });
      setProducts(productsData);
    } catch (err) {
      setErrorMessage(err.message);
    } finally {
      setProductsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const handleUpdateStatus = async (orderId, currentStatus) => {
    const nextStatus = currentStatus === 'Pending' ? 'Processing' : currentStatus === 'Processing' ? 'Shipped' : 'Delivered';
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus })
      });
      if (!res.ok) throw new Error('Failed to update status');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const handleDeleteProduct = async (prodId) => {
    if (!window.confirm('Delete this customizable product template?')) return;
    try {
      const res = await fetch(`/api/products/${prodId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error('Failed to delete product');
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  const addCustomizationOption = () => {
    if (!optName || !choicesRaw) return;
    const choices = choicesRaw.split(',').map(choiceStr => {
      const [label, modifier] = choiceStr.split(':');
      return {
        label: label.trim(),
        priceModifier: parseFloat(modifier || 0)
      };
    });

    setNewProduct(prev => ({
      ...prev,
      customizationOptions: [...prev.customizationOptions, { name: optName, choices }]
    }));
    setOptName('');
    setChoicesRaw('');
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newProduct,
          price: parseFloat(newProduct.price)
        })
      });
      if (!res.ok) throw new Error('Failed to create product');
      
      // Reset form
      setNewProduct({
        name: '',
        description: '',
        price: '',
        image: '',
        category: '',
        stock: 10,
        customizationOptions: []
      });
      fetchData();
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="container" style={{ marginBottom: '4rem' }}>
      <h2 style={{ fontSize: '1.8rem', marginBottom: '2rem' }} className="gradient-text">Admin Command Center</h2>

      {errorMessage && <div style={{ color: 'var(--accent-red)', marginBottom: '1rem' }}>{errorMessage}</div>}

      <div className="grid grid-2" style={{ gap: '2.5rem', alignItems: 'start' }}>
        
        {/* Left Side: Order Pipeline */}
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Relational Orders Pipeline (MySQL)</h3>
          {ordersLoading ? (
            <p>Retrieving order states...</p>
          ) : orders.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No orders placed yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {orders.map(order => (
                <div key={order.id} className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Order #{order.id}</span>
                    <span style={{
                      fontSize: '0.75rem',
                      background: order.status === 'Pending' ? '#d97706' : order.status === 'Processing' ? '#2563eb' : '#16a34a',
                      color: '#fff',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>{order.status}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>User:</strong> {order.user_name} ({order.user_email})
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        {item.quantity}x {item.name} - ${(item.price).toLocaleString()}
                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', paddingLeft: '0.5rem' }}>
                          {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Total: ${order.total_price}</span>
                    {order.status !== 'Delivered' && (
                      <button onClick={() => handleUpdateStatus(order.id, order.status)} className="btn btn-secondary" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                        Advance Status
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Product Catalog & Adding Template */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
          
          {/* Add customizable product template */}
          <div className="glass-card">
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.25rem' }}>New Customizable Product (MongoDB)</h3>
            <form onSubmit={handleCreateProduct}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input type="text" className="form-input" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} required />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Base Price ($)</label>
                  <input type="number" className="form-input" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} required placeholder="Scooters / Car Parts" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Image URL</label>
                <input type="text" className="form-input" value={newProduct.image} onChange={(e) => setNewProduct({...newProduct, image: e.target.value})} required />
              </div>

              {/* Dynamic options selector creation */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', background: 'rgba(0,0,0,0.1)' }}>
                <h4 style={{ fontSize: '0.8rem', marginBottom: '0.75rem', color: 'var(--text-secondary)' }}>Add Customization Option</h4>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Option Name (e.g. Color)" value={optName} onChange={(e) => setOptName(e.target.value)} />
                </div>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Choices (e.g. Red:0, Carbon:150)" value={choicesRaw} onChange={(e) => setChoicesRaw(e.target.value)} />
                </div>
                <button type="button" onClick={addCustomizationOption} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%' }}>
                  Add Option Spec
                </button>

                {newProduct.customizationOptions.length > 0 && (
                  <div style={{ marginTop: '1rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Added Specs:</div>
                    {newProduct.customizationOptions.map((opt, i) => (
                      <div key={i} style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                        {opt.name}: {opt.choices.map(c => `${c.label}(+$${c.priceModifier})`).join(', ')}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.75rem' }}>
                Save Customizable Template
              </button>
            </form>
          </div>

          {/* Product templates list */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Product Templates</h3>
            {productsLoading ? (
              <p>Fetching templates...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map(prod => (
                  <div key={prod._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div>
                      <h4 style={{ fontSize: '0.85rem' }}>{prod.name}</h4>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Base: ${prod.price}</span>
                    </div>
                    <button onClick={() => handleDeleteProduct(prod._id)} className="btn btn-danger" style={{ padding: '0.3rem 0.6rem', fontSize: '0.7rem' }}>
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}
