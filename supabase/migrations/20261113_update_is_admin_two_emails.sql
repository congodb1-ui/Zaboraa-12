-- Migration: Update public.is_admin() to allow exactly congodb1@gmail.com and wasim@zaboraa.com
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT lower(coalesce(auth.jwt() ->> 'email', '')) IN (
    'congodb1@gmail.com',
    'wasim@zaboraa.com'
  );
$$;
