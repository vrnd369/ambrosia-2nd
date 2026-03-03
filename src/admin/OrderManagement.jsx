import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Admin.css';

export default function OrderManagement() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        const { data, error } = await supabase.from('orders').select('*, users(email)').order('created_at', { ascending: false });
        if (!error && data) {
            setOrders(data);
        }
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

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>User Email</th>
                            <th>Total Amount</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length > 0 ? (
                            orders.map(order => (
                                <tr key={order.id}>
                                    <td>{order.id}</td>
                                    <td>{order.users?.email || 'N/A'}</td>
                                    <td>₹{order.total_amount}</td>
                                    <td>
                                        <span className={`status-badge ${order.status.toLowerCase()}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-table">No orders found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
