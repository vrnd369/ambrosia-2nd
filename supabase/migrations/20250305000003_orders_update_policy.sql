-- Allow users to update their own orders (e.g. Shiprocket tracking data)
CREATE POLICY "Users can update own orders"
  ON public.orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
