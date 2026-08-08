import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

export default function AdminDashboard() {
  const { token } = useAuth();
  const { formatPrice } = useCurrency();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);

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

  // Multer File Upload Handler
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploadingImage(true);
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Image upload failed');
      }

      const data = await res.json();
      setNewProduct(prev => ({ ...prev, image: data.imageUrl }));
    } catch (err) {
      alert(err.message);
    } finally {
      setUploadingImage(false);
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

  const removeCustomizationOption = (index) => {
    setNewProduct(prev => ({
      ...prev,
      customizationOptions: prev.customizationOptions.filter((_, i) => i !== index)
    }));
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
                      borderRadius: '4px',
                      fontWeight: 600
                    }}>{order.status}</span>
                  </div>

                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    <strong>User:</strong> {order.user_name} ({order.user_email})
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '0.5rem', marginBottom: '0.5rem' }}>
                    {order.items.map((item, idx) => (
                      <div key={idx} style={{ fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                        {item.quantity}x {item.name} - {formatPrice(item.price)}
                        <div style={{ color: 'var(--accent-cyan)', fontSize: '0.7rem', paddingLeft: '0.5rem' }}>
                          {Object.entries(item.selectedOptions).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 700, color: 'var(--accent-gold)' }}>Total: {formatPrice(order.total_price)}</span>
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
                <label className="form-label">Product Name</label>
                <input type="text" className="form-input" value={newProduct.name} onChange={(e) => setNewProduct({...newProduct, name: e.target.value})} required placeholder="e.g. Apex Hyper-Scooter Pro" />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-input" rows="2" value={newProduct.description} onChange={(e) => setNewProduct({...newProduct, description: e.target.value})} required placeholder="High performance specs..." />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Base Price (USD $)</label>
                  <input type="number" step="any" className="form-input" value={newProduct.price} onChange={(e) => setNewProduct({...newProduct, price: e.target.value})} required placeholder="299" />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">Category</label>
                  <input type="text" className="form-input" value={newProduct.category} onChange={(e) => setNewProduct({...newProduct, category: e.target.value})} required placeholder="Scooters / Tech" />
                </div>
              </div>

              {/* Image Input with Multer File Upload and Preview */}
              <div className="form-group">
                <label className="form-label">Product Image (Upload File or Enter URL)</label>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="https://... or /uploads/..."
                    value={newProduct.image}
                    onChange={(e) => setNewProduct({...newProduct, image: e.target.value})}
                    style={{ flex: 1 }}
                  />
                  <label className="btn btn-secondary" style={{ padding: '0.5rem 0.8rem', fontSize: '0.75rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                    {uploadingImage ? 'Uploading...' : '📁 Upload File'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      style={{ display: 'none' }}
                      disabled={uploadingImage}
                    />
                  </label>
                </div>
                {newProduct.image && (
                  <div style={{ marginTop: '0.5rem', width: '100px', height: '60px', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                    <img src={newProduct.image} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                )}
              </div>

              {/* Dynamic options selector creation */}
              <div style={{ border: '1px solid var(--border-color)', padding: '1rem', borderRadius: 'var(--radius-sm)', marginBottom: '1rem', background: 'rgba(0,0,0,0.15)' }}>
                <h4 style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: 'var(--accent-cyan)' }}>Configure Customization Specs</h4>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Option Name (e.g. Battery Capacity)" value={optName} onChange={(e) => setOptName(e.target.value)} />
                </div>
                <div className="form-group">
                  <input type="text" className="form-input" placeholder="Choices (e.g. Standard 500Wh:0, Extended 1000Wh:120)" value={choicesRaw} onChange={(e) => setChoicesRaw(e.target.value)} />
                </div>
                <button type="button" onClick={addCustomizationOption} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.75rem', width: '100%' }}>
                  + Add Customization Spec
                </button>

                {newProduct.customizationOptions.length > 0 && (
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Configured Specs:</div>
                    {newProduct.customizationOptions.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.03)', padding: '0.4rem 0.6rem', borderRadius: '4px' }}>
                        <div style={{ fontSize: '0.75rem', color: 'var(--accent-cyan)' }}>
                          <strong>{opt.name}:</strong> {opt.choices.map(c => `${c.label} (+${formatPrice(c.priceModifier)})`).join(', ')}
                        </div>
                        <button type="button" onClick={() => removeCustomizationOption(i)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', fontSize: '0.8rem' }}>✕</button>
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
            <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Active Product Templates ({products.length})</h3>
            {productsLoading ? (
              <p>Fetching templates...</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {products.map(prod => (
                  <div key={prod._id} className="glass-card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                      <img src={prod.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80'} alt={prod.name} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} />
                      <div>
                        <h4 style={{ fontSize: '0.85rem', marginBottom: '0.2rem' }}>{prod.name}</h4>
                        <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)' }}>Base: {formatPrice(prod.price)}</span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: '0.5rem' }}>• {prod.customizationOptions?.length || 0} specs</span>
                      </div>
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
