-- Migration: 20261112_content_studio_assets.sql
-- Description: Creates generated_assets table for Content Studio (Phase 1)
-- Manual Execution: Must be run in Supabase SQL Editor before deploying code.

CREATE TABLE IF NOT EXISTS public.generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id TEXT NOT NULL REFERENCES public.content_drafts(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN
    ('poster_linkedin', 'poster_instagram', 'video_script', 'kb_draft', 'captions')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Index for fast lookup by draft_id
CREATE INDEX IF NOT EXISTS idx_generated_assets_draft_id ON public.generated_assets(draft_id);

-- Enable Row Level Security
ALTER TABLE public.generated_assets ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Authenticated users can view generated assets
DROP POLICY IF EXISTS "Authenticated users can view generated assets" ON public.generated_assets;
CREATE POLICY "Authenticated users can view generated assets"
  ON public.generated_assets FOR SELECT
  TO authenticated
  USING (true);

-- RLS Policy: Admin service-role insert and delete
DROP POLICY IF EXISTS "Admins can insert generated assets" ON public.generated_assets;
CREATE POLICY "Admins can insert generated assets"
  ON public.generated_assets FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Admins can delete generated assets" ON public.generated_assets;
CREATE POLICY "Admins can delete generated assets"
  ON public.generated_assets FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'admin'
    )
  );
