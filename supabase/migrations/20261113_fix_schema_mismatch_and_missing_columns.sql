-- Migration: 20261113_fix_schema_mismatch_and_missing_columns.sql
-- Add missing columns across public schema tables to resolve PostgREST schema mismatch errors (e.g. PGRST204)

-- 1. PROFILES: Add updated_at if missing
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.profiles ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- 2. USER_WORKSPACES: Ensure updated_at and version exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_workspaces' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.user_workspaces ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'user_workspaces' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.user_workspaces ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- 3. SITE_CONTENT: Ensure updated_at and version exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'site_content' AND column_name = 'version'
  ) THEN
    ALTER TABLE public.site_content ADD COLUMN version INTEGER DEFAULT 1;
  END IF;
END $$;

-- 4. APP_SETTINGS: Ensure updated_at exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'app_settings' AND column_name = 'updated_at'
  ) THEN
    ALTER TABLE public.app_settings ADD COLUMN updated_at TIMESTAMPTZ DEFAULT now();
  END IF;
END $$;

-- Flush PostgREST schema cache
NOTIFY pgrst, 'reload schema';
