# Zaboraa Platform Authentication & Authorization Architecture Specification

## Overview
This document specifies the multi-tier authentication, authorization, and route-gating architecture for the Zaboraa platform (`zaboraa.com`).

---

## 1. Multi-Tier Role & Permission Model

The Zaboraa platform enforces a **4-tier role system** and a **3-tier subscription system**:

### 4 User Roles (`UserRole`)
1. **`admin`**: Master administrative access. Grants access to the `/admin` control center, CRM leads, application configuration, audit logs, and full database privileges across all tables.
2. **`authorized`**: Enterprise/Pro level registered user. Granted access to advanced multi-cloud architectural tools and saved workspace snapshots.
3. **`user`**: Standard registered user (e.g. signed in via Google OAuth on non-admin routes). Can save personal workspaces, view public tools, and manage their profile.
4. **`public`**: Unauthenticated guest visitor. Access to public migration tools, calculators, case studies, and knowledge base.

### 3 Subscription Tiers (`SubscriptionTier`)
- **`free`**: Default for public and standard registered users.
- **`pro`**: Professional cloud architect tier.
- **`enterprise`**: Enterprise architect tier (default for `admin` accounts).

---

## 2. Admin Gating & Scope Isolation

### Allowed Administrator List (`ADMIN_EMAILS`)
Administrative privileges are restricted strictly to two canonical email accounts:
```typescript
export const ADMIN_EMAILS = [
  'congodb1@gmail.com',
  'wasim@zaboraa.com'
];
```

### Context-Aware Route Gating
To prevent standard users from being blocked when logging into the main website:
1. **Admin Routes (`/admin`, `/console`)**:
   - When a user initiates Google Sign-In while navigating to `/admin` or `/admin/login`, the system evaluates the user's email against `ADMIN_EMAILS`.
   - If the email is **not** on the allowlist, the session is terminated (`signOut()`) and the UI displays `"not on allow list"`.
   - If the email **is** on the allowlist, access to `/admin` is granted.
2. **Public / Non-Admin Routes (`/`, `/tools`, `/resources`, etc.)**:
   - Any valid Google account (e.g. `congodb3@gmail.com`) can log in freely.
   - The `ADMIN_EMAILS` check is **skipped entirely** for non-admin routes.
   - User profile is initialized with `role: 'user'` and `licenseTier: 'free'`, allowing seamless user access without sign-out.

---

## 3. Database Security & RLS (Supabase)

### Authoritative Function (`public.is_admin()`)
Database-level security rules in PostgreSQL utilize a zero-table query function to prevent RLS recursion (`42P17`):

```sql
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
```

### Table Security Rules
- **`public.profiles`**: Users can view and update their own record (`auth.uid() = id`), while `public.is_admin()` grants full access to administrators.
- **`public.user_workspaces` & `public.workspace_snapshots`**: Strictly scoped to row ownership (`auth.uid() = user_id`) or admin override.
- **`public.crm_leads`, `public.audit_logs`, `public.admin_notifications`**: Gated exclusively to `public.is_admin()` for administrative read/update operations.

---

## 4. Verification Invariants & Testing

- Unit tests in `src/tests/normalUserLogin.test.ts` and `src/tests/websiteAuthGis.test.ts` verify:
  1. Non-admin Google login on `/` succeeds without sign-out.
  2. Non-admin Google login on `/admin/login` triggers `signOut()` + `"not on allow list"`.
  3. Allowlisted admin login on `/admin/login` navigates to `/admin`.
  4. Allowlisted admin login on `/` functions seamlessly across public tools.
