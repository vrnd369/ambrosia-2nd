import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Package, Trash2, Video, Truck, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Admin.css';

export default function AdminLayout() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/admin/login', { replace: true });
    };

    return (
        <div className="admin-layout">
            <aside className="admin-sidebar">
                <div className="admin-sidebar-header">
                    <h2>Ambrosia Admin</h2>
                </div>
                <nav className="admin-nav">
                    <NavLink to="/admin" end className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <LayoutDashboard size={20} />
                        <span>Overview</span>
                    </NavLink>
                    <NavLink to="/admin/users" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Users size={20} />
                        <span>User Management</span>
                    </NavLink>
                    <NavLink to="/admin/orders" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <ShoppingCart size={20} />
                        <span>Order Management</span>
                    </NavLink>
                    <NavLink to="/admin/products" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Package size={20} />
                        <span>Product Management</span>
                    </NavLink>
                    <NavLink to="/admin/storage" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Trash2 size={20} />
                        <span>Storage Cleanup</span>
                    </NavLink>
                    <NavLink to="/admin/instagram-feed" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Video size={20} />
                        <span>Instagram Feed</span>
                    </NavLink>
                    <NavLink to="/admin/shipping" className={({ isActive }) => `admin-nav-link ${isActive ? 'active' : ''}`}>
                        <Truck size={20} />
                        <span>Shipping</span>
                    </NavLink>
                </nav>
                <div className="admin-sidebar-footer">
                    <button type="button" className="admin-nav-link admin-logout-btn" onClick={handleLogout}>
                        <LogOut size={20} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
}
