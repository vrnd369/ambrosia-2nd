# Instagram Feed Setup

The Community Social Feed displays videos from the admin dashboard. You can either **upload videos** to Supabase storage or **paste Instagram reel/post URLs**.

## 1. Run the Migration

Apply the migration in Supabase Dashboard → SQL Editor (or via CLI):

```bash
supabase db push
```

Or run the contents of `supabase/migrations/20250305000005_instagram_feed.sql` manually.

This creates:
- `instagram-videos` storage bucket (public)
- `instagram_feed` table
- RLS policies for public read and authenticated manage

## 2. Create the Bucket (if migration fails)

If the bucket creation fails (e.g. storage schema not available in migrations), create it manually:

1. Go to **Supabase Dashboard → Storage**
2. Click **New bucket**
3. Name: `instagram-videos`
4. Enable **Public bucket**
5. Save

Then add policies for `storage.objects`:
- **Public read**: `bucket_id = 'instagram-videos'`
- **Authenticated upload/delete**: for admin users

## 3. Add Feed Items

1. Go to **Admin → Instagram Feed**
2. Click **Add Item**
3. Choose **Upload Video** or **Instagram Link**:
   - **Upload**: Select an MP4/WebM file (max ~50MB recommended)
   - **Instagram**: Paste URL like `https://www.instagram.com/reel/ABC123/` or `https://www.instagram.com/p/ABC123/`
4. Optionally add a caption and set sort order
5. Save

## 4. Display

Videos appear in the Community page Social Feed section:
- **Uploaded videos**: Native `<video>` with autoplay, muted, loop
- **Instagram links**: Embedded via iframe (Instagram’s embed player)

## Notes

- Uploaded videos use `object-fit: cover` for clean display in the feed containers
- Instagram embeds may have different aspect ratios; the iframe fills the container
- Cache TTL for the feed is 60 seconds; changes appear after refresh or cache expiry
