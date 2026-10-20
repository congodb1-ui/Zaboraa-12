-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261021_admin_app_settings.sql
-- Description: Persistent Global Application Settings & Organization Preferences
-- ====================================================================

-- 1. APP SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.app_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  category TEXT NOT NULL DEFAULT 'general' CHECK (category IN ('general', 'branding', 'organization', 'features', 'security', 'ai')),
  description TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- App Settings RLS Policies:
-- Public can read non-sensitive settings (branding, public features, org metadata)
DROP POLICY IF EXISTS "Public can view public settings" ON public.app_settings;
CREATE POLICY "Public can view public settings"
  ON public.app_settings
  FOR SELECT
  TO public
  USING (
    category IN ('branding', 'features', 'general', 'organization')
  );

-- Authenticated admins can view all settings
DROP POLICY IF EXISTS "Admins can view all settings" ON public.app_settings;
CREATE POLICY "Admins can view all settings"
  ON public.app_settings
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- Only authenticated admins can insert or update settings
DROP POLICY IF EXISTS "Admins can insert or update app_settings" ON public.app_settings;
CREATE POLICY "Admins can insert or update app_settings"
  ON public.app_settings
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

-- 2. SEED DEFAULT GLOBAL SETTINGS (Safe idempotent upserts)
INSERT INTO public.app_settings (key, value, category, description)
VALUES 
  (
    'branding',
    jsonb_build_object(
      'brandName', 'Zaboraa Technologies',
      'brandTagline', 'Enterprise VMware Cloud Architecture',
      'brandLogoUrl', null,
      'supportEmail', 'support@zaboraa.com',
      'executiveContact', 'wasim.sayyed@zaboraa.com'
    ),
    'branding',
    'Global platform brand identity, wordmark, and contact coordinates'
  ),
  (
    'feature_controls',
    jsonb_build_object(
      'exportDossier', true,
      'exportExecutiveSummary', true,
      'export4k', true,
      'generateBlueprint', true,
      'authRequiredForTools', false,
      'publicAccessEnabled', true
    ),
    'features',
    'Global feature flags and access gating controls'
  ),
  (
    'organization',
    jsonb_build_object(
      'defaultCloudProvider', 'Azure AVS',
      'defaultVcpuOvercommit', 2.5,
      'defaultRamBufferPercent', 20,
      'defaultTargetRpoMinutes', 15,
      'defaultTargetRtoHours', 2,
      'primaryRegion', 'East US 2 (Virginia)'
    ),
    'organization',
    'Default enterprise sizing formulas and architecture SLAs'
  ),
  (
    'ai_configuration',
    jsonb_build_object(
      'provider', 'google-genai',
      'activeModel', 'gemini-3.1-flash-image',
      'vertexAiEnabled', false,
      'proposalValidationRequired', true,
      'rateLimitPerMinute', 20,
      'autoProvisioningBlocked', true
    ),
    'ai',
    'Server-side AI orchestration parameters and safety boundaries'
  )
ON CONFLICT (key) DO NOTHING;

CREATE INDEX IF NOT EXISTS idx_app_settings_category ON public.app_settings (category);
CREATE INDEX IF NOT EXISTS idx_app_settings_updated_at ON public.app_settings (updated_at DESC);
