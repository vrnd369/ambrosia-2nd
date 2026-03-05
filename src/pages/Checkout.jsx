import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Checkout.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Checkout() {
    const { items, subtotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: '',
        address: '',
        city: '',
        state: '',
        pin: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/auth', { state: { from: '/checkout' }, replace: true });
        } else if (items.length === 0) {
            navigate('/cart', { replace: true });
        }
    }, [isAuthenticated, items, navigate]);

    const loadRazorpayScript = () => {
        return new Promise((resolve) => {
            const script = document.createElement('script');
            script.src = 'https://checkout.razorpay.com/v1/checkout.js';
            script.onload = () => resolve(true);
            script.onerror = () => resolve(false);
            document.body.appendChild(script);
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await loadRazorpayScript();
        if (!res) {
            alert('Razorpay SDK failed to load. Are you online?');
            setLoading(false);
            return;
        }

        let razorpayOrderId = null;
        try {
            const orderRes = await fetch(`${API_BASE}/api/razorpay/create-order`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    amount: Math.round(subtotal * 100),
                    currency: 'INR',
                    receipt: `amb_${Date.now()}`,
                }),
            });
            const orderJson = await orderRes.json().catch(() => ({}));
            if (!orderRes.ok || !orderJson.order_id) {
                throw new Error(orderJson.message || 'Could not create payment order');
            }
            razorpayOrderId = orderJson.order_id;
        } catch (err) {
            setLoading(false);
            alert(err.message || 'Payment setup failed. Please try again.');
            return;
        }

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            order_id: razorpayOrderId,
            currency: 'INR',
            name: 'Ambrosia',
            description: 'Premium Hydration Services',
            image: 'https://i.imgur.com/your-logo.webp', // Optional logo
            handler: async function (response) {
                const orderItems = items.map(({ id, name, description, price, quantity, image }) => ({
                    id, name, description, price, quantity,
                    image: image && typeof image === 'string' && !image.startsWith('data:') ? image : null
                }));

                try {
                    const verifyRes = await fetch(`${API_BASE}/api/razorpay/verify`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            razorpay_order_id: response.razorpay_order_id || null,
                        }),
                    });
                    const verifyJson = await verifyRes.json().catch(() => ({}));
                    if (!verifyRes.ok || !verifyJson.success) {
                        throw new Error(verifyJson.message || 'Payment verification failed');
                    }

                    const { data, error } = await supabase.from('orders').insert({
                        user_id: user.id,
                        total_amount: subtotal,
                        status: 'Paid',
                        payment_id: response.razorpay_payment_id,
                        shipping_address: `${form.address}, ${form.city}${form.state ? `, ${form.state}` : ''}, PIN: ${form.pin}`,
                        phone: form.phone,
                        items: orderItems
                    }).select('id').single();

                    if (error) throw error;

                    try {
                        const srRes = await fetch(`${API_BASE}/api/shiprocket/create-order`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                orderId: data.id,
                                buyer: {
                                    name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Customer',
                                    email: user?.email,
                                    phone: form.phone,
                                    address: form.address,
                                    city: form.city,
                                    state: form.state,
                                    pin: form.pin,
                                },
                                items: orderItems,
                                subTotal: subtotal,
                            }),
                        });
                        const srJson = await srRes.json().catch(() => ({}));
                        if (!srRes.ok) throw new Error(srJson.message || 'Shiprocket order failed');
                        const srData = srJson.data || srJson.order || srJson;
                        const awb = srData.awb_code ?? srData.awb ?? null;
                        const shipmentId = srData.shipment_id ?? null;
                        const status = srData.status ?? null;
                        if (awb || shipmentId || status) {
                            const { error: upErr } = await supabase.from('orders').update({
                                shiprocket_shipment_id: shipmentId,
                                awb_code: awb,
                                shipment_status: status,
                            }).eq('id', data.id);
                            if (upErr) console.warn('Could not update order with Shiprocket data:', upErr);
                        }
                    } catch (srErr) {
                        console.error('Shiprocket order creation failed:', srErr);
                        // Order is still saved - Shiprocket is best-effort
                    }

                    alert(`Payment Successful! Order #${data?.id?.slice(-8)?.toUpperCase() || ''}`);
                    clearCart();
                    navigate('/');
                } catch (err) {
                    console.error('Checkout error:', err);
                    const errMsg = err?.message || 'Unknown error';
                    if (errMsg.includes('verification') || errMsg.includes('signature')) {
                        alert(`Payment verification failed. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
                    } else if (errMsg.includes('insert') || errMsg.includes('order')) {
                        alert(`Payment received but order could not be saved: ${errMsg}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
                    } else {
                        alert(`Payment received but something went wrong: ${errMsg}. Please contact support with Payment ID: ${response.razorpay_payment_id}`);
                    }
                    // Do NOT clear cart on error - user can retry
                }
            },
            prefill: {
                name: user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email,
                email: user?.email,
                contact: form.phone
            },
            theme: {
                color: '#ff5722'
            }
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.on('payment.failed', function (response) {
            console.error('Payment Failed:', response.error);
            alert('Payment execution failed. Please try again.');
        });
        paymentObject.open();
        setLoading(false);
    };

    if (!isAuthenticated || items.length === 0) return null;

    return (
        <div className="checkout-page">
            <h1 className="checkout-page-title">Secure Checkout</h1>

            <div className="checkout-container">
                <div className="checkout-form-panel">
                    <h2>Shipping Details</h2>
                    <form onSubmit={handlePayment} className="checkout-form" id="checkout-form">
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="tel"
                                required
                                value={form.phone}
                                onChange={e => setForm({ ...form, phone: e.target.value })}
                                placeholder="e.g. +91 9876543210"
                            />
                        </div>
                        <div className="form-group">
                            <label>Street Address</label>
                            <input
                                type="text"
                                required
                                value={form.address}
                                onChange={e => setForm({ ...form, address: e.target.value })}
                                placeholder="House / Flat No., Street, Landmark"
                            />
                        </div>
                        <div className="form-group row-group">
                            <div className="half-group">
                                <label>City</label>
                                <input
                                    type="text"
                                    required
                                    value={form.city}
                                    onChange={e => setForm({ ...form, city: e.target.value })}
                                    placeholder="Your City"
                                />
                            </div>
                            <div className="half-group">
                                <label>State</label>
                                <input
                                    type="text"
                                    value={form.state}
                                    onChange={e => setForm({ ...form, state: e.target.value })}
                                    placeholder="e.g. Telangana"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>PIN Code</label>
                            <input
                                type="text"
                                required
                                value={form.pin}
                                onChange={e => setForm({ ...form, pin: e.target.value })}
                                placeholder="6 digits"
                            />
                        </div>

                        <button type="submit" className="checkout-pay-btn" disabled={loading} id="pay-now-btn">
                            {loading ? 'Initializing Gateway...' : `Pay ₹${subtotal.toFixed(2)}`}
                        </button>
                    </form>
                </div>

                <div className="checkout-summary-panel">
                    <h2>Order Summary</h2>
                    <div className="checkout-items">
                        {items.map(item => (
                            <div key={item.id} className="checkout-item-row">
                                <span className="checkout-item-name">{item.name} x {item.quantity}</span>
                                <span className="checkout-item-price">₹{(item.price * item.quantity).toFixed(2)}</span>
                            </div>
                        ))}
                    </div>
                    <div className="checkout-total-row">
                        <span>Total Payable</span>
                        <span className="checkout-total-value">₹{subtotal.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
