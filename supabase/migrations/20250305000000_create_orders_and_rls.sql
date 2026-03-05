-- Run this in Supabase Dashboard → SQL Editor
-- If orders table already exists, only run the RLS policies (skip CREATE TABLE)
-- If policies already exist, you may need to DROP them first

-- Ensure users table exists (for OrderManagement join)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  total_amount NUMERIC(10,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'Paid',
  payment_id TEXT,
  shipping_address TEXT,
  phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own orders
CREATE POLICY "Users can insert own orders"
  ON public.orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Allow authenticated users to read orders (own + admin view)
CREATE POLICY "Authenticated can read orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (true);
