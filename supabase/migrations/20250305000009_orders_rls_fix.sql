-- Fix orders RLS: users can only read their own orders
-- Admin access uses backend API with service role (bypasses RLS)

DROP POLICY IF EXISTS "Authenticated can read orders" ON public.orders;

CREATE POLICY "Users can read own orders"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);
