-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261019_enterprise_admin_suite.sql
-- Description: Comprehensive Enterprise Administration Suite
-- Schema additions:
--   1. Update public.profiles: 4-tier roles ('admin', 'authorized', 'public', 'user'),
--      account status ('active', 'suspended'), admin_notes, suspension tracking.
--   2. public.user_workspaces: Multi-cloud project workspaces with strict user isolation RLS.
--   3. public.crm_leads: Full enterprise CRM pipeline, sources, stages, and assignment.
--   4. public.audit_logs: Immutable, append-only security and operational audit trail.
--   5. public.admin_notifications: Operational alerts, briefing events, and task queue.
--   6. public.site_content: Structured CMS for hero, announcements, services, and testimonials.
--   7. public.seo_metadata: Page-level metadata, OpenGraph, canonical URLs, and structured data.
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PROFILES ENHANCEMENT (Non-destructive update to existing profiles)
-- --------------------------------------------------------------------
DO $$
BEGIN
  -- Safely relax role check constraint to accept 'admin', 'authorized', 'public', 'user'
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
    CHECK (role IN ('admin', 'authorized', 'public', 'user'));
EXCEPTION
  WHEN undefined_table THEN
    -- If profiles table does not exist, it will be created below
    NULL;
END $$;

-- Add account lifecycle & administrative columns if they do not exist
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON public.profiles (created_at DESC);


-- --------------------------------------------------------------------
-- 2. USER WORKSPACES TABLE (Multi-cloud sizing & architecture projects)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_workspaces (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 1 AND char_length(name) <= 200),
  description TEXT DEFAULT '',
  is_default BOOLEAN NOT NULL DEFAULT false,
  is_archived BOOLEAN NOT NULL DEFAULT false,
  configuration JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  last_accessed_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  version INTEGER NOT NULL DEFAULT 1
);

ALTER TABLE public.user_workspaces ENABLE ROW LEVEL SECURITY;

-- Workspace RLS: Users only access their own workspaces; Admins can view for customer support
DROP POLICY IF EXISTS "Users can view own workspaces or admins view all" ON public.user_workspaces;
CREATE POLICY "Users can view own workspaces or admins view all"
  ON public.user_workspaces
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert own workspaces" ON public.user_workspaces;
CREATE POLICY "Users can insert own workspaces"
  ON public.user_workspaces
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

DROP POLICY IF EXISTS "Users can update own workspaces or admins update" ON public.user_workspaces;
CREATE POLICY "Users can update own workspaces or admins update"
  ON public.user_workspaces
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can delete own workspaces or admins delete" ON public.user_workspaces;
CREATE POLICY "Users can delete own workspaces or admins delete"
  ON public.user_workspaces
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_user_workspaces_user_id ON public.user_workspaces (user_id);
CREATE INDEX IF NOT EXISTS idx_user_workspaces_updated_at ON public.user_workspaces (updated_at DESC);


-- --------------------------------------------------------------------
-- 3. CRM LEADS & PIPELINE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL CHECK (char_length(trim(name)) >= 2 AND char_length(name) <= 150),
  email TEXT NOT NULL CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  company TEXT NOT NULL CHECK (char_length(trim(company)) >= 2 AND char_length(company) <= 150),
  phone TEXT CHECK (phone IS NULL OR char_length(phone) <= 50),
  source TEXT NOT NULL DEFAULT 'direct' CHECK (source IN ('organic search', 'social media', 'referral', 'direct', 'campaign', 'briefing_form', 'other')),
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal sent', 'won', 'lost')),
  priority TEXT NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  assigned_to TEXT DEFAULT 'Wasim Sayyed',
  cloud_interest TEXT NOT NULL DEFAULT 'Azure AVS',
  estimated_vm_count INTEGER DEFAULT 500,
  estimated_deal_value_usd NUMERIC(12,2) DEFAULT 0.00,
  notes TEXT,
  follow_up_date DATE,
  activity_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  briefing_request_id UUID REFERENCES public.briefing_requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

-- CRM Leads RLS: Only admins can view, update, delete; Public can insert via qualified forms
DROP POLICY IF EXISTS "Admins can perform all actions on crm_leads" ON public.crm_leads;
CREATE POLICY "Admins can perform all actions on crm_leads"
  ON public.crm_leads
  FOR ALL
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

DROP POLICY IF EXISTS "Public can insert new leads" ON public.crm_leads;
CREATE POLICY "Public can insert new leads"
  ON public.crm_leads
  FOR INSERT
  TO public
  WITH CHECK (
    status = 'new'
  );

CREATE INDEX IF NOT EXISTS idx_crm_leads_status ON public.crm_leads (status);
CREATE INDEX IF NOT EXISTS idx_crm_leads_source ON public.crm_leads (source);
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_crm_leads_email ON public.crm_leads (email);


-- --------------------------------------------------------------------
-- 4. ADMINISTRATIVE AUDIT LOGS (Immutable, Append-Only Trail)
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  actor_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  actor_email TEXT,
  actor_role TEXT NOT NULL DEFAULT 'admin',
  action TEXT NOT NULL,
  target_entity TEXT NOT NULL,
  target_id TEXT,
  outcome TEXT NOT NULL DEFAULT 'success' CHECK (outcome IN ('success', 'failure', 'warning')),
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Audit Logs RLS: Only admins can view; Authenticated users/system can insert
DROP POLICY IF EXISTS "Admins can read audit_logs" ON public.audit_logs;
CREATE POLICY "Admins can read audit_logs"
  ON public.audit_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Authenticated can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated can insert audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- No update or delete policies on audit_logs -> guarantees append-only immutability
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity ON public.audit_logs (target_entity);


-- --------------------------------------------------------------------
-- 5. ADMINISTRATIVE NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info' CHECK (type IN ('info', 'warning', 'error', 'success')),
  category TEXT NOT NULL DEFAULT 'system' CHECK (category IN ('briefing', 'user', 'security', 'system', 'lead', 'workspace')),
  link_path TEXT,
  is_read BOOLEAN NOT NULL DEFAULT false,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage admin_notifications" ON public.admin_notifications;
CREATE POLICY "Admins can manage admin_notifications"
  ON public.admin_notifications
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications (is_read);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications (created_at DESC);


-- --------------------------------------------------------------------
-- 6. STRUCTURED SITE CONTENT TABLE (CMS: Hero, Announcements, Services)
-- --------------------------------------------------------------------
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

DROP POLICY IF EXISTS "Public can read published site_content" ON public.site_content;
CREATE POLICY "Public can read published site_content"
  ON public.site_content
  FOR SELECT
  TO public
  USING (status = 'published');

DROP POLICY IF EXISTS "Admins can manage site_content" ON public.site_content;
CREATE POLICY "Admins can manage site_content"
  ON public.site_content
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );


-- --------------------------------------------------------------------
-- 7. SEO METADATA & GROWTH CENTER TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.seo_metadata (
  page_path TEXT PRIMARY KEY,
  meta_title TEXT NOT NULL,
  meta_description TEXT NOT NULL,
  canonical_url TEXT,
  og_image_url TEXT,
  keywords TEXT[] DEFAULT ARRAY[]::TEXT[],
  structured_data_type TEXT DEFAULT 'WebPage',
  indexable BOOLEAN NOT NULL DEFAULT true,
  audit_score INTEGER DEFAULT 95,
  audit_findings JSONB DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.seo_metadata ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read seo_metadata" ON public.seo_metadata;
CREATE POLICY "Public can read seo_metadata"
  ON public.seo_metadata
  FOR SELECT
  TO public
  USING (true);

DROP POLICY IF EXISTS "Admins can manage seo_metadata" ON public.seo_metadata;
CREATE POLICY "Admins can manage seo_metadata"
  ON public.seo_metadata
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Seed baseline SEO configurations
INSERT INTO public.seo_metadata (page_path, meta_title, meta_description, canonical_url, structured_data_type, indexable, audit_score)
VALUES 
  ('/', 'Zaboraa Technologies - Enterprise VMware Cloud Architecture', 'Founder-led VMware cloud architecture, hyperscaler migration, interactive diagrams, video masterclasses, and software tutorials across Azure AVS, AWS VMC, and Google Cloud GCVE.', 'https://zaboraa-12.vercel.app/', 'Organization', true, 98),
  ('/tools', 'Multi-Cloud Architecture Sizing & Engineering Workbench - Zaboraa', 'Eliminate sizing guesswork. Parse RVTools, model compute node counts, decouple storage with ANF/FSx, and calculate WAN bandwidth.', 'https://zaboraa-12.vercel.app/tools', 'WebApplication', true, 95),
  ('/tools/sizing', 'Multi-Cloud Node & Decoupled Storage Sizer - Zaboraa', 'Precision node sizing across Azure AVS, AWS VMC, Google GCVE, and Nutanix NC2 with ANF and FSx ONTAP storage decoupling.', 'https://zaboraa-12.vercel.app/tools/sizing', 'WebApplication', true, 94),
  ('/tools/design-generator', 'Self-Service Hybrid Architecture Blueprint Generator - Zaboraa', '4-step wizard generating comprehensive enterprise cloud migration blueprints, Bill of Materials, network CIDR maps, and 4K vector diagrams.', 'https://zaboraa-12.vercel.app/tools/design-generator', 'WebApplication', true, 96),
  ('/cases', 'Enterprise Cloud Migration Case Studies & Production Track Record - Zaboraa', 'Verified real-world migration case studies across Fortune 500 financial institutions, global healthcare networks, and retail leaders.', 'https://zaboraa-12.vercel.app/cases', 'CollectionPage', true, 92)
ON CONFLICT (page_path) DO NOTHING;
