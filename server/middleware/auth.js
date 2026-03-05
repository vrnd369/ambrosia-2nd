/**
 * Auth middleware - verifies Supabase JWT and optionally requires admin role.
 * Use verifyAuth for any authenticated user, requireAdmin for admin-only routes.
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabaseAdmin() {
  if (!supabaseUrl || !serviceRoleKey) return null;
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}

/**
 * Verify JWT. Returns { userId } or null.
 */
export async function verifyAuth(authHeader) {
  if (!authHeader?.startsWith('Bearer ')) return null;
  const token = authHeader.slice(7);
  if (!token) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return null;
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return null;
  return { userId: user.id };
}

const ADMIN_EMAIL = 'ambrosiadrinks019@gmail.com';

/**
 * Verify JWT and check if user has admin role. Returns { userId, isAdmin } or null.
 */
export async function verifyAuthWithRole(authHeader) {
  const auth = await verifyAuth(authHeader);
  if (!auth) return null;
  const admin = getSupabaseAdmin();
  if (!admin) return { ...auth, isAdmin: false };
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  const { data: { user } } = await admin.auth.getUser(token);
  if (user?.email?.toLowerCase() === ADMIN_EMAIL.toLowerCase()) return { ...auth, isAdmin: true };
  const { data } = await admin.from('users').select('role').eq('id', auth.userId).maybeSingle();
  const isAdmin = data?.role === 'admin';
  return { ...auth, isAdmin };
}

/**
 * Express middleware: require authenticated user. Sets req.auth = { userId }.
 */
export function requireAuth(req, res, next) {
  verifyAuth(req.headers.authorization).then((auth) => {
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Valid session required' });
    }
    req.auth = auth;
    next();
  }).catch((err) => {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Server error', message: 'Authentication failed' });
  });
}

/**
 * Express middleware: require admin role. Sets req.auth = { userId, isAdmin: true }.
 */
export function requireAdmin(req, res, next) {
  verifyAuthWithRole(req.headers.authorization).then((auth) => {
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Valid session required' });
    }
    if (!auth.isAdmin) {
      return res.status(403).json({ error: 'Forbidden', message: 'Admin access required' });
    }
    req.auth = auth;
    next();
  }).catch((err) => {
    console.error('Auth middleware error:', err);
    res.status(500).json({ error: 'Server error', message: 'Authentication failed' });
  });
}
