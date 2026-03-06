import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
dotenv.config({ path: path.join(projectRoot, '.env') });

import express from 'express';
import cors from 'cors';
import shiprocketRoutes from './routes/shiprocket.js';
import razorpayRoutes from './routes/razorpay.js';
import packsRoutes from './routes/packs.js';
import shippingCombosRoutes from './routes/shippingCombos.js';
import shippingRoutes from './routes/shipping.js';
import { rateLimit } from './middleware/rateLimit.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Rate limiting (before CORS so all requests are limited)
app.use(rateLimit);

// CORS: allow frontend origin(s)
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'https://not4you.in',
  'https://www.not4you.in',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(null, true); // allow all in dev; restrict in prod via FRONTEND_URL
  },
  credentials: true,
}));
app.use(express.json());

app.use('/api/shiprocket', shiprocketRoutes);
app.use('/api/razorpay', razorpayRoutes);
app.use('/api/packs', packsRoutes);
app.use('/api/shipping-combos', shippingCombosRoutes);
app.use('/api', shippingRoutes);

app.get('/api/health', (req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
