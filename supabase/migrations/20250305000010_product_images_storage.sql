-- Product images storage bucket for Product Management
-- Required for admin to upload product images

-- Create bucket if not exists (public so product images can be displayed on site)
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Public read: anyone can view product images
CREATE POLICY "Public read product-images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'product-images');

-- Authenticated upload: logged-in users (admins) can upload
CREATE POLICY "Authenticated upload product-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'product-images');

-- Authenticated update: for upsert/replace
CREATE POLICY "Authenticated update product-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

-- Authenticated delete: for Storage Cleanup
CREATE POLICY "Authenticated delete product-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'product-images');
