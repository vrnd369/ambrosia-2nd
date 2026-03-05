import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Checkout.css';

export default function Checkout() {
    const { items, subtotal, clearCart } = useCart();
    const { user, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: '',
        address: '',
        city: '',
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

        const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: Math.round(subtotal * 100), // Amount in paise
            currency: 'INR',
            name: 'Ambrosia',
            description: 'Premium Hydration Services',
            image: 'https://i.imgur.com/your-logo.webp', // Optional logo
            handler: async function (response) {
                // Success Callback
                try {
                    const { error } = await supabase.from('orders').insert({
                        user_id: user.id,
                        total_amount: subtotal,
                        status: 'Paid',
                        payment_id: response.razorpay_payment_id,
                        shipping_address: `${form.address}, ${form.city}, PIN: ${form.pin}`,
                        phone: form.phone,
                        items: items
                    });

                    if (error) throw error;

                    alert(`Payment Successful! Payment ID: ${response.razorpay_payment_id}`);
                    clearCart();
                    navigate('/'); // Route back to home upon success
                } catch (err) {
                    console.error('Failed to create order in database:', err);
                    alert('Payment received but order tracking failed. Please contact support.');
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
                                <label>PIN Code</label>
                                <input
                                    type="text"
                                    required
                                    value={form.pin}
                                    onChange={e => setForm({ ...form, pin: e.target.value })}
                                    placeholder="6 digits"
                                />
                            </div>
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
