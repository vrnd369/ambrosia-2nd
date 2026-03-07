import express from 'express';
import { createClient } from '@supabase/supabase-js';
import { getToken, getCredentials, buildOrderPayload, createOrder, getOrderByOrderId, getTrackingByAwb } from '../utils/shiprocket.js';

const router = express.Router();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

/**
 * POST /api/shiprocket/login
 * Optional: test auth. Returns token info (not the token itself for security).
 */
router.post('/login', async (req, res) => {
  try {
    const { hasCredentials } = getCredentials();
    if (!hasCredentials) {
      return res.status(500).json({
        success: false,
        message: 'Shiprocket credentials not configured',
      });
    }
    const token = await getToken();
    res.json({
      success: true,
      message: 'Login successful',
      tokenLength: token?.length ?? 0,
    });
  } catch (err) {
    res.status(403).json({
      success: false,
      message: err.message || 'Shiprocket login failed',
    });
  }
});

/**
 * POST /api/shiprocket/create-order
 * Main endpoint: create shipment order in Shiprocket.
 * Body: { orderId, buyer: { name, email, phone, address, city, state, pin }, items, subTotal }
 */
router.post('/create-order', async (req, res) => {
  try {
    const { orderId, buyer, items, subTotal } = req.body;

    if (!orderId || !buyer || !items || !Array.isArray(items) || subTotal == null) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: orderId, buyer, items, subTotal',
      });
    }

    // Fetch product weights from DB (fallback when items don't have weight from frontend)
    const productWeights = {};
    const admin = getSupabaseAdmin();
    if (admin) {
      const ids = [...new Set((items || []).map((i) => i.id).filter(Boolean))];
      if (ids.length > 0) {
        const { data, error } = await admin.from('products').select('id, weight').in('id', ids);
        if (error) {
          console.warn('[Shiprocket] Could not fetch product weights:', error.message);
        } else if (data?.length) {
          data.forEach((p) => {
            const w = p.weight != null && p.weight !== '' ? Number(p.weight) : 1;
            productWeights[p.id] = w;
          });
        }
      }
    }

    const payload = buildOrderPayload({ orderId, buyer, items, subTotal, productWeights });
    const result = await createOrder(payload);

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    const status = err.message?.includes('credentials') ? 500 : 502;
    res.status(status).json({
      success: false,
      message: err.message || 'Shiprocket order creation failed',
    });
  }
});

/**
 * GET /api/shiprocket/order/:orderId
 * Fetch order details from Shiprocket by our order_id (Supabase order id)
 */
router.get('/order/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ success: false, message: 'orderId required' });
    }
    const data = await getOrderByOrderId(orderId);
    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err.message || 'Failed to fetch Shiprocket order',
    });
  }
});

/**
 * GET /api/shiprocket/track/awb/:awb
 * Fetch tracking by AWB code
 */
router.get('/track/awb/:awb', async (req, res) => {
  try {
    const { awb } = req.params;
    if (!awb) {
      return res.status(400).json({ success: false, message: 'AWB code required' });
    }
    const data = await getTrackingByAwb(awb);
    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({
      success: false,
      message: err.message || 'Failed to fetch tracking',
    });
  }
});

export default router;
