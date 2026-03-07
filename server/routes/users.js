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

/** Admin-only: list all users */
router.get('/', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  const auth = await verifyAuthWithRole(req.headers.authorization);
  if (!auth || !auth.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  try {
    const { data, error } = await admin
      .from('users')
      .select('id,email,full_name,role,created_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Users fetch error:', error);
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Users API error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Unknown error' });
  }
});

export default router;
