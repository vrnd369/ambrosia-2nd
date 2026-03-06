/**
 * Packs API - products table acts as packs (id, name, description, price, weight, shipping_charge)
 * GET /api/packs
 * GET /api/packs/:productId
 * POST /api/packs
 * PUT /api/packs/:id
 * DELETE /api/packs/:id
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

const PACK_COLUMNS = 'id,name,description,price,weight,shipping_charge,image_url';

// GET /api/packs - all packs (products)
router.get('/', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const { data, error } = await admin
      .from('products')
      .select(PACK_COLUMNS)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('Packs fetch error:', error);
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    return res.json({ success: true, data: data || [] });
  } catch (err) {
    console.error('Packs API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

router.get('/:productId', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const { data, error } = await admin
      .from('products')
      .select(PACK_COLUMNS)
      .eq('id', req.params.productId)
      .maybeSingle();
    if (error) return res.status(500).json({ error: 'Database error', message: error.message });
    if (!data) return res.status(404).json({ error: 'Not found', message: 'Pack not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Packs API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// POST /api/packs - create pack (admin only)
router.post('/', requireAdmin, async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  const { id, name, description, price, weight, shipping_charge, image_url } = req.body;
  if (!name || price == null) {
    return res.status(400).json({ error: 'Bad request', message: 'name and price required' });
  }

  try {
    const payload = {
      id: id || `p-${Date.now()}`,
      name: name || 'Pack',
      description: description || '',
      price: Number(price) || 0,
      weight: Number(weight) ?? 1,
      shipping_charge: Number(shipping_charge) ?? 0,
      image_url: image_url || '',
    };

    const { data, error } = await admin.from('products').insert(payload).select(PACK_COLUMNS).single();
    if (error) {
      if (error.code === '23505') return res.status(409).json({ error: 'Conflict', message: 'Pack id already exists' });
      return res.status(500).json({ error: 'Database error', message: error.message });
    }
    return res.status(201).json({ success: true, data });
  } catch (err) {
    console.error('Packs API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// PUT /api/packs/:id - update pack (admin only)
router.put('/:id', requireAdmin, async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  const { name, description, price, weight, shipping_charge, image_url } = req.body;
  const payload = {};
  if (name !== undefined) payload.name = name;
  if (description !== undefined) payload.description = description;
  if (price !== undefined) payload.price = Number(price);
  if (weight !== undefined) payload.weight = Number(weight);
  if (shipping_charge !== undefined) payload.shipping_charge = Number(shipping_charge);
  if (image_url !== undefined) payload.image_url = image_url;

  if (Object.keys(payload).length === 0) {
    return res.status(400).json({ error: 'Bad request', message: 'No fields to update' });
  }

  try {
    const { data, error } = await admin
      .from('products')
      .update(payload)
      .eq('id', req.params.id)
      .select(PACK_COLUMNS)
      .single();
    if (error) return res.status(500).json({ error: 'Database error', message: error.message });
    if (!data) return res.status(404).json({ error: 'Not found', message: 'Pack not found' });
    return res.json({ success: true, data });
  } catch (err) {
    console.error('Packs API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

// DELETE /api/packs/:id (admin only)
router.delete('/:id', requireAdmin, async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  try {
    const { error } = await admin.from('products').delete().eq('id', req.params.id);
    if (error) return res.status(500).json({ error: 'Database error', message: error.message });
    return res.json({ success: true });
  } catch (err) {
    console.error('Packs API error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

export default router;
