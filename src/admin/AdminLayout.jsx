import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Users, ShoppingCart, Package, Trash2, Video } from 'lucide-react';
import './Admin.css';

export default function AdminLayout() {
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
                </nav>
            </aside>
            <main className="admin-main-content">
                <Outlet />
            </main>
        </div>
    );
}
