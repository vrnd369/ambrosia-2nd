# Admin Setup

## Admin Credentials

- **Email:** `ambrosiadrinks019@gmail.com`
- **Password:** `Ambrosia@123#`

## Quick Start (Recommended)

1. **Apply migrations** in Supabase Dashboard → SQL Editor:
   - Run `supabase/migrations/20250305000000_create_orders_and_rls.sql` (creates users table)
   - Run `supabase/migrations/20250305000007_users_rls_policies.sql` (allows user sync)

2. **Disable email confirmation** (for easier first login):
   - Supabase Dashboard → Authentication → Providers → Email
   - Uncheck **"Confirm email"**

3. **Go to** `/admin/login` and click **Sign In**
   - If the account doesn't exist, it will be created automatically
   - You'll be redirected to the admin dashboard

## Manual Setup (if auto-create fails)

1. **Create the admin account**
   - Go to `/admin/login`
   - Click "Don't have an account? Create admin"
   - Enter the password: `Ambrosia@123#`
   - Click "Create Admin Account"

2. **Sign in** with the credentials above

## Alternative: Create via Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add user" → "Create new user"
3. Email: `ambrosiadrinks019@gmail.com`
4. Password: `Ambrosia@123#`
5. Click "Create user"
6. Sign in at `/admin/login`
