-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261020_user_generated_images_and_persistence.sql
-- Description: User-linked persistence for generated images & 3D blueprints
-- Security: Strict Row-Level Security (RLS) enforcing user isolation
-- ====================================================================

-- 1. GENERATED IMAGES TABLE
CREATE TABLE IF NOT EXISTS public.generated_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  image_name TEXT NOT NULL CHECK (char_length(trim(image_name)) >= 1 AND char_length(image_name) <= 255),
  image_type TEXT NOT NULL DEFAULT 'blueprint_3d' CHECK (image_type IN ('blueprint_3d', 'architecture_diagram', 'topology_render', 'user_asset', 'node_sizing_bom')),
  storage_path TEXT NOT NULL,
  storage_url TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  user_email TEXT,
  user_name TEXT,
  file_size_bytes BIGINT DEFAULT 0,
  mime_type TEXT DEFAULT 'image/png',
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Policy 1: SELECT - Authenticated users view their own images; Admins view all
DROP POLICY IF EXISTS "Users can view own generated images or admins view all" ON public.generated_images;
CREATE POLICY "Users can view own generated images or admins view all"
  ON public.generated_images
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

-- Policy 2: INSERT - Authenticated users insert their own images
DROP POLICY IF EXISTS "Users can insert own generated images" ON public.generated_images;
CREATE POLICY "Users can insert own generated images"
  ON public.generated_images
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id
  );

-- Policy 3: UPDATE - Authenticated users update own or admin updates
DROP POLICY IF EXISTS "Users can update own generated images or admins update" ON public.generated_images;
CREATE POLICY "Users can update own generated images or admins update"
  ON public.generated_images
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

-- Policy 4: DELETE - Authenticated users delete own images; Admins can delete any
DROP POLICY IF EXISTS "Users can delete own generated images or admins delete" ON public.generated_images;
CREATE POLICY "Users can delete own generated images or admins delete"
  ON public.generated_images
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

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_generated_images_user_id ON public.generated_images (user_id);
CREATE INDEX IF NOT EXISTS idx_generated_images_created_at ON public.generated_images (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_images_image_type ON public.generated_images (image_type);

-- 2. STORAGE BUCKETS CONFIGURATION (Idempotent Setup)
-- Ensure 'generated-images' and 'blueprints' buckets exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
VALUES ('blueprints', 'blueprints', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS Policies
-- Allow authenticated users to upload into their own folder (user_id prefix)
DROP POLICY IF EXISTS "Users upload generated images into own folder" ON storage.objects;
CREATE POLICY "Users upload generated images into own folder"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id IN ('generated-images', 'blueprints')
    AND (
      (storage.foldername(name))[1] = auth.uid()::text
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE profiles.id = auth.uid() 
        AND profiles.role = 'admin'
      )
    )
  );

-- Allow public read of generated images and blueprints
DROP POLICY IF EXISTS "Public and authenticated read for generated images" ON storage.objects;
CREATE POLICY "Public and authenticated read for generated images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id IN ('generated-images', 'blueprints'));
