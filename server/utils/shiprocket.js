/**
 * Shiprocket API helper - backend only.
 * Credentials from process.env (never exposed to frontend).
 * Uses lazy loading so dotenv runs before env is read.
 */

function getConfig() {
  const email = (process.env.SHIPROCKET_EMAIL || '').trim();
  const password = (process.env.SHIPROCKET_PASSWORD || '').replace(/^['"]|['"]$/g, '').trim();
  return {
    baseUrl: (process.env.SHIPROCKET_BASE_URL || 'https://apiv2.shiprocket.in').replace(/\/$/, ''),
    email,
    password,
    pickupLocation: (process.env.SHIPROCKET_PICKUP_LOCATION || 'warehouse').trim(),
    hasCredentials: !!email && !!password,
  };
}

let cachedToken = null;
let tokenExpiry = 0;

export function getCredentials() {
  return { hasCredentials: getConfig().hasCredentials };
}

export async function getToken() {
  const { email, password, baseUrl } = getConfig();
  if (!email || !password) {
    throw new Error('Shiprocket credentials not configured (SHIPROCKET_EMAIL, SHIPROCKET_PASSWORD)');
  }

  if (cachedToken && Date.now() < tokenExpiry) return cachedToken;

  const res = await fetch(`${baseUrl}/v1/external/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.errors?.join(' ') || `Shiprocket auth failed: ${res.status}`);
  }

  cachedToken = data.token;
  tokenExpiry = Date.now() + (9 * 24 * 60 * 60 * 1000); // 9 days
  return cachedToken;
}

/**
 * Build Shiprocket adhoc order payload from frontend request
 */
export function buildOrderPayload({ orderId, buyer, items, subTotal }) {
  const { pickupLocation } = getConfig();
  const fullName = (buyer?.name || '').trim();
  const nameParts = fullName.split(/\s+/);
  const firstName = nameParts[0] || 'Customer';
  const lastName = nameParts.slice(1).join(' ') || '';

  const orderItems = (items || []).map((item, i) => ({
    name: item.name || 'Ambrosia Flow',
    sku: item.id || `item-${i + 1}`,
    units: item.quantity || 1,
    selling_price: item.price || 0,
    discount: 0,
    tax: 0,
    hsn: 2202,
  }));

  const totalWeight = Math.max(0.5, (items || []).reduce((sum, i) => sum + (i.quantity || 1), 0) * 0.3);

  return {
    order_id: orderId,
    order_date: new Date().toISOString().slice(0, 19).replace('T', ' '),
    pickup_location: pickupLocation,
    billing_customer_name: firstName,
    billing_last_name: lastName,
    billing_address: buyer?.address || '',
    billing_city: buyer?.city || '',
    billing_pincode: String(buyer?.pin || '').replace(/\D/g, '').slice(0, 6),
    billing_state: buyer?.state || '',
    billing_country: 'India',
    billing_email: buyer?.email || '',
    billing_phone: String(buyer?.phone || '').replace(/\D/g, '').slice(-10),
    shipping_is_billing: true,
    order_items: orderItems,
    payment_method: 'Prepaid',
    sub_total: subTotal,
    length: 15,
    breadth: 10,
    height: 10,
    weight: Math.round(totalWeight * 100) / 100,
  };
}

/**
 * Create order in Shiprocket
 */
export async function createOrder(payload) {
  const { baseUrl } = getConfig();
  const token = await getToken();

  const res = await fetch(`${baseUrl}/v1/external/orders/create/adhoc`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.errors?.join(' ') || `Shiprocket error: ${res.status}`);
  }

  return data;
}

/**
 * Fetch order details from Shiprocket by our order_id (sent at create time)
 */
export async function getOrderByOrderId(orderId) {
  const { baseUrl } = getConfig();
  const token = await getToken();

  const res = await fetch(`${baseUrl}/v1/external/orders/view/${orderId}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.errors?.join(' ') || `Shiprocket order fetch failed: ${res.status}`);
  }

  return data;
}

/**
 * Fetch tracking by AWB code
 */
export async function getTrackingByAwb(awbCode) {
  const { baseUrl } = getConfig();
  const token = await getToken();

  const res = await fetch(`${baseUrl}/v1/external/courier/track/awb/${encodeURIComponent(awbCode)}`, {
    method: 'GET',
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || data.errors?.join(' ') || `Shiprocket tracking failed: ${res.status}`);
  }

  return data;
}
