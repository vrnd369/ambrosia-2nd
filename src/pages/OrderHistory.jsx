import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { supabase } from '../supabaseClient';
import { fetchWithCoalescing, getCachedData, setCachedData } from '../utils/supabaseFetch.js';
import { debounce } from '../utils/debounce.js';
import p1 from '../assets/p-11.webp';
import p2 from '../assets/p-22.webp';
import p3 from '../assets/p-33.webp';
import p4 from '../assets/p-44.webp';
import './OrderHistory.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';
const DEFAULT_IMAGES = { 'p-1': p1, 'p-2': p2, 'p-3': p3, 'p-4': p4 };
const DESC_TO_IMAGE = { '4 Pack': p1, '6 Pack': p2, '12 Pack': p3, '24 Pack': p4 };
const isValidImageUrl = (url) => url && typeof url === 'string' && !url.startsWith('data:');

function OrderImage({ src, item, className }) {
  const [error, setError] = React.useState(false);
  const fallback = item ? (DEFAULT_IMAGES[item?.id] || DESC_TO_IMAGE[item?.description] || p1) : p1;
  const displaySrc = error ? fallback : src;
  return <img src={displaySrc} alt="" className={className} loading="lazy" decoding="async" onError={() => setError(true)} />;
}

function OrderTrackingInfo({ order, tracking }) {
  if (!tracking) return null;
  if (tracking.loading) return <p className="order-tracking-loading">Loading tracking...</p>;
  if (tracking.error) return null;
  const d = tracking.data;
  const awb = d?.awb ?? d?.awb_code ?? order.awb_code ?? d?.tracking_data?.shipment_track?.[0]?.awb;
  const status = d?.tracking_data?.shipment_track?.[0]?.current_status ?? d?.status ?? order.shipment_status ?? null;
  const courier = d?.tracking_data?.shipment_track?.[0]?.courier_name ?? d?.courier_name ?? null;
  const trackUrl = awb ? `https://shiprocket.in/shipment-tracking` : null;
  if (!awb && !status) return null;
  return (
    <div className="order-tracking-info">
      {awb && <p className="order-tracking-awb"><strong>AWB:</strong> {awb}</p>}
      {order.id && <p className="order-tracking-order"><strong>Order #:</strong> {order.id.replace(/-/g, '').slice(-12).toUpperCase()}</p>}
      {status && <p className="order-tracking-status"><strong>Status:</strong> {status}</p>}
      {courier && <p className="order-tracking-courier"><strong>Courier:</strong> {courier}</p>}
      {trackUrl && (
        <a href={trackUrl} target="_blank" rel="noopener noreferrer" className="order-tracking-link">
          Track package →
        </a>
      )}
    </div>
  );
}

export default function OrderHistory() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart } = useCart();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [trackingData, setTrackingData] = useState({});
  const fetchedTrackingIdsRef = useRef(new Set());

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/auth', { state: { from: '/order-history' }, replace: true });
      return;
    }
    if (!user?.id) return;

    let cancelled = false;
    setLoading(true);

    const ORDER_COLUMNS = 'id,user_id,total_amount,status,created_at,shipping_address,phone,items,awb_code,shipment_status';
    const productsKey = 'products_id_image';
    const productsFetch = () => {
      const cached = getCachedData(productsKey);
      if (cached) return Promise.resolve({ data: cached, error: null });
      return fetchWithCoalescing(productsKey, () =>
        supabase.from('products').select('id, image_url')
      ).then((res) => {
        if (res?.data) setCachedData(productsKey, res.data);
        return res;
      });
    };

    Promise.all([
      supabase.from('orders').select(ORDER_COLUMNS).eq('user_id', user.id).order('created_at', { ascending: false }),
      productsFetch()
    ]).then(([ordersRes, productsRes]) => {
      if (!cancelled && !ordersRes.error && ordersRes.data) setOrders(ordersRes.data);
      if (!cancelled && !productsRes.error && productsRes.data) {
        const map = {};
        productsRes.data.forEach(p => {
          if (p.image_url && !String(p.image_url).startsWith('data:')) map[p.id] = p.image_url;
        });
        setProducts(map);
      }
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });

    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, navigate]);

  const debouncedSetSearch = useMemo(
    () => debounce((v) => setDebouncedSearch(v), 300),
    []
  );
  useEffect(() => {
    debouncedSetSearch(searchQuery);
  }, [searchQuery, debouncedSetSearch]);

  const fetchTracking = useCallback(async (order) => {
    const key = order.id;
    setTrackingData(prev => (prev[key] !== undefined ? prev : { ...prev, [key]: { loading: true } }));
    try {
      let data = null;
      const awb = order.awb_code;
      if (awb) {
        const res = await fetch(`${API_BASE}/api/shiprocket/track/awb/${encodeURIComponent(awb)}`);
        const json = await res.json().catch(() => ({}));
        if (json.success && json.data) data = { ...json.data, awb };
      }
      if (!data && order.id) {
        const res = await fetch(`${API_BASE}/api/shiprocket/order/${encodeURIComponent(order.id)}`);
        const json = await res.json().catch(() => ({}));
        if (json.success && json.data) {
          const sr = json.data;
          const awbFromSr = sr.awb_code ?? sr.awb ?? sr.tracking_data?.shipment_track?.[0]?.awb;
          data = { ...sr, awb: awbFromSr || order.awb_code };
        }
      }
      setTrackingData(prev => ({ ...prev, [key]: { loading: false, data } }));
    } catch (err) {
      setTrackingData(prev => ({ ...prev, [key]: { loading: false, error: err.message } }));
    }
  }, []);

  const TRACKING_FETCH_LIMIT = 5;
  useEffect(() => {
    const toFetch = orders.slice(0, TRACKING_FETCH_LIMIT).filter(o => !fetchedTrackingIdsRef.current.has(o.id));
    toFetch.forEach(o => {
      fetchedTrackingIdsRef.current.add(o.id);
      fetchTracking(o);
    });
  }, [orders, fetchTracking]);

  const filteredOrders = orders.filter(o => {
    const matchSearch = !searchQuery || (o.id?.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (o.items?.some(i => (i.name || i.description || '').toLowerCase().includes(searchQuery.toLowerCase())));
    if (!matchSearch) return false;
    if (timeFilter === 'all') return true;
    const orderDate = new Date(o.created_at);
    const now = new Date();
    const months = timeFilter === '3' ? 3 : timeFilter === '6' ? 6 : 12;
    return orderDate >= new Date(now.getFullYear(), now.getMonth() - months, now.getDate());
  });

  const handleBuyAgain = (items) => {
    items.forEach(item => {
      const product = { id: item.id, name: item.name, description: item.description, price: item.price };
      for (let q = 0; q < (item.quantity || 1); q++) addToCart(product);
    });
    navigate('/cart');
  };

  if (!isAuthenticated) return null;

  return (
    <div className="order-history-page">
      <nav className="order-history-breadcrumb">
        <Link to="/">Home</Link>
        <span className="breadcrumb-sep">›</span>
        <span>Your Orders</span>
      </nav>

      <div className="order-history-header">
        <h1 className="order-history-title">Your Orders</h1>
        <div className="order-history-toolbar">
          <div className="order-history-search">
            <input
              type="text"
              placeholder="Search all orders"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button type="button" className="order-history-search-btn">Search Orders</button>
          </div>
        </div>
      </div>

      {orders.length > 0 && (
        <div className="order-history-filters">
          <span className="order-history-count">
            {filteredOrders.length} order{filteredOrders.length !== 1 ? 's' : ''} placed in
          </span>
          <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value)} className="order-history-time-filter">
            <option value="all">all time</option>
            <option value="3">past 3 months</option>
            <option value="6">past 6 months</option>
            <option value="12">past 12 months</option>
          </select>
        </div>
      )}

      {loading ? (
        <div className="order-history-loading">
          <div className="loading-spinner" />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="order-history-empty">
          <svg
            className="order-history-empty-icon"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="order-history-empty-text">No orders yet.</p>
          <p className="order-history-empty-sub">Your paid orders will appear here after checkout.</p>
          <button className="order-history-browse-btn" onClick={() => navigate('/buy')}>
            BROWSE PRODUCTS
          </button>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="order-history-empty">
          <svg className="order-history-empty-icon" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          <p className="order-history-empty-text">No orders found.</p>
          <p className="order-history-empty-sub">
            {debouncedSearch || timeFilter !== 'all' ? 'Try adjusting your search or filters.' : 'Your paid orders will appear here after checkout.'}
          </p>
          <button className="order-history-browse-btn" onClick={() => navigate('/buy')}>
            BROWSE PRODUCTS
          </button>
        </div>
      ) : (
        <div className="order-history-list">
          {filteredOrders.map((order) => {
            const items = order.items || [];
            const getItemImage = (item) => {
              if (isValidImageUrl(item?.image)) return item.image;
              if (isValidImageUrl(products[item?.id])) return products[item.id];
              if (DEFAULT_IMAGES[item?.id]) return DEFAULT_IMAGES[item.id];
              return DESC_TO_IMAGE[item?.description] || null;
            };
            const firstImage = items.map(getItemImage).find(Boolean);
            const firstItem = items[0];

            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
            const orderIdShort = order.id ? order.id.replace(/-/g, '').slice(-12).toUpperCase().replace(/(.{3})(.{7})(.{2})/, '$1-$2-$3') : 'N/A';

            return (
              <div className="order-history-card amazon-style" key={order.id}>
                <div className="order-summary-bar">
                  <div className="order-summary-left">
                    <div className="order-summary-item">
                      <span className="order-summary-label">ORDER PLACED</span>
                      <span>{orderDate}</span>
                    </div>
                    <div className="order-summary-item">
                      <span className="order-summary-label">TOTAL</span>
                      <span>₹{(order.total_amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <div className="order-summary-item">
                      <span className="order-summary-label">SHIP TO</span>
                      <span className="order-summary-ship">{order.shipping_address?.split(',')[0] || '—'}</span>
                    </div>
                  </div>
                  <div className="order-summary-right">
                    <div className="order-summary-item">
                      <span className="order-summary-label">ORDER #</span>
                      <span>{orderIdShort}</span>
                    </div>
                    <button type="button" className="order-summary-link" onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}>
                      {expandedOrderId === order.id ? 'Hide order details' : 'View order details'}
                    </button>
                  </div>
                </div>

                <div className="order-main-body">
                  <div className="order-delivery-status">
                    <strong className="order-status-text">
                      {order.status === 'Paid' ? 'Paid' : order.status} · {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </strong>
                    <p className="order-status-desc">Payment received. Order confirmed.</p>
                    <OrderTrackingInfo order={order} tracking={trackingData[order.id]} />
                  </div>

                  <div className="order-products-section">
                    <div className="order-products-list">
                      {items.map((item, i) => {
                        const imgSrc = getItemImage(item);
                        return (
                          <div key={i} className="order-product-row">
                            <div className="order-product-info">
                              <div className="order-product-thumb">
                                {imgSrc ? (
                                  <OrderImage src={imgSrc} item={item} />
                                ) : (
                                  <div className="order-product-thumb-placeholder">
                                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                      <circle cx="8.5" cy="8.5" r="1.5" />
                                      <polyline points="21 15 16 10 5 21" />
                                    </svg>
                                  </div>
                                )}
                              </div>
                              <div className="order-product-details">
                                <p className="order-product-name">{item.name || 'Ambrosia Flow'} {item.description || ''} × {item.quantity}</p>
                                <p className="order-product-price">₹{((item.price || 0) * (item.quantity || 1)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
                                <button type="button" className="order-product-btn" onClick={() => navigate('/buy')}>
                                  View your item
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <div className="order-actions">
                      <button type="button" className="order-action-btn" onClick={() => handleBuyAgain(items)}>
                        Buy Again
                      </button>
                      <button type="button" className="order-action-btn" onClick={() => navigate('/contact')}>
                        Get help
                      </button>
                    </div>
                  </div>

                  {expandedOrderId === order.id && (
                    <div className="order-details-expanded">
                      <div className="order-details-row">
                        <strong>Shipping address:</strong>
                        <p>{order.shipping_address || '—'}</p>
                      </div>
                      {order.phone && (
                        <div className="order-details-row">
                          <strong>Phone:</strong>
                          <p>{order.phone}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
