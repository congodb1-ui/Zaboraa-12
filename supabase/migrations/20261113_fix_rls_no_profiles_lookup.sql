-- Migration: 20261113_fix_rls_no_profiles_lookup.sql
-- Fix infinite recursion (42P17) by ensuring public.is_admin() queries ZERO tables and relies purely on auth.jwt()

-- 1. Drop ALL existing policies on profiles, user_workspaces, workspace_snapshots
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;

DROP POLICY IF EXISTS "Users delete own workspaces" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users insert own workspaces" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users update own workspaces" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users view own workspaces or admins view all" ON public.user_workspaces;

DROP POLICY IF EXISTS "Users delete own snapshots" ON public.workspace_snapshots;
DROP POLICY IF EXISTS "Users insert own snapshots" ON public.workspace_snapshots;
DROP POLICY IF EXISTS "Users view own snapshots or admins view all" ON public.workspace_snapshots;

-- 2. Drop and recreate public.is_admin() and public.is_admin_user() with ZERO table references
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((auth.jwt() ->> 'email') = 'congodb1@gmail.com', false)
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin()
$$;

-- 3. Recreate policies using ONLY auth.uid() + public.is_admin()

-- PROFILES POLICIES
CREATE POLICY "Users can view own profile or admins view all"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  (auth.uid() = id) OR public.is_admin()
);

CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = id
);

CREATE POLICY "Users can update own profile or admins update all"
ON public.profiles
FOR UPDATE
TO authenticated
USING (
  (auth.uid() = id) OR public.is_admin()
)
WITH CHECK (
  (auth.uid() = id) OR public.is_admin()
);

CREATE POLICY "Admins can delete profiles"
ON public.profiles
FOR DELETE
TO authenticated
USING (
  public.is_admin()
);

-- USER_WORKSPACES POLICIES
CREATE POLICY "Users view own workspaces or admins view all"
ON public.user_workspaces
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR public.is_admin()
);

CREATE POLICY "Users insert own workspaces"
ON public.user_workspaces
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users update own workspaces"
ON public.user_workspaces
FOR UPDATE
TO authenticated
USING (
  auth.uid() = user_id
)
WITH CHECK (
  auth.uid() = user_id
);

CREATE POLICY "Users delete own workspaces"
ON public.user_workspaces
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);

-- WORKSPACE_SNAPSHOTS POLICIES
CREATE POLICY "Users view own snapshots or admins view all"
ON public.workspace_snapshots
FOR SELECT
TO authenticated
USING (
  (auth.uid() = user_id) OR public.is_admin()
);

CREATE POLICY "Users insert own snapshots"
ON public.workspace_snapshots
FOR INSERT
TO authenticated
WITH CHECK (
  (auth.uid() = user_id) AND (
    EXISTS (
      SELECT 1 FROM public.user_workspaces w
      WHERE w.id = workspace_snapshots.workspace_id AND w.user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users delete own snapshots"
ON public.workspace_snapshots
FOR DELETE
TO authenticated
USING (
  auth.uid() = user_id
);
