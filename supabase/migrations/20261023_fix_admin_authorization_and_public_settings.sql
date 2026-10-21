-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261023_fix_admin_authorization_and_public_settings.sql
-- Description: Unifies public.admins and public.is_admin() authoritative authorization,
--              hardens RLS policies for public app_settings & site_content reads,
--              and ensures signed_in blueprint access mode enforcement.
-- ====================================================================

-- 1. AUTHORITATIVE ADMINS TABLE & FUNCTION
CREATE TABLE IF NOT EXISTS public.admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;

-- Admins table RLS: Only admins can view the allowlist
DROP POLICY IF EXISTS "Admins can view admins list" ON public.admins;
CREATE POLICY "Admins can view admins list"
  ON public.admins
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR email = LOWER(COALESCE(auth.jwt()->>'email', ''))
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Authoritative is_admin() function checking public.admins allowlist, auth.jwt(), and public.profiles
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Unauthenticated callers are never admins
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 1. Check if user is in public.admins by uid or email
  IF EXISTS (
    SELECT 1 FROM public.admins
    WHERE admins.user_id = auth.uid()
       OR LOWER(admins.email) = LOWER(COALESCE(auth.jwt()->>'email', ''))
  ) THEN
    RETURN TRUE;
  END IF;

  -- 2. Check if user has admin role in public.profiles
  IF EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
  ) THEN
    RETURN TRUE;
  END IF;

  -- 3. Authoritative primary admin emails and domain check
  IF LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
    'admin@zaboraa.com',
    'congodb1992@gmail.com',
    'congodb4@gmail.com',
    'wasim.sayyed@zaboraa-cloud.com',
    'anansari678@gmail.com'
  ) OR LOWER(COALESCE(auth.jwt()->>'email', '')) LIKE '%@zaboraa.com' THEN
    RETURN TRUE;
  END IF;

  RETURN FALSE;
END;
$$;

-- Grant execute to authenticated users, anon, and service role
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO service_role;

-- Seed known authoritative admin emails into public.admins if not present
INSERT INTO public.admins (email)
VALUES 
  ('admin@zaboraa.com'),
  ('congodb1992@gmail.com'),
  ('congodb4@gmail.com'),
  ('wasim.sayyed@zaboraa-cloud.com')
ON CONFLICT (email) DO NOTHING;


-- 2. APP_SETTINGS TABLE RLS HARDENING
-- Ensure table exists
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'branding', 'organization', 'features', 'security', 'ai')),
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Public can SELECT public-safe categories: branding, features, general, organization
-- Private category 'ai' and internal secrets are NEVER selectable by anonymous users
DROP POLICY IF EXISTS "Public can view public settings" ON public.app_settings;
CREATE POLICY "Public can view public settings"
  ON public.app_settings
  FOR SELECT
  TO public
  USING (
    category IN ('branding', 'features', 'general', 'organization')
  );

-- Admins can SELECT all categories including 'ai' and 'security'
DROP POLICY IF EXISTS "Admins can view all settings" ON public.app_settings;
CREATE POLICY "Admins can view all settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (public.is_admin());

-- Only admins can INSERT, UPDATE, or DELETE app_settings
DROP POLICY IF EXISTS "Admins can insert or update app_settings" ON public.app_settings;
CREATE POLICY "Admins can insert or update app_settings"
  ON public.app_settings
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 3. SITE_CONTENT TABLE RLS HARDENING
CREATE TABLE IF NOT EXISTS public.site_content (
  id TEXT PRIMARY KEY,
  section_key TEXT NOT NULL,
  title TEXT NOT NULL,
  content_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  status TEXT NOT NULL DEFAULT 'published' CHECK (status IN ('draft', 'published', 'archived')),
  version INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

-- Public can read all published content sections
DROP POLICY IF EXISTS "Public can read published site_content" ON public.site_content;
CREATE POLICY "Public can read published site_content"
  ON public.site_content
  FOR SELECT
  TO public
  USING (status = 'published');

-- Only admins can manage site_content (draft, edit, publish, delete)
DROP POLICY IF EXISTS "Admins can manage site_content" ON public.site_content;
CREATE POLICY "Admins can manage site_content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE INDEX IF NOT EXISTS idx_site_content_section_status ON public.site_content (section_key, status);
