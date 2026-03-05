-- Ensure admin user gets role='admin' when they exist.
-- Run this after the admin signs up. The AuthContext syncUserToTable also sets
-- role='admin' for ambrosiadrinks019@gmail.com on login.
-- This migration updates any existing user with that email.
UPDATE public.users
SET role = 'admin'
WHERE LOWER(email) = 'ambrosiadrinks019@gmail.com';
