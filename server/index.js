/**
 * Load .env FIRST - before any route imports.
 * ESM hoists imports, so routes read process.env at load time.
 */
import './loadEnv.js';

import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import shiprocketRoutes from './routes/shiprocket.js';
import razorpayRoutes from './routes/razorpay.js';
import packsRoutes from './routes/packs.js';
import shippingCombosRoutes from './routes/shippingCombos.js';
import shippingRoutes from './routes/shipping.js';
import ordersRoutes from './routes/orders.js';
import usersRoutes from './routes/users.js';
import adminRoutes from './routes/admin.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Trust proxy (required when behind reverse proxy e.g. cPanel, nginx)
app.set('trust proxy', 1);

// Rate limiting: 300 requests per 15 minutes per IP
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    skip: (req) => req.path === '/health' || req.path === '/api/health',
  })
);

// CORS: production origins
const allowedOrigins = [
  'https://not4you.in',
  'https://www.not4you.in',
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173']
    : []),
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : ['https://not4you.in'],
    credentials: true,
  })
);
app.use(express.json());

app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/packs', packsRoutes);
app.use('/api/shipping-combos', shippingCombosRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', shippingRoutes);

app.get('/', (req, res) => {
  res.json({
    service: 'Ambrosia API',
    status: 'running',
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
  });
});

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

// 404 for unmatched API routes (helps debug)
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.warn('API routes (orders, shipping, admin) will return 500 until SUPABASE_SERVICE_ROLE_KEY is set.');
  }
});
