import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import './Admin.css';

const PRODUCT_IMAGES_BUCKET = 'product-images';

/**
 * Extracts storage paths from full Supabase storage URLs.
 * e.g. "https://xxx.supabase.co/storage/v1/object/public/product-images/p-1/123.webp"
 *   -> "p-1/123.webp"
 */
function urlToStoragePath(url) {
  if (!url || typeof url !== 'string') return null;
  const match = url.match(/\/storage\/v1\/object\/public\/[^/]+\/(.+)$/);
  return match ? match[1] : null;
}

export default function StorageCleanup() {
  const [storageFiles, setStorageFiles] = useState([]);
  const [usedPaths, setUsedPaths] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deletingAll, setDeletingAll] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const productsRes = await supabase.from('products').select('id, image_url');

      const files = [];
      const listRecursive = async (prefix) => {
        const { data } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).list(prefix || '', { limit: 500 });
        if (!data) return;
        for (const item of data) {
          const path = prefix ? `${prefix}/${item.name}` : item.name;
          if (item.id) {
            files.push({ path, size: item.metadata?.size });
          } else {
            await listRecursive(path);
          }
        }
      };
      await listRecursive('');

      const used = new Set();
      (productsRes.data || []).forEach((p) => {
        const path = urlToStoragePath(p.image_url);
        if (path) used.add(path);
      });

      setStorageFiles(files);
      setUsedPaths(used);
    } catch (err) {
      console.error('Storage cleanup load error:', err);
    } finally {
      setLoading(false);
    }
  }

  const unusedFiles = storageFiles.filter((f) => {
    const p = typeof f === 'string' ? f : f.path;
    return !usedPaths.has(p);
  });

  const handleDelete = async (path) => {
    if (!window.confirm(`Delete "${path}"? This cannot be undone.`)) return;
    setDeleting(path);
    try {
      const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove([path]);
      if (error) throw error;
      setStorageFiles((prev) => prev.filter((f) => (typeof f === 'string' ? f : f.path) !== path));
      setUsedPaths((prev) => {
        const next = new Set(prev);
        next.delete(path);
        return next;
      });
    } catch (err) {
      alert(err?.message || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const handleDeleteAll = async () => {
    if (unusedFiles.length === 0) return;
    if (!window.confirm(`Delete all ${unusedFiles.length} unused files? This cannot be undone.`)) return;
    setDeletingAll(true);
    try {
      const paths = unusedFiles.map((f) => (typeof f === 'string' ? f : f.path));
      const { error } = await supabase.storage.from(PRODUCT_IMAGES_BUCKET).remove(paths);
      if (error) throw error;
      setStorageFiles((prev) => prev.filter((f) => !paths.includes(typeof f === 'string' ? f : f.path)));
      setUsedPaths((prev) => {
        const next = new Set(prev);
        paths.forEach((p) => next.delete(p));
        return next;
      });
    } catch (err) {
      alert(err?.message || 'Failed to delete some or all files');
    } finally {
      setDeletingAll(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-page">
        <h1>Storage Cleanup</h1>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <h1>Storage Cleanup</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="admin-btn" onClick={loadData} disabled={loading}>
            Refresh
          </button>
          <button
            className="admin-btn danger"
            onClick={handleDeleteAll}
            disabled={unusedFiles.length === 0 || deletingAll}
          >
            {deletingAll ? 'Deleting...' : 'Delete All'}
          </button>
        </div>
      </div>
      <p className="admin-storage-desc">
        Lists files in the <code>product-images</code> bucket and identifies those not referenced by any product.
        Only delete files you are sure are unused.
      </p>
      <div className="admin-stats-grid" style={{ marginBottom: 24 }}>
        <div className="admin-stat-card">
          <div className="stat-details">
            <h3>Total files</h3>
            <p>{storageFiles.length}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-details">
            <h3>Used by products</h3>
            <p>{usedPaths.size}</p>
          </div>
        </div>
        <div className="admin-stat-card">
          <div className="stat-details">
            <h3>Unused (candidates)</h3>
            <p>{unusedFiles.length}</p>
          </div>
        </div>
      </div>
      {unusedFiles.length > 0 ? (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Path</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {unusedFiles.map((f) => {
                const path = typeof f === 'string' ? f : f.path;
                return (
                  <tr key={path}>
                    <td><code>{path}</code></td>
                    <td>
                      <button
                        className="admin-btn danger"
                        onClick={() => handleDelete(path)}
                        disabled={deleting === path || deletingAll}
                      >
                        {deleting === path ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="empty-table">No unused files found. All storage files are referenced by products.</p>
      )}
    </div>
  );
}
