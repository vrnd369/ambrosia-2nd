import express from 'express';
import crypto from 'crypto';

const router = express.Router();

function getRazorpayConfig() {
  return {
    keyId: (process.env.RAZORPAY_KEY_ID || '').trim(),
    keySecret: (process.env.RAZORPAY_KEY_SECRET || '').trim(),
  };
}

/**
 * POST /api/razorpay/create-order
 * Create Razorpay order (required before checkout). Returns order_id for checkout.
 * Body: { amount, currency, receipt }
 */
router.post('/create-order', async (req, res) => {
  const { keyId, keySecret } = getRazorpayConfig();
  if (!keyId || !keySecret) {
    return res.status(500).json({ success: false, message: 'Razorpay not configured (RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET)' });
  }
  const { amount, currency = 'INR', receipt } = req.body;
  if (!amount || amount < 1) {
    return res.status(400).json({ success: false, message: 'amount required (in paise)' });
  }
  try {
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const r = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${auth}`,
      },
      body: JSON.stringify({
        amount: Math.round(Number(amount)),
        currency: currency || 'INR',
        receipt: receipt || `rcpt_${Date.now()}`,
      }),
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) {
      return res.status(r.status).json({
        success: false,
        message: data.error?.description || data.error?.reason || 'Razorpay order failed',
      });
    }
    res.json({ success: true, order_id: data.id });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message || 'Failed to create order' });
  }
});

/**
 * POST /api/razorpay/verify
 * Verify Razorpay payment signature before fulfilling order.
 * Body: { razorpay_payment_id, razorpay_signature [, razorpay_order_id ] }
 */
router.post('/verify', (req, res) => {
  const { keySecret } = getRazorpayConfig();
  if (!keySecret) {
    return res.status(500).json({ success: false, message: 'Razorpay secret not configured' });
  }

  const { razorpay_payment_id, razorpay_signature, razorpay_order_id } = req.body;

  if (!razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing razorpay_payment_id or razorpay_signature',
    });
  }

  const body = razorpay_order_id
    ? `${razorpay_order_id}|${razorpay_payment_id}`
    : razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Invalid payment signature',
    });
  }

  res.json({ success: true, payment_id: razorpay_payment_id });
});

export default router;
