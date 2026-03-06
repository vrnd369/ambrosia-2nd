/**
 * Shipping calculation API (public - no auth)
 * POST /api/calculate-shipping
 * Body: { productId?, selectedPacks: [packId, packId] }
 * Returns: { shippingCharge: number }
 *
 * Logic:
 * 1. If combo rule exists for selected packs (order-independent) → return combo shipping
 * 2. Else → return max(pack.shippingCharge) for selected packs
 */
import express from 'express';
import { createClient } from '@supabase/supabase-js';

const router = express.Router();
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

function sortPackIds(ids) {
  return [...(ids || [])].filter(Boolean).map(String).sort();
}

router.post('/calculate-shipping', async (req, res) => {
  const admin = getSupabaseAdmin();
  if (!admin) return res.status(500).json({ error: 'Server misconfigured' });

  const { productId, selectedPacks } = req.body;
  const packIds = Array.isArray(selectedPacks) ? selectedPacks : (productId ? [productId] : []);

  if (packIds.length === 0) {
    return res.json({ success: true, shippingCharge: 0 });
  }

  const sortedIds = sortPackIds(packIds);

  const sortedKey = sortedIds.join(',');

  try {
    // 1. Check combo rule (exact match on sorted pack_ids)
    let comboCharge = null;
    try {
      const { data: allCombos } = await admin.from('combo_shipping_rules').select('pack_ids,shipping_price');
      const match = (allCombos || []).find((c) => {
        const ids = [...(c.pack_ids || [])].map(String).sort();
        return ids.join(',') === sortedKey;
      });
      if (match) comboCharge = Number(match.shipping_price) || 0;
    } catch {
      // combo_shipping_rules may not exist yet
    }

    if (comboCharge != null) {
      return res.json({ success: true, shippingCharge: comboCharge, source: 'combo' });
    }

    // 2. Fallback: max(pack.shippingCharge) for selected packs
    let maxCharge = 0;
    try {
      const { data: packs, error: packsErr } = await admin
        .from('products')
        .select('id,shipping_charge')
        .in('id', packIds);

      if (!packsErr && packs?.length) {
        maxCharge = Math.max(...packs.map((p) => Number(p?.shipping_charge) || 0), 0);
      }
    } catch {
      // products may not have shipping_charge column yet
    }

    return res.json({ success: true, shippingCharge: maxCharge, source: 'max' });
  } catch (err) {
    console.error('Calculate shipping error:', err);
    return res.status(500).json({ error: 'Server error', message: err?.message });
  }
});

export default router;
