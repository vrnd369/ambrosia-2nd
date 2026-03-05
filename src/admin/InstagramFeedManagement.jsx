import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { invalidateCache } from '../utils/supabaseFetch.js';
import './Admin.css';

const INSTAGRAM_VIDEOS_BUCKET = 'instagram-videos';
const FEED_CACHE_KEY = 'instagram_feed';

function extractInstagramCode(url) {
  if (!url || typeof url !== 'string') return null;
  const m = url.match(/instagram\.com\/(?:reel|p)\/([A-Za-z0-9_-]+)/);
  return m ? m[1] : null;
}

export default function InstagramFeedManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    source_type: 'upload',
    video_url: '',
    instagram_url: '',
    caption: '',
    sort_order: 0,
  });
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('instagram_feed')
      .select('id,source_type,video_url,thumbnail_url,caption,sort_order')
      .order('sort_order', { ascending: true });
    if (!error && data) setItems(data);
    setLoading(false);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        source_type: item.source_type,
        video_url: item.video_url || '',
        instagram_url: item.source_type === 'instagram' ? item.video_url : '',
        caption: item.caption || '',
        sort_order: item.sort_order ?? 0,
      });
    } else {
      setEditingItem(null);
      const nextOrder = items.length > 0 ? Math.max(...items.map(i => i.sort_order || 0)) + 1 : 0;
      setFormData({
        source_type: 'upload',
        video_url: '',
        instagram_url: '',
        caption: '',
        sort_order: nextOrder,
      });
    }
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditingItem(null);
  };

  const handleVideoUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file (MP4, WebM, etc.)');
      return;
    }

    try {
      setUploading(true);
      const ext = file.name.split('.').pop() || 'mp4';
      const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await supabase.storage
        .from(INSTAGRAM_VIDEOS_BUCKET)
        .upload(path, file, {
          contentType: file.type,
          cacheControl: 'public, max-age=31536000, immutable',
          upsert: true,
        });

      if (error) throw error;

      const { data: { publicUrl } } = supabase.storage
        .from(INSTAGRAM_VIDEOS_BUCKET)
        .getPublicUrl(data.path);

      setFormData(prev => ({ ...prev, video_url: publicUrl, source_type: 'upload' }));
    } catch (err) {
      console.error(err);
      alert(err?.message || 'Upload failed. Ensure the instagram-videos bucket exists.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    const videoUrl = formData.source_type === 'instagram'
      ? formData.instagram_url
      : formData.video_url;

    if (!videoUrl?.trim()) {
      alert('Please provide a video URL or upload a file.');
      setLoading(false);
      return;
    }

    if (formData.source_type === 'instagram' && !extractInstagramCode(videoUrl)) {
      alert('Invalid Instagram URL. Use format: https://www.instagram.com/reel/CODE/ or /p/CODE/');
      setLoading(false);
      return;
    }

    const payload = {
      source_type: formData.source_type,
      video_url: videoUrl,
      caption: formData.caption || null,
      sort_order: Number(formData.sort_order) || 0,
    };

    try {
      if (editingItem) {
        await supabase.from('instagram_feed').update(payload).eq('id', editingItem.id);
        setItems(prev => prev.map(i => i.id === editingItem.id ? { ...i, ...payload } : i));
      } else {
        const { data: inserted, error: insertErr } = await supabase.from('instagram_feed').insert(payload).select('id,source_type,video_url,thumbnail_url,caption,sort_order').single();
        if (!insertErr && inserted) {
          setItems(prev => [...prev, inserted].sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)));
        } else throw insertErr;
      }
      invalidateCache(FEED_CACHE_KEY);
      handleCloseModal();
    } catch (err) {
      alert(err?.message || 'Save failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Remove this item from the feed?')) return;
    setLoading(true);
    await supabase.from('instagram_feed').delete().eq('id', id);
    invalidateCache(FEED_CACHE_KEY);
    setItems(prev => prev.filter(i => i.id !== id));
    setLoading(false);
  };

  const handleMove = async (index, direction) => {
    if (index + direction < 0 || index + direction >= items.length) return;
    const newItems = [...items];
    const [removed] = newItems.splice(index, 1);
    newItems.splice(index + direction, 0, removed);
    const updates = newItems.map((item, i) => ({ ...item, sort_order: i }));
    setLoading(true);
    for (const u of updates) {
      await supabase.from('instagram_feed').update({ sort_order: u.sort_order }).eq('id', u.id);
    }
    invalidateCache(FEED_CACHE_KEY);
    setItems(updates);
    setLoading(false);
  };

  return (
    <div className="admin-page">
      <div className="admin-header-row">
        <h1>Instagram Feed</h1>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="admin-btn" onClick={() => handleOpenModal()} disabled={loading}>
            Add Item
          </button>
          <button className="admin-btn" onClick={fetchItems} disabled={loading}>
            Refresh
          </button>
        </div>
      </div>

      <p className="admin-storage-desc">
        Manage videos for the Community Social Feed. For a plain look with only mute/unmute, use <strong>Upload Video</strong>. Instagram links show Instagram&apos;s own UI (profile, View profile button).
      </p>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Preview</th>
              <th>Type</th>
              <th>Caption</th>
              <th>Order</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item, i) => (
                <tr key={item.id}>
                  <td>
                    <div className="admin-feed-preview">
                      {item.source_type === 'upload' ? (
                        <video src={item.video_url} muted playsInline style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                      ) : (
                        <div style={{ width: 80, height: 80, background: '#e2e8f0', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>
                          IG
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{item.source_type}</td>
                  <td>{item.caption ? item.caption.slice(0, 40) + (item.caption.length > 40 ? '…' : '') : '—'}</td>
                  <td>{item.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="admin-btn" onClick={() => handleMove(i, -1)} disabled={loading || i === 0}>↑</button>
                      <button className="admin-btn" onClick={() => handleMove(i, 1)} disabled={loading || i === items.length - 1}>↓</button>
                      <button className="admin-btn edit-btn" onClick={() => handleOpenModal(item)} style={{ backgroundColor: '#ed8936' }}>Edit</button>
                      <button className="admin-btn danger" onClick={() => handleDelete(item.id)}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="empty-table">No feed items. Add videos or Instagram links to display in the Community Social Feed.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 520 }}>
            <h2>{editingItem ? 'Edit Feed Item' : 'Add Feed Item'}</h2>
            <form onSubmit={handleSave} className="admin-form">
              <div className="form-group">
                <label>Source Type</label>
                <select
                  value={formData.source_type}
                  onChange={(e) => setFormData({ ...formData, source_type: e.target.value })}
                >
                  <option value="upload">Upload Video</option>
                  <option value="instagram">Instagram Link</option>
                </select>
              </div>

              {formData.source_type === 'upload' ? (
                <div className="form-group">
                  <label>Video File</label>
                  <input type="file" accept="video/*" onChange={handleVideoUpload} ref={fileInputRef} />
                  {uploading && <p style={{ fontSize: '0.8rem', color: '#ed8936', marginTop: 4 }}>Uploading…</p>}
                  {formData.video_url && (
                    <div style={{ marginTop: 10 }}>
                      <video src={formData.video_url} controls muted style={{ maxWidth: 200, maxHeight: 150, borderRadius: 6 }} />
                    </div>
                  )}
                </div>
              ) : (
                <div className="form-group">
                  <label>Instagram URL</label>
                  <input
                    type="url"
                    placeholder="https://www.instagram.com/reel/ABC123/ or /p/ABC123/"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                  />
                </div>
              )}

              <div className="form-group">
                <label>Caption (optional)</label>
                <input
                  type="text"
                  value={formData.caption}
                  onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                  placeholder="Short caption"
                />
              </div>

              <div className="form-group">
                <label>Sort Order</label>
                <input
                  type="number"
                  min="0"
                  value={formData.sort_order}
                  onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                />
              </div>

              <div className="admin-modal-actions">
                <button type="button" className="admin-btn danger" onClick={handleCloseModal}>Cancel</button>
                <button type="submit" className="admin-btn" disabled={loading || uploading}>
                  {loading ? 'Saving…' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
