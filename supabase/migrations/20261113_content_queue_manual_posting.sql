-- ====================================================================
-- ZABORAA ENTERPRISE CLOUD ARCHITECTURE PLATFORM
-- Migration: 20261113_content_queue_manual_posting.sql
-- Description: Add posted_at and linkedin_url columns to content_queue
--              for Phase 2b manual LinkedIn posting workflow
-- ====================================================================

ALTER TABLE IF EXISTS public.content_queue
  ADD COLUMN IF NOT EXISTS posted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT;
