# Zaboraa Enterprise — Full Offline Admin Mode & Secure Recovery Architecture (Revision 2)

An enterprise-grade dual-mode operational architecture delivering full offline administrative continuity via a client-side Web Crypto AES-256-GCM encrypted IndexedDB vault, cryptographically random emergency recovery keys, three-tier online role governance (`admin`, `authorized`, `public`), and a comprehensive 12-section enterprise dashboard with safe reconnection reconciliation.

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural decisions incorporate all user feedback and govern the revised implementation:

- **Confirmed Decision 1 (OWASP 600k PBKDF2 & Dynamic Benchmarking)**: The key derivation engine uses **PBKDF2-HMAC-SHA-256 with an initial baseline of 600,000 iterations** (OWASP 2023+ recommendation for SHA-256). The runtime includes a lightweight execution benchmark (targeting 200–500ms derivation latency) and documents any device-adjusted iteration threshold while strictly maintaining cryptographic strength.
- **Confirmed Decision 2 (Zero Standalone Verification Hash / Authenticated Decryption)**: The recovery key is **never verified using a stored verification hash**. Instead, key verification is achieved through **authenticated AES-256-GCM decryption of an encrypted canary validation record** with an independent derivation context or 128-bit authentication tag. If the tag check fails, decryption aborts with a cryptographic authentication error.
- **Confirmed Decision 3 (Actual Supabase Schema Grounding)**: Does **not** assume `blueprints` exists in production or create duplicate `admins` tables. Uses the verified schema from `supabase/migrations/20261015_briefing_requests.sql` and `supabase_schema.sql` (`profiles` with `role IN ('user', 'admin')` mapped to online tiers `admin`, `authorized`, `public`). All proposed future tables are documented exclusively in `SUPABASE_SECURITY_PHASE.md` without executing SQL.
- **Confirmed Decision 4 (Honest Client-Side Security Posture)**: Browser-side attempt throttling and local audit logs are explicitly designated as **best-effort device-level controls**, not tamper-proof boundaries. The documentation and UI transparently explain that an attacker with root OS access or modified devtools can inspect client memory or alter local script execution.
- **Confirmed Decision 5 (Strict Live vs Offline Privilege Boundary)**: The offline recovery key **only decrypts the local on-device vault** and **never grants live production admin permissions**. Reconnecting online strictly requires fresh Supabase authentication and server-validated role checks before any live read/write or sync operation is permitted.
- **Confirmed Decision 6 (Zero Production Secrets in Vault)**: The local vault stores only cached operational datasets, drafts, and UI preferences. **Zero Supabase service-role keys, database passwords, or third-party client secrets** are ever written to IndexedDB or cached on device.

---

## 1. Overview & Core Concept

### What It Does
Zaboraa Technologies requires uncompromised operational resilience during datacenter migrations and critical enterprise advisory engagements. This architecture equips enterprise architects and system administrators with:
1. **Three-Tier Online Role Governance**: Explicit distinction between `admin` (full governance & system settings), `authorized` (pre-cleared enterprise cloud architects accessing advanced BOM, RVTools, and sizing tools), and `public` (default zero-privilege tier for visitors).
2. **Offline Emergency Administrator Workspace**: A mirror of the administrative console that runs entirely disconnected from the cloud, powered by an encrypted local vault stored in IndexedDB.
3. **Cryptographically Secure Emergency Unlock Key**: A 256-bit high-entropy recovery key generated client-side via `crypto.getRandomValues()`, verified solely through authenticated decryption of an internal canary block.
4. **12-Section Administration Dashboard**: A unified control surface covering operations, users, roles, audit trails, briefing requests, image generation assets, backend telemetry, and website configuration.
5. **Reconnection Reconciliation Guardrails**: A staged queue that prevents stale, forged, or unauthorized offline replays upon regaining internet access.

### Target Audience & Persona
- **Principal Cloud Architects & Lead Administrators**: Requires guaranteed uptime and emergency configuration access during live network maintenance, datacenter cutovers, or transient ISP outages.
- **Authorized Enterprise Clients**: Authenticated stakeholders viewing proprietary sizing dossiers and migration architectures.
- **Public Evaluators**: Unauthenticated or newly registered visitors exploring public migration masterclasses and high-level platform overviews.

---

## 2. User Experience & Visual Design

### Key User Flows

#### Flow A: Single Sign-In & Role-Aware Routing
```
[Visitor Navigates to Platform]
              │
              ▼
   [Unified Sign-In Modal]
   ├── Google OAuth
   ├── Microsoft Identity (when configured)
   └── Corporate Email / Password
              │
              ▼
    [Supabase Auth Exchange]
              │
              ▼
[Server-Verified Role Check (profiles / claims)]
  ├── 'admin'      ──► Routed to Executive Console + Parameter Studio
  ├── 'authorized' ──► Granted Advanced Workbench Access (BOM & RVTools)
  └── 'public'     ──► Standard Public Experience (Self-service upgrade disabled)
```

#### Flow B: Emergency Offline Recovery & Vault Unlock
```
[Network Disconnected / Emergency Declared]
              │
              ▼
[Persistent Amber Telemetry Banner / Modal Toggle]
              │
              ▼
   [Offline Emergency Prompt]
  Enter Cryptographic Emergency Recovery Key
              │
              ▼
[Web Crypto PBKDF2 (600k iter) + AES-GCM Canary Decrypt]
  ├── Canary Tag Valid ──► Unlock Local Vault, Decrypt Cached Records, Render Dashboard
  └── Canary Tag Fail  ──► Cryptographic Auth Error, Local Deterrent Backoff, Access Denied
              │
              ▼
[Offline Admin Workspace Active]
  ├── Cached Briefings & Profiles (Read / Draft)
  ├── Local Notes & Parameter Staging
  ├── Offline Capability Indicators (Stale / Local Badges)
  └── Changes Enqueued to Local Sync Queue (Never Live)
```

#### Flow C: Online Reconnection & Manual Reconciliation
```
[Network Reconnected: window 'online' event]
              │
              ▼
[Status Bar Switches to 'Reconnected — Live Auth Required']
              │
              ▼
[Mandatory Online Re-Authentication]
  Admin must authenticate live with Supabase Auth credentials
              │
              ▼
[Server Confirms Active Admin Role in 'profiles']
  ├── If Admin Valid   ──► Open Reconciliation Drawer with Pending Operations Diff
  └── If Not Admin     ──► Reject Live Sync; Log Incident; Purge Staged Actions
              │
              ▼
[Manual Review & Idempotent Server Execution]
```

### Visual Identity & Theme
- **Design Philosophy**: Adheres strictly to the SaaS & Dashboard visual constitution: zero-pill metadata, single-elevation surfaces, hairline dividers (`border-slate-800` / `border-slate-200`), and tabular figures (`tabular-nums font-mono`).
- **Operational Color Palette**:
  - *Dominant Canvas (60%)*: Dark Slate (`#020617` / `bg-slate-950`) in dark mode; crisp clean slate (`#f8fafc`) in light mode.
  - *Structural Surfaces (30%)*: Deep container slate (`#0f172a`), hairline borders (`#1e293b`), and subdued typography (`#94a3b8`).
  - *High-Intent Accent Budget (10%)*:
    - Cyan (`#06b6d4` / `#22d3ee`): Primary administrative actions and verified states.
    - Amber (`#f59e0b`): Offline mode, cached data stale warnings, and sync queue badges.
    - Emerald (`#10b981`): Live connected status, verified server-side authorizations.
    - Rose (`#f43f5e`): Security alerts, rate-limit warnings, and vault lockout indicators.
- **Top Bar Contract**: Breadcrumb trail (`Admin / Emergency Workspace / Overview`) on left, concise unboxed status indicators in center, and 1–2 primary action buttons (`Lock Vault`, `Manual Sync`) on right.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Browser-Native Web Crypto PBKDF2 (600,000 iterations) with Canary Verification
- **Chosen Approach**: Native `window.crypto.subtle` executing PBKDF2-HMAC-SHA-256 at 600,000 iterations. Verification is performed by attempting authenticated AES-256-GCM decryption of a known canary ciphertext payload. No plain or salted verification hashes are stored.
- **Why**: Eliminates hash-matching attack surfaces; AES-GCM's 128-bit authentication tag guarantees both key correctness and ciphertext integrity cryptographically.
- **Trade-off**: 600,000 iterations takes ~200–450ms on modern CPUs, which provides strong resistance to offline brute-force attacks while remaining responsive for authorized human administrators.

### Decision 2: IndexedDB over LocalStorage for Encrypted Vault
- **Chosen Approach**: IndexedDB structured storage storing binary ciphertext `ArrayBuffer` objects, salt blobs, and initialization vectors.
- **Why**: LocalStorage is synchronous, limited to 5MB, stores strings only, and is vulnerable to cross-context blocking. IndexedDB supports asynchronous transactions, large multi-megabyte encrypted snapshots, and structured cloning.
- **Trade-off**: Requires asynchronous promise-wrapped transactions and robust error boundaries for storage quota exhaustion.

### Decision 3: Zero Auto-Replay & Absolute Privilege Decoupling
- **Chosen Approach**: Possessing the offline recovery key grants **zero** authority against the live cloud. When connectivity returns, the application requires fresh online authentication and server-side role validation. Queued offline operations are inspected in a visual diff drawer before execution.
- **Why**: Prevents compromised or lost devices with cached keys from injecting forged commands into production systems.

---

## 4. Technical Architecture & Data Strategy

### System Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                        ZABORAA CLIENT RUNTIME                          │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │   AuthContext (V2)    │                  │  OfflineVaultService  │  │
│  │ ───────────────────── │                  │ ───────────────────── │  │
│  │ • Role: admin/auth/pub│                  │ • Web Crypto Subtle   │  │
│  │ • Supabase Auth Live  │                  │ • PBKDF2 (600k iter)  │  │
│  │ • Fresh Re-auth Guard │                  │ • Canary GCM Decrypt  │  │
│  └───────────┬───────────┘                  └───────────┬───────────┘  │
│              │                                          │              │
│              ▼                                          ▼              │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      IndexedDB Secure Vault                      │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │ • 'vault_meta': Salt, 12-byte IV, Encrypted Canary Block         │  │
│  │ • 'vault_data': Encrypted Snapshots (Briefings, Config, Metrics) │  │
│  │ • 'vault_queue': Staged Offline Administrative Actions & Drafts  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│              ┌──────────────────────┴──────────────────────┐           │
│              ▼                                             ▼           │
│  ┌───────────────────────┐                  ┌───────────────────────┐  │
│  │  Online Admin Console │                  │ Offline Recovery Mode │  │
│  │ ───────────────────── │                  │ ───────────────────── │  │
│  │ • Live Supabase R/W   │                  │ • Decrypted Snapshots │  │
│  │ • Live Profiles/Roles │                  │ • Read-Only Integrity │  │
│  │ • Live Briefings      │                  │ • Local Drafts        │  │
│  │ • Real Health Ping    │                  │ • Stale Data Badges   │  │
│  └───────────┬───────────┘                  └───────────┬───────────┘  │
│              │                                          │              │
│              └──────────────────────┬───────────────────┘              │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │             12-Section Unified Admin Dashboard UI                │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │ 1. Overview & Ops        5. Briefings Registry 9. Theme & Nav   │  │
│  │ 2. Registered Profiles   6. AI Image Gallery   10. Domain & DNS  │  │
│  │ 3. Roles & Auth Requests 7. Database Health    11. Recovery Key  │  │
│  │ 4. Sign-in Activity      8. Site Customization 12. Audit Trail   │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     │                                  │
│                                     ▼                                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │               Reconnection Reconciliation Queue                  │  │
│  │ ──────────────────────────────────────────────────────────────── │  │
│  │ • Network 'online' detection   • Review Drawer Diff View         │  │
│  │ • Live Admin Re-authentication • Idempotent Mutation Dispatch    │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### 12-Section Dashboard Breakdown

| # | Section Name | Online Capabilities | Offline Capabilities | Stale / Unavailable Handling |
| :--- | :--- | :--- | :--- | :--- |
| **01** | **Overview & Operational Metrics** | Live compute, storage, migration waves, and active briefing statistics. | Displays last-synced metric snapshot with exact date/time stamp. | "Cached Snapshot" warning badge; displays exact minutes since last sync. |
| **02** | **Registered Users & Profiles** | Live user queries from `profiles` table. | Displays encrypted cached directory of authorized personnel. | Marked as "Local Cache (Read-Only)". Creation/deletion disabled. |
| **03** | **Roles & Authorization Requests** | Review role requests; update tiers (`admin`, `authorized`, `public`). | View pending requests offline; draft approval actions to queue. | Staged in local queue; clearly flagged as "Pending Online Approval". |
| **04** | **Sign-In & Activity History** | Real Supabase session timestamps and client-tracked telemetry. | Displays locally cached session events. | Explicit notice: "Offline - Remote auth logs require live connection". |
| **05** | **Briefing Requests Registry** | Full triage (`new`, `contacted`, `scheduled`, `archived`) via Supabase. | Browse and search cached briefing records; draft notes. | Note drafts saved locally; marked as "Unsynced Draft" until online review. |
| **06** | **AI Image Generation Gallery** | Browse live generated blueprints; prompt AI generation API. | View locally cached blueprints and thumbnails. | "AI Generation Unavailable Offline"; cached assets viewable in high-res. |
| **07** | **Database & Backend Health** | Real ping against Supabase REST endpoint and PostgREST schema cache. | Clear indicator: "Backend Unreachable (Offline)". | No simulated health data; explicitly reports disconnected state. |
| **08** | **Website Configuration** | Live site customization, hero copy, and platform showcase parameters. | Edit staging draft parameters; preview local changes. | Changes staged in reconciliation queue; live deployment requires online sync. |
| **09** | **Branding, Theme & Navigation** | Update typography, color tokens, density, and logo branding. | Local preview and testing of theme tokens. | Staged in local queue; previewed locally using CustomizationContext. |
| **10** | **Domain & URL Management** | View canonical URL (`https://zaboraa-12.vercel.app/`) and DNS guidance. | View documented DNS configuration and routing runbooks. | Read-only guidance; explicit disclaimer that DNS changes require DNS registrar. |
| **11** | **Emergency Mode & Recovery Key** | Generate new recovery key, view key fingerprint, rotate key, export vault. | Unlock/lock vault, test key derivation, view vault integrity. | Key generation works offline via Web Crypto; key rotation synced when online. |
| **12** | **Audit Trail & Sync Status** | View immutable audit events and sync history. | Log local admin actions to local encrypted audit store. | Local audit records appended to sync queue for tamper-evident server merge. |

---

## 5. Security & Cryptographic Vault Design

### Cryptographic Specification
1. **Key Generation**:
   - High-entropy recovery key: 32 bytes (256 bits) from `crypto.getRandomValues(new Uint8Array(32))`, formatted as standard 64-character hex or 8x4 alphanumeric security words (`ZABO-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX-XXXX`).
   - Plaintext key is displayed to the administrator **exactly once** during initialization, with mandatory download/copy confirmation.
   - Plaintext key is **never saved to disk**, **never stored in localStorage**, and **never sent over the network**.
2. **Key Derivation (PBKDF2-HMAC-SHA-256 @ 600k Iterations)**:
   - Salt: 16 cryptographically random bytes generated per device vault.
   - Algorithm: PBKDF2 with HMAC-SHA-256.
   - Iterations: 600,000 iterations baseline with dynamic benchmarking.
   - Output: 256-bit AES-GCM CryptoKey.
3. **Canary-Based Authenticated Decryption Verification**:
   - A dedicated canary block is encrypted during setup: `AES-GCM-Encrypt(key, iv, "ZABORAA_ENTERPRISE_VAULT_VALIDATION_TOKEN")`.
   - To verify the recovery key, the system attempts to decrypt this canary block. If the GCM 128-bit authentication tag fails, decryption immediately rejects the key. **No verification hash is stored**.
4. **Data Encryption (AES-256-GCM)**:
   - Initial Vector (IV): 12 cryptographically random bytes generated fresh for every encryption operation.
   - Tag Length: 128-bit authentication tag guarantees confidentiality and integrity.
5. **Session Governance & Zero Production Secrets**:
   - Decrypted data resides solely in volatile memory (`React state`).
   - Auto-locks the vault after 15 minutes of inactivity.
   - Manual "Lock Vault" button instantly purges in-memory keys and decrypted state.
   - **Zero Supabase service-role keys or database credentials are ever stored in the vault**.

---

## 6. Implementation Scope & Deliverables

### A. Core Architecture Deliverables
1. **Cryptographic Vault Service**:
   - `src/services/offlineVaultService.ts`: Native Web Crypto PBKDF2 (600k iter) + AES-GCM canary engine, IndexedDB repository, salt/IV management, rate-limiting, and key fingerprinting.
2. **Role & Auth Governance**:
   - Refactored `src/context/AuthContext.tsx`: Three-tier role typing (`admin`, `authorized`, `public`), server-side role resolution from `profiles`, unprivileged public default on registration, and re-authentication challenge logic.
3. **Emergency Entry & Mode Orchestration**:
   - `src/components/offline/EmergencyModeBanner.tsx`: Persistent top alert banner indicating offline state, cached data age, and emergency unlock trigger.
   - Refactored `src/components/AdminLoginModal.tsx`: Adds emergency offline unlock mode alongside online email/OAuth authentication.
4. **12-Section Administration Dashboard**:
   - `src/components/admin/AdminDashboardModal.tsx`: Full-screen enterprise control console with sidebar navigation across all 12 operational sections, responsive layout, search, and tabular formatting.
5. **Reconnection Reconciliation Engine**:
   - `src/components/offline/ReconciliationDrawer.tsx`: Staged diff viewer, conflict resolution, live admin credential check, and selective execution.
6. **Progressive Web App Shell**:
   - `src/components/offline/PWAInstallPrompt.tsx`: In-app install affordance and online/offline status banner.
   - PWA manifest and service worker configuration in `vite.config.ts` and `index.html`.

### B. Security Governance Document
- **`SUPABASE_SECURITY_PHASE.md`**:
  - Unexecuted SQL migrations for creating `public.admins` and `public.authorized_users` tables.
  - Hardened RLS policies on `profiles`, `briefing_requests`, `blueprints`, and `image_generations`.
  - Trigger preventing self-service role escalation on `profiles.role`.
  - Migration sequence, security audit checklist, and verification test matrices.

### C. Automated Test Suite
- Comprehensive Vitest unit and integration test suite verifying:
  - Role resolution and public defaulting.
  - AES-256-GCM encryption/decryption round-trip.
  - PBKDF2 key derivation and canary validation.
  - Recovery key validation and rejection of invalid keys.
  - Corruption handling and tamper detection.
  - Offline sync queue staging and reconciliation authorization.
