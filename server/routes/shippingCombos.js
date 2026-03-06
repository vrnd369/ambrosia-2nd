/**
 * Combo Shipping Rules API
 * GET /api/shipping-combos
 * GET /api/shipping-combos/:productId (filter by product - returns combos containing packs from that product)
 * POST /api/shipping-combos
 * DELETE /api/shipping-combos/:id
 */
import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

// Sort pack IDs for order-independent matching
function sortPackIds(ids) {
  return [...(ids || [])].filter(Boolean).map(String).sort();
}

// GET /api/shipping-combos - all combos
// GET /api/shipping-combos?productId=x - combos containing packs from product (optional filter)
router.get('/', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    let query = admin.from('combo_shipping_rules').select('id,pack_ids,shipping_price,created_at').order('created_at', { ascending: false });
    const { productId } = req.query;
    if (productId) {
      query = query.contains('pack_ids', [String(productId)]);
    }
    const { data, error } = await query;
    if (error) {
      console.error('Combo fetch error:', error);
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Shipping combos API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// GET /api/shipping-combos/:id - single combo
router.get('/:id', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const { data, error } = await admin
      .from('combo_shipping_rules')
      .select('id,pack_ids,shipping_price,created_at')
      .eq('id', req.params.id)
      .maybeSingle();
    if (error) return res.status(500).json({ error: 'Database error', message: error.message });
    if (!data) return res.status(404).json({ error: 'Not found', message: 'Combo rule not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Shipping combos API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// POST /api/shipping-combos - create combo (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  const { packs, shippingPrice } = req.body;
  if (!Array.isArray(packs) || packs.length < 2) {
    return res.status(400).json({ error: 'Bad request', message: 'packs must be an array of at least 2 pack IDs' });
  }
  const shipping_price = Number(shippingPrice);
  if (isNaN(shipping_price) || shipping_price < 0) {
    return res.status(400).json({ error: 'Bad request', message: 'shippingPrice must be a non-negative number' });
  }

  const pack_ids = sortPackIds(packs);

  try {
    const { data, error } = await admin
      .from('combo_shipping_rules')
      .insert({ pack_ids, shipping_price })
      .select('id,pack_ids,shipping_price,created_at')
      .single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Conflict', message: 'Combo rule already exists for this pack combination' });
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Shipping combos API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// DELETE /api/shipping-combos/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const { error } = await admin.from('combo_shipping_rules').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Database error', message: error.message });
    return res.json({ success: true });
  } catch (err) {
    console.error('Shipping combos API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

export default router;
