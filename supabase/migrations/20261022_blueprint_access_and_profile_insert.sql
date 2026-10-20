-- Migration: 20261022_blueprint_access_and_profile_insert.sql
-- 1. Ensure authenticated users can insert their own profiles (e.g. on Google Sign-In)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- 2. Add blueprint_access_mode column to admin_feature_controls if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'admin_feature_controls' 
    AND column_name = 'blueprint_access_mode'
  ) THEN 
    ALTER TABLE public.admin_feature_controls 
    ADD COLUMN blueprint_access_mode TEXT NOT NULL DEFAULT 'everyone' 
    CHECK (blueprint_access_mode IN ('everyone', 'signed_in', 'nobody'));
  END IF;
END $$;
