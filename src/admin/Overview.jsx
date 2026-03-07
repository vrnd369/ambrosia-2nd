import React, { useEffect, useState } from 'react';
import { getAuthHeaders } from '../utils/apiAuth';
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function Overview() {
    const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchStats = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            if (!headers.Authorization) {
                setError('Please log in to view stats');
                return;
            }
            const res = await fetch(`${API_BASE}/api/admin/stats`, { headers });
            const json = await res.json().catch(() => ({}));
            if (json.success && json.data) {
                setStats(json.data);
            } else {
                setError(json.error || 'Failed to load stats');
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
            setError(err?.message || 'Failed to load stats');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>Dashboard Overview</h1>
                <button className="admin-btn" onClick={fetchStats} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Stats'}
                </button>
            </div>
            {error && <p className="admin-error-msg">{error}</p>}

            <div className="admin-stats-grid">
                <div className="admin-stat-card">
                    <div className="stat-icon users"><Users size={24} /></div>
                    <div className="stat-details">
                        <h3>Total Users</h3>
                        <p>{stats.users}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon orders"><ShoppingCart size={24} /></div>
                    <div className="stat-details">
                        <h3>Total Orders</h3>
                        <p>{stats.orders}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon products"><Package size={24} /></div>
                    <div className="stat-details">
                        <h3>Total Products</h3>
                        <p>{stats.products}</p>
                    </div>
                </div>
                <div className="admin-stat-card">
                    <div className="stat-icon revenue"><DollarSign size={24} /></div>
                    <div className="stat-details">
                        <h3>Total Revenue</h3>
                        <p>₹{stats.revenue.toFixed(2)}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
