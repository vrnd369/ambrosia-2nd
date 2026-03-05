import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Admin.css';

const isValidImageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

function getOrderSummary(items) {
  if (!items?.length) return 'No items';
  const names = items.map(i => `${i.name || i.description || 'Item'} ${i.description && i.name ? `(${i.description})` : ''} × ${i.quantity}`.trim());
  return names.length > 1 ? `${names[0]} +${names.length - 1} more` : names[0];
}

function getOrderShortId(id) {
  return id ? `#${id.slice(-8).toUpperCase()}` : '#N/A';
}

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const ORDER_COLUMNS = 'id,user_id,total_amount,status,created_at,shipping_address,phone,items,awb_code,shipment_status';
    const fetchOrders = async () => {
        setLoading(true);
        let { data, error } = await supabase
            .from('orders')
            .select(`${ORDER_COLUMNS}, users(email)`)
            .order('created_at', { ascending: false });
        if (error) {
            const res = await supabase.from('orders').select(ORDER_COLUMNS).order('created_at', { ascending: false });
            data = res.data;
            error = res.error;
            if (data) data = data.map(o => ({ ...o, users: null }));
        }
        if (!error && data) setOrders(data);
        setLoading(false);
    };

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>Order Management</h1>
                <button className="admin-btn" onClick={fetchOrders} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Orders'}
                </button>
            </div>

            <div className="admin-orders-grid">
                {orders.length > 0 ? (
                    orders.map(order => {
                        const items = order.items || [];
                        const firstImage = items.find(i => isValidImageUrl(i.image))?.image;
                        const isExpanded = expandedId === order.id;

                        return (
                            <div key={order.id} className="admin-order-card">
                                <div className="admin-order-card-main">
                                    <div className="admin-order-thumb">
                                        {firstImage ? (
                                            <img src={firstImage} alt="" loading="lazy" decoding="async" />
                                        ) : (
                                            <div className="admin-order-thumb-placeholder">
                                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                                                    <line x1="3" y1="6" x2="21" y2="6" />
                                                    <path d="M16 10a4 4 0 0 1-8 0" />
                                                </svg>
                                            </div>
                                        )}
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
                                                {items.map((item, i) => (
                                                    <div key={i} className="admin-order-item-row">
                                                        {item.image && isValidImageUrl(item.image) && (
                                                            <img src={item.image} alt="" className="admin-order-item-img" loading="lazy" decoding="async" />
                                                        )}
                                                        <span>{item.name || item.description} × {item.quantity}</span>
                                                        <span>₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}</span>
                                                    </div>
                                                ))}
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
