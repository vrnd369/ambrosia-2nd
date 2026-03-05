-- Sync auth.users to public.users via trigger (bypasses RLS)
-- Fixes 403 Forbidden on client-side upsert

CREATE OR REPLACE FUNCTION public.handle_auth_user_sync()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    CASE WHEN LOWER(NEW.email) = 'ambrosiadrinks019@gmail.com' THEN 'admin' ELSE 'user' END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    role = CASE WHEN LOWER(EXCLUDED.email) = 'ambrosiadrinks019@gmail.com' THEN 'admin' ELSE users.role END;
  RETURN NEW;
EXCEPTION WHEN unique_violation THEN
  -- Email unique constraint (users_email_key): update existing row
  UPDATE public.users SET
    id = NEW.id,
    full_name = COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', ''),
    role = CASE WHEN LOWER(NEW.email) = 'ambrosiadrinks019@gmail.com' THEN 'admin' ELSE role END
  WHERE LOWER(email) = LOWER(NEW.email);
  RETURN NEW;
END;
$$;

-- Trigger on INSERT (new signups)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- Trigger on UPDATE (e.g. email change, metadata update)
DROP TRIGGER IF EXISTS on_auth_user_updated ON auth.users;
CREATE TRIGGER on_auth_user_updated
  AFTER UPDATE ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_auth_user_sync();

-- Backfill: sync existing auth.users to public.users
-- Handles both id and email conflicts (users_email_key)
INSERT INTO public.users (id, email, full_name, role)
SELECT
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data->>'full_name', au.raw_user_meta_data->>'name', ''),
  CASE WHEN LOWER(au.email) = 'ambrosiadrinks019@gmail.com' THEN 'admin' ELSE 'user' END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users u WHERE u.id = au.id)
ON CONFLICT ON CONSTRAINT users_email_key DO UPDATE SET
  id = EXCLUDED.id,
  full_name = EXCLUDED.full_name,
  role = CASE WHEN LOWER(EXCLUDED.email) = 'ambrosiadrinks019@gmail.com' THEN 'admin' ELSE users.role END;

-- Ensure admin role for existing rows with this email
UPDATE public.users SET role = 'admin'
WHERE LOWER(email) = 'ambrosiadrinks019@gmail.com' AND (role IS NULL OR role != 'admin');
