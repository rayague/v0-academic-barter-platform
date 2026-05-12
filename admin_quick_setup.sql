-- Admin Quick Setup Script
-- Run this in Supabase SQL Editor to quickly set up test admin

-- WARNING: This creates test data. Use only for development!

-- 1. Create test admin user in auth
-- Note: In production, use proper auth methods
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  last_sign_in_at,
  role,
  aud,
  confirmation_token,
  recovery_token,
  email_change_token_new,
  email_change
)
VALUES (
  gen_random_uuid(),
  'admin@dyo.local',
  crypt('Admin@123456', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  now(),
  'authenticated',
  'authenticated',
  '',
  '',
  '',
  ''
) ON CONFLICT DO NOTHING
RETURNING id AS new_user_id;

-- 2. Create admin profile
-- Replace UUID with the one from step 1 output
-- SELECT id FROM auth.users WHERE email = 'admin@dyo.local';

INSERT INTO admins (
  user_id,
  email,
  full_name,
  role,
  permissions,
  is_active
)
SELECT 
  id,
  email,
  'DYO Admin',
  'super_admin',
  ARRAY['view_reports', 'manage_listings', 'manage_users', 'view_users', 'ban_users'],
  true
FROM auth.users
WHERE email = 'admin@dyo.local'
  AND NOT EXISTS (
    SELECT 1 FROM admins WHERE email = 'admin@dyo.local'
  );

-- Verify admin was created
SELECT id, email, full_name, role, is_active FROM admins WHERE email = 'admin@dyo.local';
