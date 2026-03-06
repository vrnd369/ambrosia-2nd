import React, { useState, useEffect, useCallback } from 'react';
import { Package, Truck, Pencil, Trash2, RefreshCw } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { notifyProductsUpdated, PRODUCTS_UPDATED_EVENT } from '../utils/supabaseFetch.js';
import './Admin.css';

const PACK_COLUMNS = 'id,name,description,price,weight,shipping_charge,image_url';

function getPackDisplayName(pack) {
  if (!pack) return '';
  const name = pack.name || '';
  const desc = pack.description || '';
  if (name && desc) return `${name} – ${desc}`;
  return name || desc || pack.id || '';
}

// ── Pack Management ──────────────────────────────────────────────────────
function PackManagement({ selectedProductId, products }) {
  const [packs, setPacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', price: '', weight: '1', shipping_charge: '0' });

  const fetchPacks = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('products').select(PACK_COLUMNS).order('created_at', { ascending: false });
    if (data) setPacks(data);
    setLoading(false);
  }, []);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  useEffect(() => {
    const handler = () => fetchPacks();
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, handler);
  }, [fetchPacks]);

  const filteredPacks = selectedProductId
    ? packs.filter((p) => p.id === selectedProductId)
    : packs;

  const handleSave = async (e) => {
    e.preventDefault();
    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price) || 0,
      weight: Number(form.weight) ?? 1,
      shipping_charge: Number(form.shipping_charge) ?? 0,
    };

    try {
      if (editing) {
        const { error } = await supabase.from('products').update(payload).eq('id', editing.id);
        if (error) throw new Error(error.message);
        setPacks(prev => prev.map(p => p.id === editing.id ? { ...p, ...payload } : p));
      } else {
        const newId = `p-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
        const { data, error } = await supabase.from('products').insert({ ...payload, id: newId }).select().single();
        if (error) throw new Error(error.message);
        setPacks(prev => [data, ...prev]);
      }
      notifyProductsUpdated();
      setEditing(null);
      setForm({ name: '', description: '', price: '', weight: '1', shipping_charge: '0' });
    } catch (err) {
      alert(err.message || 'Failed to save');
    }
  };

  const handleEdit = (pack) => {
    setEditing(pack);
    setForm({
      name: pack.name || '',
      description: pack.description || '',
      price: String(pack.price ?? ''),
      weight: String(pack.weight ?? 1),
      shipping_charge: String(pack.shipping_charge ?? 0),
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this pack?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw new Error(error.message);
      notifyProductsUpdated();
      setPacks(prev => prev.filter(p => p.id !== id));
      if (editing?.id === id) setEditing(null);
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card-title-row">
        <h2 className="admin-card-title">
          <Package size={22} />
          Pack Management
        </h2>
        <button type="button" className="admin-btn-icon" onClick={() => fetchPacks()} aria-label="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>
      <p className="admin-card-desc">Set price, weight, and default shipping charge for each pack. All products from Product Management appear here.</p>

      <form onSubmit={handleSave} className="admin-form-inline admin-form-packs">
        <input
          placeholder="Pack name (e.g. 4 Pack)"
          value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })}
          required
        />
        <input
          placeholder="Description"
          value={form.description}
          onChange={e => setForm({ ...form, description: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={form.price}
          onChange={e => setForm({ ...form, price: e.target.value })}
          required
        />
        <input
          type="number"
          step="0.01"
          placeholder="Weight (kg)"
          value={form.weight}
          onChange={e => setForm({ ...form, weight: e.target.value })}
        />
        <input
          type="number"
          placeholder="Shipping ₹"
          value={form.shipping_charge}
          onChange={e => setForm({ ...form, shipping_charge: e.target.value })}
        />
        <button type="submit" className="admin-btn-primary">
          {editing ? 'Update' : 'Add Pack'}
        </button>
        {editing && (
          <button type="button" className="admin-btn-secondary" onClick={() => setEditing(null)}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="admin-loading">Loading packs...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pack Name</th>
                <th>Price</th>
                <th>Weight</th>
                <th>Shipping</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredPacks.map(pack => (
                <tr key={pack.id}>
                  <td>{getPackDisplayName(pack)}</td>
                  <td>₹{Number(pack.price).toFixed(2)}</td>
                  <td>{Number(pack.weight || 0)} kg</td>
                  <td>₹{Number(pack.shipping_charge || 0).toFixed(2)}</td>
                  <td>
                    <button
                      type="button"
                      className="admin-btn-icon"
                      onClick={() => handleEdit(pack)}
                      aria-label="Edit"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      type="button"
                      className="admin-btn-icon admin-btn-danger"
                      onClick={() => handleDelete(pack.id)}
                      aria-label="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredPacks.length === 0 && (
            <p className="empty-table">
              {selectedProductId ? 'No pack for this product.' : 'No packs yet. Add some above.'}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Combo Shipping Rules ──────────────────────────────────────────────────
function ComboShippingRules({ selectedProductId, products }) {
  const [packs, setPacks] = useState([]);
  const [combos, setCombos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPacks, setSelectedPacks] = useState([]);
  const [shippingPrice, setShippingPrice] = useState('');
  const [saving, setSaving] = useState(false);
  const [editingCombo, setEditingCombo] = useState(null);

  const fetchPacks = useCallback(async () => {
    const { data } = await supabase.from('products').select(PACK_COLUMNS).order('created_at', { ascending: false });
    if (data) setPacks(data);
  }, []);

  const fetchCombos = useCallback(async () => {
    const { data } = await supabase.from('combo_shipping_rules').select('id,pack_ids,shipping_price,created_at').order('created_at', { ascending: false });
    if (data) setCombos(data);
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchPacks(), fetchCombos()]).finally(() => setLoading(false));
  }, [fetchPacks, fetchCombos]);

  useEffect(() => {
    const handler = () => {
      setLoading(true);
      Promise.all([fetchPacks(), fetchCombos()]).finally(() => setLoading(false));
    };
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, handler);
  }, [fetchPacks, fetchCombos]);

  const togglePack = (packId) => {
    setSelectedPacks(prev =>
      prev.includes(packId) ? prev.filter(id => id !== packId) : [...prev, packId]
    );
  };

  const handleEditCombo = (combo) => {
    setEditingCombo(combo);
    setSelectedPacks([...(combo.pack_ids || [])]);
    setShippingPrice(String(combo.shipping_price ?? ''));
  };

  const handleSaveCombo = async (e) => {
    e.preventDefault();
    if (selectedPacks.length < 2) {
      alert('Select at least 2 packs');
      return;
    }
    const price = Number(shippingPrice);
    if (isNaN(price) || price < 0) {
      alert('Enter a valid shipping price');
      return;
    }
    setSaving(true);
    const packIds = [...selectedPacks].sort();
    try {
      if (editingCombo) {
        const { data, error } = await supabase.from('combo_shipping_rules').update({ pack_ids: packIds, shipping_price: price }).eq('id', editingCombo.id).select().single();
        if (error) throw new Error(error.message);
        setCombos(prev => prev.map(c => c.id === editingCombo.id ? data : c));
        setEditingCombo(null);
      } else {
        const { data, error } = await supabase.from('combo_shipping_rules').insert({ pack_ids: packIds, shipping_price: price }).select().single();
        if (error) throw new Error(error.message);
        setCombos(prev => [data, ...prev]);
      }
      setSelectedPacks([]);
      setShippingPrice('');
    } catch (err) {
      alert(err.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCombo = async (id) => {
    if (!window.confirm('Delete this combo rule?')) return;
    try {
      const { error } = await supabase.from('combo_shipping_rules').delete().eq('id', id);
      if (error) throw new Error(error.message);
      setCombos(prev => prev.filter(c => c.id !== id));
      if (editingCombo?.id === id) {
        setEditingCombo(null);
        setSelectedPacks([]);
        setShippingPrice('');
      }
    } catch (err) {
      alert(err.message || 'Delete failed');
    }
  };

  const getPackName = (id) => getPackDisplayName(packs.find(p => p.id === id)) || id;

  const selectedProduct = selectedProductId ? products.find((p) => p.id === selectedProductId) : null;
  const filteredPacks = selectedProduct
    ? packs.filter((p) => p.name === selectedProduct.name)
    : packs;

  return (
    <div className="admin-card">
      <div className="admin-card-title-row">
        <h2 className="admin-card-title">
          <Truck size={22} />
          Combo Shipping Rules
        </h2>
        <button type="button" className="admin-btn-icon" onClick={() => { setLoading(true); Promise.all([fetchPacks(), fetchCombos()]).finally(() => setLoading(false)); }} aria-label="Refresh">
          <RefreshCw size={18} />
        </button>
      </div>
      <p className="admin-card-desc">Set custom shipping prices for pack combinations (combos override default). Packs are synced from Product Management.</p>

      <form onSubmit={handleSaveCombo} className="admin-combo-form">
        <div className="admin-combo-form-row">
          <label>Select Packs (multi-select):</label>
          <div className="admin-combo-packs">
            {(filteredPacks.length ? filteredPacks : packs).map(pack => (
              <label key={pack.id} className="admin-combo-pack-chip">
                <input
                  type="checkbox"
                  checked={selectedPacks.includes(pack.id)}
                  onChange={() => togglePack(pack.id)}
                />
                <span>{getPackDisplayName(pack)}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="admin-combo-form-row">
          <label>Shipping Price (₹):</label>
          <input
            type="number"
            placeholder="100"
            value={shippingPrice}
            onChange={e => setShippingPrice(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="admin-btn-primary" disabled={saving || selectedPacks.length < 2}>
          {saving ? 'Saving...' : editingCombo ? 'Update Rule' : 'Save Rule'}
        </button>
        {editingCombo && (
          <button type="button" className="admin-btn-secondary" onClick={() => { setEditingCombo(null); setSelectedPacks([]); setShippingPrice(''); }}>
            Cancel
          </button>
        )}
      </form>

      {loading ? (
        <div className="admin-loading">Loading rules...</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Pack Combo</th>
                <th>Shipping</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {combos.map(combo => {
                const comboLabel = (combo.pack_ids || []).map(getPackName).join(' + ');
                return (
                  <tr key={combo.id}>
                    <td>{comboLabel || '—'}</td>
                    <td>₹{Number(combo.shipping_price).toFixed(2)}</td>
                    <td>
                      <button
                        type="button"
                        className="admin-btn-icon"
                        onClick={() => handleEditCombo(combo)}
                        aria-label="Edit"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        type="button"
                        className="admin-btn-icon admin-btn-danger"
                        onClick={() => handleDeleteCombo(combo.id)}
                        aria-label="Delete"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {combos.length === 0 && <p className="empty-table">No combo rules yet.</p>}
        </div>
      )}
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────────────────
export default function ShippingManagement() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productsLoading, setProductsLoading] = useState(true);

  const fetchProducts = useCallback(async () => {
    setProductsLoading(true);
    const { data, error } = await supabase
      .from('products')
      .select('id,name,description,price,weight,shipping_charge,image_url')
      .order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setProductsLoading(false);
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const handler = () => fetchProducts();
    window.addEventListener(PRODUCTS_UPDATED_EVENT, handler);
    return () => window.removeEventListener(PRODUCTS_UPDATED_EVENT, handler);
  }, [fetchProducts]);

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <h1>Shipping Management</h1>
        <div className="admin-header-actions">
          <button type="button" className="admin-btn" onClick={fetchProducts} disabled={productsLoading} title="Refresh from Product Management">
            <RefreshCw size={18} />
            Refresh
          </button>
          <div className="admin-product-dropdown-wrap">
          <label htmlFor="product-select" className="admin-dropdown-label">
            Product:
          </label>
          <select
            id="product-select"
            className="admin-product-dropdown"
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            disabled={productsLoading}
          >
            <option value="">All products</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {getPackDisplayName(p) || p.id}
              </option>
            ))}
          </select>
        </div>
        </div>
      </div>
      <PackManagement selectedProductId={selectedProductId || undefined} products={products} />
      <ComboShippingRules selectedProductId={selectedProductId || undefined} products={products} />
    </div>
  );
}
