import React, { useEffect, useState, useRef } from 'react';
import imageCompression from 'browser-image-compression';
import { supabase } from '../supabaseClient';
import './Admin.css';
import p1 from '../assets/p-11.png';
import p2 from '../assets/p-22.png';
import p3 from '../assets/p-33.png';
import p4 from '../assets/p-44.png';

// Fallback Default Products
const DEFAULT_PRODUCTS = [
    { id: 'p-1', name: 'Ambrosia Flow', description: '4 Pack', price: 800, image: p1 },
    { id: 'p-2', name: 'Ambrosia Flow', description: '6 Pack', price: 1200, image: p2 },
    { id: 'p-3', name: 'Ambrosia Flow', description: '12 Pack', price: 2400, image: p3 },
    { id: 'p-4', name: 'Ambrosia Flow', description: '24 Pack', price: 4800, image: p4 },
];

export default function ProductManagement() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploadingImage, setUploadingImage] = useState(false);
    const fileInputRef = useRef(null);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        id: '',
        name: '',
        description: '',
        price: '',
        image_url: ''
    });

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
        if (!error && data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleSyncFromMainSite = async () => {
        if (!window.confirm('This will insert default products to Supabase. Proceed?')) return;
        setLoading(true);

        for (const prod of DEFAULT_PRODUCTS) {
            // Check if product with this id already exists to avoid duplicates
            const { data: existing } = await supabase.from('products').select('id').eq('id', prod.id).maybeSingle();
            if (!existing) {
                await supabase.from('products').insert({
                    id: prod.id,
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    image_url: prod.image,
                });
            }
        }

        await fetchProducts();
        alert('Synced products from main site context!');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        setLoading(true);
        await supabase.from('products').delete().eq('id', id);
        await fetchProducts();
    };

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData({
                id: product.id,
                name: product.name,
                description: product.description,
                price: product.price,
                image_url: product.image_url || '',
            });
        } else {
            setEditingProduct(null);
            setFormData({ id: '', name: '', description: '', price: '', image_url: '' });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSaveProduct = async (e) => {
        e.preventDefault();
        setLoading(true);

        const payload = {
            id: formData.id,
            name: formData.name,
            description: formData.description,
            price: Number(formData.price),
            image_url: formData.image_url,
        };

        if (editingProduct) {
            // Update
            await supabase.from('products').update(payload).eq('id', editingProduct.id);
        } else {
            // Check existence to prevent duplicate ID crash on front-end
            const { data: existing } = await supabase.from('products').select('id').eq('id', payload.id).maybeSingle();
            if (existing) {
                alert('Product ID already exists. Please choose another.');
                setLoading(false);
                return;
            }
            // Insert
            await supabase.from('products').insert(payload);
        }

        await fetchProducts();
        handleCloseModal();
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const options = {
                maxSizeMB: 0.019, // Strictly < 20kb
                maxWidthOrHeight: 800,
                useWebWorker: true,
                initialQuality: 0.6
            };

            const compressedFile = await imageCompression(file, options);

            // Convert to base64 to store in text column. 
            // In a real prod setup, we'd upload to Supabase Storage, 
            // but base64 strings work for quick prototyping within limits.
            const reader = new FileReader();
            reader.readAsDataURL(compressedFile);
            reader.onloadend = () => {
                setFormData(prev => ({ ...prev, image_url: reader.result }));
                setUploadingImage(false);
            };
        } catch (error) {
            console.error('Error compressing image:', error);
            alert('Failed to compress image.');
            setUploadingImage(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>Product Management</h1>
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button className="admin-btn" onClick={() => handleOpenModal()} disabled={loading}>
                        Add New Product
                    </button>
                    <button className="admin-btn" onClick={fetchProducts} disabled={loading}>
                        Refresh
                    </button>
                    <button className="admin-btn" onClick={handleSyncFromMainSite} disabled={loading}>
                        Sync from Main Site
                    </button>
                </div>
            </div>

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Image</th>
                            <th>Name</th>
                            <th>Description</th>
                            <th>Price</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map(product => (
                                <tr key={product.id}>
                                    <td className="product-image-cell">
                                        <img src={product.image_url} alt={product.name} />
                                    </td>
                                    <td>{product.name}</td>
                                    <td>{product.description}</td>
                                    <td>₹{product.price}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button className="admin-btn edit-btn" onClick={() => handleOpenModal(product)} style={{ backgroundColor: '#ed8936' }}>
                                                Edit
                                            </button>
                                            <button className="admin-btn danger" onClick={() => handleDelete(product.id)}>
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-table">No products found. Start by Syncing from Main Site!</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {isModalOpen && (
                <div className="admin-modal-overlay">
                    <div className="admin-modal">
                        <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
                        <form onSubmit={handleSaveProduct} className="admin-form">
                            <div className="form-group">
                                <label>Product ID</label>
                                <input
                                    type="text"
                                    value={formData.id}
                                    onChange={(e) => setFormData({ ...formData, id: e.target.value })}
                                    required
                                    disabled={!!editingProduct}
                                    placeholder="e.g., p-5"
                                />
                            </div>
                            <div className="form-group">
                                <label>Name</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                    placeholder="e.g., Ambrosia Flow"
                                />
                            </div>
                            <div className="form-group">
                                <label>Description (Pack info)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    required
                                    placeholder="e.g., 24 Pack"
                                />
                            </div>
                            <div className="form-group">
                                <label>Price (₹)</label>
                                <input
                                    type="number"
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    required
                                    min="0"
                                />
                            </div>
                            <div className="form-group">
                                <label>Image Upload</label>
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    ref={fileInputRef}
                                />
                                {uploadingImage && <p style={{ fontSize: '0.8rem', color: '#ed8936', marginTop: '4px' }}>Compressing image...</p>}
                                {formData.image_url && !uploadingImage && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#48bb78', marginBottom: '4px' }}>Image ready!</p>
                                        <img src={formData.image_url} alt="Preview" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
                                    </div>
                                )}
                            </div>
                            <div className="admin-modal-actions">
                                <button type="button" className="admin-btn danger" onClick={handleCloseModal}>Cancel</button>
                                <button type="submit" className="admin-btn" disabled={loading || uploadingImage}>
                                    {loading ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
