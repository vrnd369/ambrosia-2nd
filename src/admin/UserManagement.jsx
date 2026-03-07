import React, { useEffect, useState } from 'react';
import { getAuthHeaders } from '../utils/apiAuth';
import './Admin.css';

const API_BASE = import.meta.env.VITE_API_BASE_URL || '';

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchUsers = async () => {
        setLoading(true);
        setError(null);
        try {
            const headers = await getAuthHeaders();
            if (!headers.Authorization) {
                setError('Please log in to view users');
                setUsers([]);
                return;
            }
            const res = await fetch(`${API_BASE}/api/users`, { headers });
            const json = await res.json().catch(() => ({}));
            if (json.success && Array.isArray(json.data)) {
                setUsers(json.data);
            } else {
                setError(json.error || 'Failed to load users');
                setUsers([]);
            }
        } catch (err) {
            setError(err?.message || 'Failed to load users');
            setUsers([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <div className="admin-page">
            <div className="admin-header-row">
                <h1>User Management</h1>
                <button className="admin-btn" onClick={fetchUsers} disabled={loading}>
                    {loading ? 'Refreshing...' : 'Refresh Users'}
                </button>
            </div>
            {error && <p className="admin-error-msg">{error}</p>}

            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>Role</th>
                            <th>Joined Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.length > 0 ? (
                            users.map(user => (
                                <tr key={user.id}>
                                    <td>{user.id}</td>
                                    <td>{user.email}</td>
                                    <td>{user.full_name}</td>
                                    <td>{user.role}</td>
                                    <td>{new Date(user.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="empty-table">No users found.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
