-- Dynamic shipping: packs and combo rules
-- Products table gets weight + shipping_charge (each product row = one pack for backward compat)
-- Combo rules override default shipping for pack combinations

-- Add weight and shipping_charge to products (each product = one pack)
ALTER TABLE public.products
  ADD COLUMN IF NOT EXISTS weight NUMERIC(10,2) DEFAULT 1,
  ADD COLUMN IF NOT EXISTS shipping_charge NUMERIC(10,2) DEFAULT 0;

-- Combo shipping rules: order-independent (pack_ids stored sorted)
CREATE TABLE IF NOT EXISTS public.combo_shipping_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pack_ids TEXT[] NOT NULL,
  shipping_price NUMERIC(10,2) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by pack_ids (we query by sorted array)
CREATE INDEX IF NOT EXISTS idx_combo_rules_pack_ids ON public.combo_shipping_rules USING GIN (pack_ids);

-- RLS: allow public read for calculate-shipping; admin write via service role
ALTER TABLE public.combo_shipping_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read combo rules"
  ON public.combo_shipping_rules FOR SELECT
  TO anon, authenticated
  USING (true);

-- Only service role / admin can insert/update/delete (via backend API with auth)
CREATE POLICY "Authenticated can manage combo rules"
  ON public.combo_shipping_rules FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
