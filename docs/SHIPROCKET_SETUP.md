# Shiprocket Integration Setup

After payment, orders are automatically sent to Shiprocket for fulfillment via a **Node.js backend**. Credentials are never exposed to the frontend.

## 1. Add Pickup Address in Shiprocket

1. Log in to [Shiprocket](https://app.shiprocket.in/)
2. Go to **Settings** → **Pickup Address**
3. Click **Add new pickup address**
4. Enter your warehouse details (address, city, state, pincode, phone, SPOC name)
5. Save with a nickname (e.g. `warehouse` or `primary`)

## 2. Configure .env (backend only)

```env
SHIPROCKET_EMAIL=your-api-email@example.com
SHIPROCKET_PASSWORD='your-api-password'
SHIPROCKET_BASE_URL=https://apiv2.shiprocket.in
SHIPROCKET_PICKUP_LOCATION=warehouse
```

- Use **API User** email/password (Settings → API → Create API User), not main login.
- For passwords with `$`, `&`, `*`, `!` — wrap in single quotes: `SHIPROCKET_PASSWORD='yourpass'`
- **PICKUP_LOCATION** must match the **nickname** of your saved pickup address in Shiprocket exactly.
- These vars are read only by the backend; never add `VITE_` prefix for Shiprocket.

## 3. API User (not main login)

Use an **API User** from Shiprocket, not your main account:

1. Shiprocket → **Settings** → **API**
2. **Configure** → **Create an API User**
3. Use a different email (not your registered Shiprocket email)
4. Copy the credentials to .env

## 4. Backend API

- `POST /api/shiprocket/login` — test auth (optional)
- `POST /api/shiprocket/create-order` — create shipment order (called by Checkout)

## 5. Flow

1. Customer pays via Razorpay
2. Order is saved to Supabase
3. Frontend calls backend `POST /api/shiprocket/create-order`
4. Backend authenticates with Shiprocket and creates the order
5. You can assign courier, generate AWB, and create pickup from Shiprocket dashboard

## 6. Running locally

**IMPORTANT:** The backend must be running for checkout to work. Payment and Shiprocket both go through the backend.

```bash
# Terminal 1: backend (required)
npm run server

# Terminal 2: frontend (proxies /api to backend)
npm run dev
```

Or both at once: `npm run dev:all`

If the backend is not running, you'll see "Could not create payment order" or "Payment verification failed" and orders won't be saved.

## 7. Production / cPanel

- Deploy the backend (e.g. `node server/index.js`) and set `PORT` if needed.
- Set `VITE_API_BASE_URL=https://your-backend-domain.com` before building the frontend.
- **Restart Node app on cPanel**: **Setup Node.js App** → select your app → **Restart** (or edit and save to trigger restart).

## 7a. Checkout Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| "Could not create payment order" | Backend not reachable | Ensure backend is running; in production set `VITE_API_BASE_URL` and rebuild |
| "Payment verification failed" | Backend not reachable or wrong signature | Restart backend; ensure `RAZORPAY_KEY_SECRET` is set (no `VITE_` prefix) |
| "Order tracking failed" / order not in DB | Verify or insert failed before Shiprocket | Check backend logs; run Supabase migrations if needed |
| Order in DB but not in Shiprocket | Shiprocket API error | Check backend logs; verify Shiprocket credentials and pickup location |

## 8. Test login (curl / Postman)

```bash
# Test backend auth (no credentials sent from client)
curl -X POST http://localhost:3000/api/shiprocket/login
```

Expected success: `{"success":true,"message":"Login successful","tokenLength":...}`

## 9. Test create-order (sample payload)

```bash
curl -X POST http://localhost:3000/api/shiprocket/create-order \
  -H "Content-Type: application/json" \
  -d '{
    "orderId": "test-order-123",
    "buyer": {
      "name": "John Doe",
      "email": "john@example.com",
      "phone": "9876543210",
      "address": "123 Main St",
      "city": "Hyderabad",
      "state": "Telangana",
      "pin": "500001"
    },
    "items": [
      { "id": "prod-1", "name": "Ambrosia Flow", "quantity": 2, "price": 99 }
    ],
    "subTotal": 198
  }'
```
