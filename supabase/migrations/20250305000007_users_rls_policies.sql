-- Allow users table operations for auth flow (sync user, fetch role)
-- If RLS blocks inserts/selects, syncUserToTable and fetchUserRole fail

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to insert their own row (on signup/login sync)
DROP POLICY IF EXISTS "Users can insert own row" ON public.users;
CREATE POLICY "Users can insert own row"
  ON public.users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Allow authenticated users to select their own row (for role fetch)
DROP POLICY IF EXISTS "Users can select own row" ON public.users;
CREATE POLICY "Users can select own row"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Allow authenticated users to update their own row (upsert on login)
DROP POLICY IF EXISTS "Users can update own row" ON public.users;
CREATE POLICY "Users can update own row"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
