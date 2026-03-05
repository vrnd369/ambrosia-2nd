import React, { useEffect, useState, useRef, useMemo } from 'react';

import imageCompression from 'browser-image-compression';
import { supabase } from '../supabaseClient';
import { invalidateCache } from '../utils/supabaseFetch.js';
import { debounce } from '../utils/debounce.js';
import './Admin.css';
import p1 from '../assets/p-11.webp';
import p2 from '../assets/p-22.webp';
import p3 from '../assets/p-33.webp';
import p4 from '../assets/p-44.webp';

// Map product id to default image for fallback
const DEFAULT_IMAGES = { 'p-1': p1, 'p-2': p2, 'p-3': p3, 'p-4': p4 };

const isStorageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

// Product image with fallback when URL fails, empty, or is base64
function ProductImage({ product }) {
  const [imgError, setImgError] = useState(false);
  const url = product.image_url;
  const src = isStorageUrl(url) && !imgError ? url : (DEFAULT_IMAGES[product.id] || p1);
  return (
    <img
      src={src}
      alt={product.name}
      loading="lazy"
      decoding="async"
      onError={() => setImgError(true)}
    />
  );
}

const PRODUCT_IMAGES_BUCKET = 'product-images';

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

    const debouncedRefresh = useMemo(() => debounce(() => fetchProducts(), 400), []);
    const debouncedSync = useMemo(() => debounce(() => handleSyncFromMainSite(), 400), []);

    const fetchProducts = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('products').select('id,name,description,price,image_url').order('created_at', { ascending: false });
        if (!error && data) {
            setProducts(data);
        }
        setLoading(false);
    };

    const handleSyncFromMainSite = async () => {
        if (!window.confirm('This will insert or update products in Supabase. Proceed?')) return;
        setLoading(true);

        for (const prod of DEFAULT_PRODUCTS) {
            const { data: existing } = await supabase.from('products').select('id, image_url').eq('id', prod.id).maybeSingle();
            const imageUrl = typeof prod.image === 'string' ? prod.image : (prod.image?.src || prod.image);
            if (!existing) {
                await supabase.from('products').insert({
                    id: prod.id,
                    name: prod.name,
                    description: prod.description,
                    price: prod.price,
                    image_url: imageUrl || '',
                });
            } else if (!isStorageUrl(existing.image_url)) {
                await supabase.from('products').update({ image_url: imageUrl || '' }).eq('id', prod.id);
            }
        }

        await fetchProducts();
        alert('Synced products from main site!');
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return;
        setLoading(true);
        await supabase.from('products').delete().eq('id', id);
        invalidateCache('products_list');
        setProducts(prev => prev.filter(p => p.id !== id));
        setLoading(false);
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
            const { error } = await supabase.from('products').update(payload).eq('id', editingProduct.id);
            if (!error) {
                invalidateCache('products_list');
                setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...payload } : p));
                handleCloseModal();
            }
        } else {
            const { data: existing } = await supabase.from('products').select('id').eq('id', payload.id).maybeSingle();
            if (existing) {
                alert('Product ID already exists. Please choose another.');
                setLoading(false);
                return;
            }
            const { data: inserted, error } = await supabase.from('products').insert(payload).select('id,name,description,price,image_url').single();
            if (!error && inserted) {
                invalidateCache('products_list');
                setProducts(prev => [inserted, ...prev]);
                handleCloseModal();
            }
        }
        setLoading(false);
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            setUploadingImage(true);
            const options = {
                maxSizeMB: 0.03,
                maxWidthOrHeight: 800,
                useWebWorker: true,
                initialQuality: 0.75,
                fileType: 'image/webp',
            };

            const compressedFile = await imageCompression(file, options);
            const productId = formData.id || `temp-${Date.now()}`;
            const filePath = `${productId}/${Date.now()}.webp`;

            const { data, error } = await supabase.storage
                .from(PRODUCT_IMAGES_BUCKET)
                .upload(filePath, compressedFile, {
                    upsert: true,
                    contentType: 'image/webp',
                    cacheControl: 'public, max-age=31536000, immutable',
                });

            if (error) throw error;

            const { data: { publicUrl } } = supabase.storage
                .from(PRODUCT_IMAGES_BUCKET)
                .getPublicUrl(data.path);

            setFormData(prev => ({ ...prev, image_url: publicUrl }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert(error?.message || 'Failed to upload image. Ensure the "product-images" bucket exists and is public.');
        } finally {
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
                    <button className="admin-btn" onClick={debouncedRefresh} disabled={loading}>
                        Refresh
                    </button>
                    <button className="admin-btn" onClick={debouncedSync} disabled={loading}>
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
                                        <ProductImage product={product} />
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
                                {isStorageUrl(formData.image_url) && !uploadingImage && (
                                    <div style={{ marginTop: '10px' }}>
                                        <p style={{ fontSize: '0.8rem', color: '#48bb78', marginBottom: '4px' }}>Image ready!</p>
                                        <img src={formData.image_url} alt="Preview" loading="lazy" decoding="async" style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
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
