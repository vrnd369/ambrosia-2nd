import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { getAuthHeaders } from '../utils/apiAuth';
import { supabase } from '../supabaseClient';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

const isValidImageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

const PLACEHOLDER_SVG = (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

function OrderThumbImage({ src }) {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return <div className="admin-order-thumb-placeholder">{PLACEHOLDER_SVG}</div>;
  }
  return (
    <img
      src={src}
      alt=""
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  );
}

function OrderItemImage({ src }) {
  const [error, setError] = React.useState(false);
  if (!src || error) {
    return (
      <div className="admin-order-item-placeholder">
        {PLACEHOLDER_SVG}
      </div>
    );
  }
  return (
    <img
      src={src}
      alt=""
      className="admin-order-item-img"
      loading="lazy"
      decoding="async"
      onError={() => setError(true)}
    />
  );
}

function getOrderSummary(items) {
  if (!items?.length) return 'No items';
  const names = items.map(i => `${i.name || i.description || 'Item'} ${i.description && i.name ? `(${i.description})` : ''} × ${i.quantity}`.trim());
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0];
}

function getOrderShortId(id) {
  return id ? `#${id.slice(-8).toUpperCase()}` : '#N/A';
}

export default function OrderManagement() {
    const { isAdmin, userRoleLoading } = useAuth();
    const [orders, setOrders] = useState([]);
    const [productsMap, setProductsMap] = useState({});
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);
    const [error, setError] = useState(null);

    const fetchOrders = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            if (!headers.Authorization) {
                setError('Please log in to view orders');
                setOrders([]);
                return;
            }
            const url = `${API_BASE}/api/orders${isAdmin ? '?all=true' : ''}`;
            const res = await fetch(url, { headers });
            const json = await res.json().catch(() => ({}));
            if (json.success && Array.isArray(json.data)) {
                setOrders(json.data);
            } else {
                setError(json.error || json.message || 'Failed to load orders');
                setOrders([]);
            }
        } catch (err) {
            setError(err?.message || 'Failed to load orders');
            setOrders([]);
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        if (!userRoleLoading) fetchOrders();
    }, [fetchOrders, userRoleLoading]);

    useEffect(() => {
        supabase.from('products').select('id, image_url').then(({ data }) => {
            const map = {};
            (data || []).forEach(p => {
                if (p.image_url && !String(p.image_url).startsWith('data:')) map[p.id] = p.image_url;
            });
            setProductsMap(map);
        });
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>Order Management</h1>
                <button className="admin-btn" onClick={fetchOrders} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Orders'}
                </button>
            </div>
            {error && <p className="admin-error-msg">{error}</p>}

            <div className="admin-orders-grid">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const items = order.items || [];
                        const getItemImage = (item) => {
                            if (isValidImageUrl(item.image)) return item.image;
                            return productsMap[item.id] && isValidImageUrl(productsMap[item.id]) ? productsMap[item.id] : null;
                        };
                        const firstImage = items.map(getItemImage).find(Boolean);
                        const isExpanded = expandedId === order.id;

                        return (
                            <div key={order.id} className="admin-order-card">
                                <div className="admin-order-card-main">
                                    <div className="admin-order-thumb">
                                        <OrderThumbImage src={firstImage} />
                                    </div>
                                    <div className="admin-order-info">
                                        <div className="admin-order-name">{getOrderSummary(items)}</div>
                                        <div className="admin-order-meta">
                                            <span>{order.users?.email || 'N/A'}</span>
                                            <span>{getOrderShortId(order.id)}</span>
                                        </div>
                                        <div className="admin-order-row">
                                            <span className="admin-order-amount">₹{(order.total_amount || 0).toFixed(2)}</span>
                                            <span className={`status-badge ${(order.status || '').toLowerCase()}`}>
                                                {order.status || 'Paid'}
                                            </span>
                                            <span className="admin-order-date">
                                                {new Date(order.created_at).toLocaleDateString('en-IN', { dateStyle: 'medium' })}
                                            </span>
                                        </div>
                                    </div>
                                    <button
                                        className="admin-order-toggle"
                                        onClick={() => setExpandedId(isExpanded ? null : order.id)}
                                        aria-expanded={isExpanded}
                                    >
                                        {isExpanded ? '−' : '+'}
                                    </button>
                                </div>
                                {isExpanded && (
                                    <div className="admin-order-details">
                                        {order.shipping_address && (
                                            <p><strong>Shipping:</strong> {order.shipping_address}</p>
                                        )}
                                        {order.phone && <p><strong>Phone:</strong> {order.phone}</p>}
                                        {items.length > 0 && (
                                            <div className="admin-order-items">
                                                <strong>Items:</strong>
                                                {items.map((item, i) => {
                                                    const imgSrc = getItemImage(item);
                                                    return (
                                                    <div key={i} className="admin-order-item-row">
                                                        {imgSrc && <OrderItemImage src={imgSrc} />}
                                                        <span>{item.name || item.description} × {item.quantity}</span>
                                                        <span>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                                    </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                ) : (
                    <div className="admin-orders-empty">No orders found.</div>
                )}
            </div>
        </div>
    );
}
