-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD INFRASTRUCTURE ARCHITECTURE
-- Supabase Database Schema: Profiles, Briefing Requests & RLS
-- Migration: 20261015_briefing_requests.sql
-- ====================================================================

-- 1. PROFILES TABLE
-- Stores user role ('user' | 'admin') and subscription tier ('free' | 'pro' | 'enterprise')
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile; admins can view all profiles
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
  );

-- Policy: Users can update their own profile; only admins can elevate role or subscription_tier
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND (
      (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin'
      OR (
        role = (SELECT role FROM public.profiles WHERE id = auth.uid())
        AND subscription_tier = (SELECT subscription_tier FROM public.profiles WHERE id = auth.uid())
      )
    )
  );

-- Automatic Profile Creation Trigger on Supabase Auth SignUp
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, role, subscription_tier)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'admin@zaboraa.com' THEN 'admin'
      ELSE 'user'
    END,
    CASE 
      WHEN NEW.email = 'admin@zaboraa.com' THEN 'enterprise'
      ELSE 'free'
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ====================================================================
-- 2. BRIEFING REQUESTS TABLE
-- Stores executive architecture briefing & advisory consultation requests
-- ====================================================================

CREATE TABLE IF NOT EXISTS public.briefing_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 120),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  company TEXT NOT NULL CHECK (char_length(trim(company)) >= 2 AND char_length(company) <= 150),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 40),
  cloud_focus TEXT NOT NULL DEFAULT 'Azure AVS',
  vm_scale TEXT NOT NULL DEFAULT '500 - 1,500 VMs',
  urgency TEXT NOT NULL DEFAULT 'Within 60 Days',
  notes TEXT CHECK (notes IS NULL OR char_length(notes) <= 2000),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'scheduled', 'completed', 'archived')),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Enable Row Level Security on briefing_requests
ALTER TABLE public.briefing_requests ENABLE ROW LEVEL SECURITY;

-- 2.1 Allow public (anonymous visitors and authenticated users) to submit briefing requests
DROP POLICY IF EXISTS "Public can submit briefing requests" ON public.briefing_requests;
CREATE POLICY "Public can submit briefing requests"
  ON public.briefing_requests
  FOR INSERT
  TO public
  WITH CHECK (
    -- Public users can only create requests with 'new' status
    status = 'new'
  );

-- 2.2 Restrict reading briefing requests strictly to authorized admins
DROP POLICY IF EXISTS "Admins can view briefing requests" ON public.briefing_requests;
CREATE POLICY "Admins can view briefing requests"
  ON public.briefing_requests
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2.3 Restrict updating briefing requests strictly to authorized admins
DROP POLICY IF EXISTS "Admins can update briefing requests" ON public.briefing_requests;
CREATE POLICY "Admins can update briefing requests"
  ON public.briefing_requests
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 2.4 Restrict deleting briefing requests strictly to authorized admins
DROP POLICY IF EXISTS "Admins can delete briefing requests" ON public.briefing_requests;
CREATE POLICY "Admins can delete briefing requests"
  ON public.briefing_requests
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Performance & Query Indexes
CREATE INDEX IF NOT EXISTS idx_briefing_requests_created_at ON public.briefing_requests (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_briefing_requests_status ON public.briefing_requests (status);
CREATE INDEX IF NOT EXISTS idx_briefing_requests_email ON public.briefing_requests (email);


-- ====================================================================
-- 3. ADMIN VERIFICATION QUERIES
-- Run in Supabase SQL Editor to verify admin@zaboraa.com
-- ====================================================================
-- Query 1: Verify admin@zaboraa.com exists in auth.users and public.profiles
SELECT 
  u.id AS auth_user_id,
  u.email,
  u.created_at AS auth_created_at,
  p.role,
  p.subscription_tier,
  p.full_name
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.email = 'admin@zaboraa.com';

-- Query 2: Ensure admin@zaboraa.com profile record is synced with role = 'admin' & subscription_tier = 'enterprise'
-- (Note: per instructions, accounts are not created automatically; this query verifies existing profiles)
-- UPDATE public.profiles
-- SET role = 'admin', subscription_tier = 'enterprise', updated_at = now()
-- WHERE email = 'admin@zaboraa.com';
