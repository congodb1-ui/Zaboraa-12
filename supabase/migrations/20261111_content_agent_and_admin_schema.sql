-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261111_content_agent_and_admin_schema.sql
-- Description: Provision schema for Content Agent Phase 1 (content_ideas,
--              content_drafts, content_queue) and ensure admin tables & profiles
--              columns (last_sign_in_at, crm_leads, audit_logs, admin_notifications)
-- ====================================================================

-- --------------------------------------------------------------------
-- 1. PROFILES ENHANCEMENT & RESILIENCE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE,
  role TEXT NOT NULL DEFAULT 'public' CHECK (role IN ('admin', 'authorized', 'public', 'user')),
  subscription_tier TEXT NOT NULL DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  full_name TEXT,
  avatar_url TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'pending')),
  admin_notes TEXT,
  last_sign_in_at TIMESTAMPTZ,
  suspended_at TIMESTAMPTZ,
  suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Safely add missing columns to existing public.profiles
ALTER TABLE IF EXISTS public.profiles 
  ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
  ADD COLUMN IF NOT EXISTS admin_notes TEXT,
  ADD COLUMN IF NOT EXISTS suspended_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS suspended_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = id 
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
    )
  );

DROP POLICY IF EXISTS "Users can update own profile or admins update all" ON public.profiles;
CREATE POLICY "Users can update own profile or admins update all"
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    auth.uid() = id
    OR EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles (role);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON public.profiles (status);
CREATE INDEX IF NOT EXISTS idx_profiles_last_sign_in_at ON public.profiles (last_sign_in_at DESC);


-- --------------------------------------------------------------------
-- 2. CONTENT AGENT: CONTENT IDEAS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_ideas (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  hook TEXT DEFAULT '',
  body TEXT NOT NULL,
  hashtags TEXT[] DEFAULT '{}'::TEXT[],
  cta TEXT DEFAULT '',
  topic TEXT DEFAULT 'AVS',
  status TEXT NOT NULL DEFAULT 'idea' CHECK (status IN ('idea', 'drafted', 'discarded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.content_ideas ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access to content_ideas" ON public.content_ideas;
CREATE POLICY "Authenticated users full access to content_ideas"
  ON public.content_ideas
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can view content_ideas" ON public.content_ideas;
CREATE POLICY "Public can view content_ideas"
  ON public.content_ideas
  FOR SELECT
  TO anon
  USING (true);

CREATE INDEX IF NOT EXISTS idx_content_ideas_status ON public.content_ideas (status);
CREATE INDEX IF NOT EXISTS idx_content_ideas_created_at ON public.content_ideas (created_at DESC);


-- --------------------------------------------------------------------
-- 3. CONTENT AGENT: CONTENT DRAFTS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_drafts (
  id TEXT PRIMARY KEY,
  idea_id TEXT,
  title TEXT NOT NULL,
  hook TEXT DEFAULT '',
  body TEXT NOT NULL,
  edited_body TEXT,
  hashtags TEXT[] DEFAULT '{}'::TEXT[],
  cta TEXT DEFAULT '',
  topic TEXT DEFAULT 'AVS',
  status TEXT NOT NULL DEFAULT 'Draft' CHECK (status IN ('Draft', 'Approved', 'Rejected')),
  scheduled_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.content_drafts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access to content_drafts" ON public.content_drafts;
CREATE POLICY "Authenticated users full access to content_drafts"
  ON public.content_drafts
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_content_drafts_status ON public.content_drafts (status);
CREATE INDEX IF NOT EXISTS idx_content_drafts_created_at ON public.content_drafts (created_at DESC);


-- --------------------------------------------------------------------
-- 4. CONTENT AGENT: CONTENT QUEUE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.content_queue (
  id TEXT PRIMARY KEY,
  draft_id TEXT,
  scheduled_day TEXT NOT NULL DEFAULT 'Mon',
  scheduled_time TEXT NOT NULL DEFAULT '09:30 AM IST',
  scheduled_at TIMESTAMPTZ,
  platform TEXT NOT NULL DEFAULT 'linkedin',
  status TEXT NOT NULL DEFAULT 'Queued' CHECK (status IN ('Queued', 'Posted', 'Cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.content_queue ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users full access to content_queue" ON public.content_queue;
CREATE POLICY "Authenticated users full access to content_queue"
  ON public.content_queue
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_content_queue_status ON public.content_queue (status);
CREATE INDEX IF NOT EXISTS idx_content_queue_created_at ON public.content_queue (created_at DESC);


-- --------------------------------------------------------------------
-- 5. CRM LEADS & PIPELINE TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.crm_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT NOT NULL,
  phone TEXT,
  source TEXT NOT NULL DEFAULT 'direct',
  status TEXT NOT NULL DEFAULT 'new',
  priority TEXT NOT NULL DEFAULT 'medium',
  assigned_to TEXT DEFAULT 'Wasim Sayyed',
  cloud_interest TEXT NOT NULL DEFAULT 'Azure AVS',
  estimated_vm_count INTEGER DEFAULT 500,
  estimated_deal_value_usd NUMERIC(12,2) DEFAULT 0.00,
  notes TEXT,
  follow_up_date DATE,
  activity_history JSONB NOT NULL DEFAULT '[]'::jsonb,
  briefing_request_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.crm_leads ENABLE ROW LEVEL SECURITY;

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
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
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
CREATE INDEX IF NOT EXISTS idx_crm_leads_created_at ON public.crm_leads (created_at DESC);


-- --------------------------------------------------------------------
-- 6. ADMINISTRATIVE AUDIT LOGS (Immutable, Append-Only Trail)
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
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
    )
  );

DROP POLICY IF EXISTS "Authenticated and public can insert audit_logs" ON public.audit_logs;
CREATE POLICY "Authenticated and public can insert audit_logs"
  ON public.audit_logs
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON public.audit_logs (action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_entity ON public.audit_logs (target_entity);


-- --------------------------------------------------------------------
-- 7. ADMINISTRATIVE NOTIFICATIONS TABLE
-- --------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
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
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
    OR LOWER(COALESCE(auth.jwt()->>'email', '')) IN (
      'admin@zaboraa.com',
      'congodb1992@gmail.com',
      'congodb4@gmail.com',
      'wasim.sayyed@zaboraa-cloud.com'
    )
  );

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created_at ON public.admin_notifications (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_admin_notifications_is_read ON public.admin_notifications (is_read);
