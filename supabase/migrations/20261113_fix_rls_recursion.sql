-- Migration: Fix RLS recursion loop and clean up policies on profiles, user_workspaces, workspace_snapshots, app_settings, site_content
-- Date: 20261113_fix_rls_recursion.sql

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  ) OR EXISTS (
    SELECT 1 FROM auth.users
    WHERE id = auth.uid() AND lower(email) = 'congodb1@gmail.com'
  );
$$;

CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.is_admin();
$$;

CREATE OR REPLACE FUNCTION public.current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT auth.uid();
$$;

-- Drop existing recursive policies on profiles
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- Re-create clean non-recursive policies on profiles
CREATE POLICY "Users can view own profile or admins view all" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update own profile or admins update all" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = id OR public.is_admin())
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can insert own profile or admins insert all" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can delete profiles" ON public.profiles
  FOR DELETE TO authenticated
  USING (public.is_admin());

-- Drop existing recursive policies on user_workspaces
DROP POLICY IF EXISTS "Users view own workspaces or admins view all" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users update own workspaces" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users delete own workspaces" ON public.user_workspaces;
DROP POLICY IF EXISTS "Users insert own workspaces" ON public.user_workspaces;

-- Re-create clean policies on user_workspaces
CREATE POLICY "Users view own workspaces or admins view all" ON public.user_workspaces
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own workspaces" ON public.user_workspaces
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users update own workspaces" ON public.user_workspaces
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users delete own workspaces" ON public.user_workspaces
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Drop existing recursive policies on workspace_snapshots
DROP POLICY IF EXISTS "Users view own snapshots or admins view all" ON public.workspace_snapshots;
DROP POLICY IF EXISTS "Users insert own snapshots" ON public.workspace_snapshots;
DROP POLICY IF EXISTS "Users delete own snapshots" ON public.workspace_snapshots;

-- Re-create clean policies on workspace_snapshots
CREATE POLICY "Users view own snapshots or admins view all" ON public.workspace_snapshots
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users insert own snapshots" ON public.workspace_snapshots
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users delete own snapshots" ON public.workspace_snapshots
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());
