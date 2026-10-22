-- ====================================================================
-- Migration: 20261024_harden_briefing_requests.sql
-- Purpose : Server-side hardening of public.briefing_requests so that only
--           valid values are accepted, even if the website form is bypassed.
-- Safe to run more than once. Existing rows are left untouched
-- (constraints are added NOT VALID: they apply to every new/updated row).
-- Keep in sync with src/utils/briefingValidation.ts
-- ====================================================================

-- 1. FORMAT / ALLOWED-VALUE RULES -------------------------------------

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_name_format;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_name_format CHECK (
  char_length(trim(name)) >= 2
  AND char_length(name) <= 80
  AND name !~ '[0-9<>{}\[\]\\|^~`=@$%*_/;:!?#"&+,()]'
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_email_format;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_email_format CHECK (
  char_length(email) <= 254
  AND email !~ '\.\.'
  AND email !~ '(^\.|\.@|@\.|\.$|@-|-\.)'
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_company_format;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_company_format CHECK (
  char_length(trim(company)) >= 2
  AND char_length(company) <= 100
  AND company !~ '[<>{}\\|^~`]'
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_phone_format;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_phone_format CHECK (
  phone IS NULL OR phone ~ '^\+?[0-9 ().-]{7,20}$'
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_cloud_focus_allowed;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_cloud_focus_allowed CHECK (
  cloud_focus IN (
    'Azure AVS', 'AWS VMC', 'Google Cloud GCVE', 'NSX-T Zero-Trust',
    'VMware VCF 5.x', 'Nutanix NC2 on Azure', 'Multi-Cloud Evacuation'
  )
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_vm_scale_allowed;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_vm_scale_allowed CHECK (
  vm_scale IN ('Under 250 VMs', '250 - 500 VMs', '500 - 1,500 VMs', '1,500+ VMs')
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_urgency_allowed;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_urgency_allowed CHECK (
  urgency IN ('Urgent (< 30 Days)', 'Within 60 Days', 'Next 3 - 6 Months', 'Strategic Planning')
) NOT VALID;

ALTER TABLE public.briefing_requests DROP CONSTRAINT IF EXISTS briefing_notes_no_html;
ALTER TABLE public.briefing_requests ADD CONSTRAINT briefing_notes_no_html CHECK (
  notes IS NULL OR notes !~ '[<>]'
) NOT VALID;


-- 2. INSERT GUARD: normalise values, force server timestamp, rate-limit --
-- Max 3 requests per email address per hour.

CREATE OR REPLACE FUNCTION public.briefing_requests_guard()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_count integer;
BEGIN
  NEW.name := trim(NEW.name);
  NEW.email := lower(trim(NEW.email));
  NEW.company := trim(NEW.company);
  NEW.created_at := timezone('utc'::text, now());

  SELECT count(*) INTO recent_count
  FROM public.briefing_requests
  WHERE lower(email) = NEW.email
    AND created_at > now() - interval '1 hour';

  IF recent_count >= 3 THEN
    RAISE EXCEPTION 'Too many briefing requests from this email. Please try again later.';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_briefing_requests_guard ON public.briefing_requests;
CREATE TRIGGER trg_briefing_requests_guard
  BEFORE INSERT ON public.briefing_requests
  FOR EACH ROW EXECUTE FUNCTION public.briefing_requests_guard();


-- 3. INSERT POLICY: visitors may only create 'new' requests, and may not
--    attach someone else's user_id.

DROP POLICY IF EXISTS "Public can submit briefing requests" ON public.briefing_requests;
CREATE POLICY "Public can submit briefing requests"
  ON public.briefing_requests
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'new'
    AND (user_id IS NULL OR user_id = auth.uid())
  );
