import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { verifyAuthWithRole } from '../middleware/auth.js';

const router = express.Router();

/** Verify admin routes are mounted (GET /api/admin) */
router.get('/', (req, res) => res.json({ ok: true, service: 'admin' }));

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

/** Admin-only: dashboard stats (users, orders, products, revenue) */
router.get('/stats', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return res.status(500).json({ success: false, error: 'Server misconfigured' });
  }

  const auth = await verifyAuthWithRole(req.headers.authorization);
  if (!auth || !auth.isAdmin) {
    return res.status(403).json({ success: false, error: 'Admin access required' });
  }

  try {
    const [
      { count: usersCount },
      { count: ordersCount },
      { count: productsCount },
      { data: revenueData, error: rpcError },
    ] = await Promise.all([
      admin.from('users').select('id', { count: 'exact', head: true }),
      admin.from('orders').select('id', { count: 'exact', head: true }),
      admin.from('products').select('id', { count: 'exact', head: true }),
      admin.rpc('get_total_revenue'),
    ]);

    let revenue = 0;
    if (!rpcError && revenueData != null) {
      revenue = Number(revenueData);
    } else if (rpcError) {
      const { data: orders } = await admin.from('orders').select('total_amount');
      revenue = orders ? orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0) : 0;
    }

    res.json({
      success: true,
      data: {
        users: usersCount || 0,
        orders: ordersCount || 0,
        products: productsCount || 0,
        revenue,
      },
    });
  } catch (err) {
    console.error('Admin stats error:', err);
    res.status(500).json({ success: false, error: err?.message || 'Unknown error' });
  }
});

export default router;
