-- Fix security issues from Supabase dashboard:
-- 1. CRITICAL: Enable RLS on products (was disabled)
-- 2. Fix multiple permissive policies on combo_shipping_rules
-- 3. Fix multiple permissive policies on instagram_feed

-- ── 1. Products: Enable RLS + public read, admin-only write ─────────────────
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read: anyone (anon + authenticated) can view products (store, cart, checkout)
CREATE POLICY "Anyone can read products"
  ON public.products FOR SELECT
  TO anon, authenticated
  USING (true);

-- Admin-only write: only users with role='admin' can insert/update/delete
CREATE POLICY "Admin can insert products"
  ON public.products FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update products"
  ON public.products FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete products"
  ON public.products FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ── 2. Combo shipping rules: fix multiple permissive policies ──────────────
-- Drop the broad FOR ALL policy; replace with separate INSERT/UPDATE/DELETE
-- so SELECT is only from "Anyone can read combo rules" (no overlap)
DROP POLICY IF EXISTS "Authenticated can manage combo rules" ON public.combo_shipping_rules;

CREATE POLICY "Admin can insert combo rules"
  ON public.combo_shipping_rules FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update combo rules"
  ON public.combo_shipping_rules FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete combo rules"
  ON public.combo_shipping_rules FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

-- ── 3. Instagram feed: fix multiple permissive policies ────────────────────
DROP POLICY IF EXISTS "Authenticated manage instagram_feed" ON public.instagram_feed;

CREATE POLICY "Admin can insert instagram_feed"
  ON public.instagram_feed FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can update instagram_feed"
  ON public.instagram_feed FOR UPDATE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'))
  WITH CHECK (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));

CREATE POLICY "Admin can delete instagram_feed"
  ON public.instagram_feed FOR DELETE
  TO authenticated
  USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));
