# Supabase Setup for Orders

If you see **"Could not find the 'payment_id' column"** or orders don't appear in Admin/Order History, run these migrations.

## Step 1: Add missing columns (if you get payment_id error)

Your `orders` table is missing columns. Run this in **Supabase Dashboard** → **SQL Editor**:

```sql
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS payment_id TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.orders ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]';
```

## Step 2: Ensure RLS allows inserts

```sql
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can insert own orders" ON public.orders;
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated can read orders" ON public.orders;
CREATE POLICY "Authenticated can read orders"
  ON public.orders FOR SELECT TO authenticated
  USING (true);
```

## Full setup (if orders table doesn't exist)

Run `migrations/20250305000000_create_orders_and_rls.sql` in SQL Editor.

## Verify

After running, complete a test payment. The order should appear in:
- Admin Dashboard → Order Management
- User profile → Order History
