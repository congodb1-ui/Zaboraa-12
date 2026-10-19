# Zaboraa Enterprise — Supabase Security Architecture & Future Phase Runbook

> **Implementation Phase Status**: Architectural Blueprint & Unexecuted SQL Runbook  
> **Target Environment**: Production Supabase Database (`https://zaboraa-12.vercel.app/`)  
> **Execution Constraint**: **ZERO SQL STATEMENTS EXECUTED IN CURRENT PHASE**. All database modifications, RLS hardening, and triggers documented below must be reviewed and executed exclusively during the planned Supabase Security Deployment Phase in the Supabase SQL Editor.

---

## 1. Executive Summary & Existing Schema Audit

### Current Live Schema Verification
Inspection of the existing Supabase production schema (`supabase_schema.sql` and `supabase/migrations/20261015_briefing_requests.sql`) confirms the following ground-truth tables:

1. **`public.profiles`**:
   - Columns: `id (UUID PK -> auth.users.id)`, `email (TEXT UNIQUE)`, `role (TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')))`, `subscription_tier (TEXT CHECK IN ('free', 'pro', 'enterprise'))`, `full_name (TEXT)`, `avatar_url (TEXT)`, `created_at`, `updated_at`.
   - **Vulnerability Identified**: The existing `\"Users can update own profile\"` policy permits authenticated users to update their own row. Although it contains a `WITH CHECK` clause attempting to prevent role change via self-subquery, if a client issues concurrent requests or if subqueries evaluate against current transaction state, role escalation risks exist. Furthermore, the column currently only allows `'user'` and `'admin'`, meaning `'authorized'` and `'public'` roles require database schema evolution.
2. **`public.briefing_requests`**:
   - Columns: `id (UUID PK)`, `created_at`, `name`, `email`, `company`, `phone`, `cloud_focus`, `vm_scale`, `urgency`, `notes`, `status (CHECK IN ('new', 'contacted', 'scheduled', 'completed', 'archived'))`, `user_id (UUID -> auth.users.id)`.
   - Policy: Anonymous and public users can `INSERT` with `CHECK (status = 'new')`. Admins can `SELECT`, `UPDATE`, and `DELETE`.
3. **Confirmed Absence of Assumed Tables**:
   - `public.blueprints`: **Does NOT exist** in the live database. The application serves diagram assets from static JSON and generated storage metadata.
   - `public.admins`: **Does NOT exist** as a separate table. Admin privileges are presently determined via `profiles.role = 'admin'`.

---

## 2. Three-Tier Online Role Architecture Proposal

To align the database schema with the newly deployed frontend role model (`admin`, `authorized`, `public`), the following unexecuted migration is prepared for the upcoming security phase.

### Proposed Schema Changes (DO NOT RUN YET)

```sql
-- ====================================================================
-- PHASE 2 FUTURE MIGRATION: 3-Tier Enterprise Role Model & Hardening
-- ====================================================================

-- Step 1: Update profiles role check constraint to support 'public', 'authorized', 'admin'
ALTER TABLE public.profiles 
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
  ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('public', 'authorized', 'admin', 'user'));

-- Step 2: Migrate legacy 'user' values to 'public'
UPDATE public.profiles
SET role = 'public'
WHERE role = 'user' AND email != 'admin@zaboraa.com';

-- Step 3: Default newly created profiles to 'public' with zero privileges
ALTER TABLE public.profiles 
  ALTER COLUMN role SET DEFAULT 'public';

-- Step 4: Strict Anti-Escalation PostgreSQL Trigger
-- Prevents non-service-role / non-admin users from altering their own role or subscription_tier
CREATE OR REPLACE FUNCTION public.prevent_self_role_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If role or subscription_tier is changing:
  IF (NEW.role IS DISTINCT FROM OLD.role) OR (NEW.subscription_tier IS DISTINCT FROM OLD.subscription_tier) THEN
    -- Check if the initiating identity is a verified admin in profiles
    IF NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    ) THEN
      RAISE EXCEPTION 'Access Denied: Unprivileged users cannot modify role or license tier (Attempted: % -> %)', OLD.role, NEW.role;
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_self_role_escalation ON public.profiles;
CREATE TRIGGER trg_prevent_self_role_escalation
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_self_role_escalation();
```

---

## 3. Dedicated Authorization & Grant Tables (Optional Phase 3)

Rather than conflating basic user profiles with privileged clearances, the enterprise security roadmap recommends creating a dedicated `authorized_personnel` table:

```sql
-- UNEXECUTED: Future Dedicated Authorization Store
CREATE TABLE IF NOT EXISTS public.authorized_access_grants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  feature_scope TEXT[] NOT NULL DEFAULT ARRAY['RVTOOLS_ANALYZER', 'BOM_EXPORT', 'SIZING_DOSSIER'],
  expires_at TIMESTAMPTZ,
  revoked BOOLEAN NOT NULL DEFAULT false,
  notes TEXT
);

ALTER TABLE public.authorized_access_grants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own access grants"
  ON public.authorized_access_grants FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Admins manage all grants"
  ON public.authorized_access_grants FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );
```

---

## 4. Privilege Decoupling & Offline Vault Security Boundaries

### 1. Zero Cloud Authority from Offline Keys
The client-side emergency recovery key (`ZABO-XXXX-...`) derives an AES-256-GCM key with PBKDF2 (600,000 iterations). It decrypts local IndexedDB records solely in volatile browser memory.
- **Rule**: Possessing this key provides **zero credentials** against the live Supabase PostgREST or Auth API.
- **Rule**: Any reconnection mutation must be explicitly reviewed in the `ReconciliationDrawer` and requires active live Supabase authentication with verified `profiles.role = 'admin'`.

### 2. Client-Side Deterrence vs Hardware Enclave
- Local attempt throttling (e.g. 30s lockout after 5 failed attempts) and local audit logs are **device-level deterrents**.
- An attacker with root OS access or browser devtools can inspect client memory or modify local scripts. True cryptographic security is maintained by:
  1. PBKDF2 with 600,000 iterations (high computational cost for offline dictionary attacks).
  2. Authenticated AES-256-GCM encryption with 128-bit integrity tag.
  3. Absolute absence of production API secrets, service-role keys, or database credentials within the client vault.

---

## 5. Security Phase Deployment Checklist

When scheduled to deploy database modifications in Supabase SQL Editor:

- [ ] 1. Create a full database backup snapshot in Supabase Dashboard.
- [ ] 2. Run Step 1 (`ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check...`).
- [ ] 3. Run Step 2 (Data migration for existing rows).
- [ ] 4. Run Step 4 (Deploy `trg_prevent_self_role_escalation` trigger).
- [ ] 5. Test self-elevation prevention using a non-admin authenticated token:
       ```sql
       -- Verification test (Must throw Access Denied):
       -- UPDATE public.profiles SET role = 'admin' WHERE id = '<public_user_id>';
       ```
- [ ] 6. Verify `admin@zaboraa.com` maintains administrative governance.
- [ ] 7. Confirm briefing form submissions continue to succeed without errors.
