import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthWithRole } from '../middleware/auth.js';

const router = express.Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

// Base columns only. Run supabase/migrations/20250305000002_add_shiprocket_tracking_columns.sql for awb_code, shipment_status
const ORDER_COLUMNS = 'id,user_id,total_amount,status,created_at,shipping_address,phone,items';

router.get('/', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    console.error('Orders API: SUPABASE_SERVICE_ROLE_KEY is not set in .env');
    return res.status(500).json({ error: 'Server misconfigured', message: 'Add SUPABASE_SERVICE_ROLE_KEY to .env (Supabase Dashboard → Settings → API → service_role)' });
  }

  const auth = await verifyAuthWithRole(req.headers.authorization);
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized', message: 'Valid session required' });
  }

  const all = req.query.all === 'true';
  if (all && !auth.isAdmin) {
    return res.status(403).json({ error: 'Forbidden', message: 'Admin access required to view all orders' });
  }

  try {
    let query = admin.from('orders').select(ORDER_COLUMNS).order('created_at', { ascending: false });

    if (!all) {
      query = query.eq('user_id', auth.userId);
    }

    let { data, error } = await query;

    if (error) {
      console.error('Orders fetch error:', error);
      return res.status(500).json({ error: 'Database error', message: error.message, code: error.code });
    }

    if (all && data?.length) {
      const userIds = [...new Set(data.map(o => o.user_id).filter(Boolean))];
      const { data: usersData, error: usersErr } = await admin.from('users').select('id, email').in('id', userIds);
      if (usersErr) console.warn('Users fetch failed (orders still returned):', usersErr.message);
      const userMap = Object.fromEntries((usersData || []).map(u => [u.id, u]));
      data = data.map(o => ({ ...o, users: userMap[o.user_id] ? { email: userMap[o.user_id].email } : null }));
    }

    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Orders API error:', err);
    res.status(500).json({ error: 'Server error', message: err?.message || 'Unknown error' });
  }
});

export default router;
