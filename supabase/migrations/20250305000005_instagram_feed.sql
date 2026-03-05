-- Instagram Feed for Community Social Feed
-- Supports: uploaded videos (Supabase storage) and Instagram embed links

-- Storage bucket for uploaded Instagram-style videos
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram-videos', 'instagram-videos', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read for instagram-videos bucket
CREATE POLICY "Public read instagram-videos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'instagram-videos');

-- Allow authenticated upload (admin only)
CREATE POLICY "Authenticated upload instagram-videos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'instagram-videos');

-- Allow authenticated delete
CREATE POLICY "Authenticated delete instagram-videos"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'instagram-videos');

-- Instagram feed items table
CREATE TABLE IF NOT EXISTS public.instagram_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_type TEXT NOT NULL CHECK (source_type IN ('upload', 'instagram')),
  video_url TEXT NOT NULL,
  thumbnail_url TEXT,
  caption TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.instagram_feed ENABLE ROW LEVEL SECURITY;

-- Public read for feed
CREATE POLICY "Public read instagram_feed"
  ON public.instagram_feed FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated insert/update/delete (admin)
CREATE POLICY "Authenticated manage instagram_feed"
  ON public.instagram_feed FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);
