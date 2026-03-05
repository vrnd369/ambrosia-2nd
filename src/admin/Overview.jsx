import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Users, ShoppingCart, Package, DollarSign } from 'lucide-react';
import './Admin.css';

export default function Overview() {
    const [stats, setStats] = useState({ users: 0, orders: 0, products: 0, revenue: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const { count: usersCount } = await supabase.from('users').select('id', { count: 'exact', head: true });
            const { count: ordersCount } = await supabase.from('orders').select('id', { count: 'exact', head: true });
            const { count: productsCount } = await supabase.from('products').select('id', { count: 'exact', head: true });

            let revenue = 0;
            const { data: revenueData, error: rpcError } = await supabase.rpc('get_total_revenue');
            if (!rpcError && revenueData != null) {
                revenue = Number(revenueData);
            } else if (rpcError) {
                const { data: orders } = await supabase.from('orders').select('total_amount');
                revenue = orders ? orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) : 0;
            }

            setStats({
                users: usersCount || 0,
                orders: ordersCount || 0,
                products: productsCount || 0,
                revenue,
            });
        } catch (error) {
            console.error('Error fetching stats:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>Dashboard Overview</h1>
                <button className="admin-btn" onClick={fetchStats} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Stats'}
                </button>
            </div>

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
