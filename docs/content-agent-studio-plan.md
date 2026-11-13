# Zaboraa Content Studio — Plan & Build Spec
**Version:** 1.0  
**Date:** 2026-11-12  
**Author:** Wasim Sayyed (solo founder, Zaboraa)  
**Status:** Phase 1 in progress — feature/content-agent-studio

---

## 0. Context & Constraints (Non-Negotiable)

- **Solo founder, WFH, no employees, no physical office, currently on contract.**
- Time budget: ≤ 2–3 hrs/week for approvals. If it exceeds this, cadence drops to 1 idea/2 weeks.
- **Phase 1 (NOW):** Build everything manually in the admin console. No automation.
- **Phase 2 (LATER):** LinkedIn API auto-post, Instagram API, automation — only after Phase 1 is stable and founder explicitly approves.
- **No auto-posting without explicit human approval.** Current flow: Ideas → Drafts → Approve → Queue → Manual Copy-Paste. Keep it.
- No webinars, no live Q&A, no founder stories, no talking-head personal brand. Do NOT propose these.
- No daily posting pressure. 1 idea/week max.
- Content must look good with 0 likes / low reach. No vanity-begging posts.
- No purchase/subscription for tools. No GEMINI_API_KEY / service-account JSON / WIF / Community Management API until approved.

### Tech Stack (frozen)
- Repo: congodb1-ui/Zaboraa-12-Fresh, production: https://www.zaboraa.com
- Admin: port 3001. **Zaboraa FX on ports 3000 + 8001 — DO NOT TOUCH.**
- Stack: Vite + React frontend, Vercel Serverless Functions in /api/, Supabase (Postgres + Auth + RLS)
- Vertex AI Express, project prime-bridge-511404-a3, location **global**, model **gemini-3.7-flash ONLY** (never gemini-4-argon)
- Trial ends: **7 Jan 2027**. Model retirement: ~28 Jan 2027.
- Current working baseline: 202 pass, 4 baseline failures, 53 routes, 52 sitemap
- Recent fixes: §16.2.14 global endpoint (44cfca8), §16.2.15 copy formatting (2163ebe), §16.2.16 timeout (0c78fc9)

### Content Rules
**Approved claims only:**
- 13+ years, 25+ migrations, 6 certifications
- "100% Runbook-Driven Cutovers"
- Principal VMware Architect
- Brand: Zaboraa (never "Zaboraa Technologies")
- 6 tools, 8 disciplines, 7 anonymised case studies

**NEVER use:**
- 12+ years, 40+ migrations, 1,240 / 4,500 / 820 TB, $1.4M
- "Zaboraa Technologies", "100% zero-downtime"
- Pricing, client names, videos that don't exist, masterclass

### Briefing CTA Template (verbatim, use everywhere)
```
Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing
```

### Topic → Tool Name Mapping
| Topic (Pillar) | Tool Name | Tool URL |
|---|---|---|
| AVS Migrations | AVS Sizing Estimator | https://zaboraa.com/tools/avs-sizing |
| Cloud Sizing / FinOps | Cloud Sizing Calculator | https://zaboraa.com/tools/sizing-estimator |
| Broadcom / VMware Licensing | Broadcom Exit Cost Calculator | https://zaboraa.com/tools/broadcom-calculator |
| Multi-Hyperscaler Strategy | Multi-Cloud Estimator | https://zaboraa.com/tools/multi-cloud |
| Modernization Without Rewrite | Blueprint Generator | https://zaboraa.com/tools/blueprint-generator |
| Zaboraa Proof / Case Studies | RVTools Analyzer | https://zaboraa.com/tools/rvtools-analyzer |
| Custom | (none — use homepage) | https://zaboraa.com |

---

## 1. Goal

Build a **Content Studio** inside the existing admin console (`/admin/content_agent`) so the founder can generate all content assets from one place, for any approved draft, with one click per asset type. All outputs are **Download or Copy only** — no auto-post, no auto-upload.

**Funnel:** Google / LinkedIn discovery → Use free tool → Trust → Book Briefing (primary CTA) / Explore Tools (secondary).

**Principle:** Tools do the selling, not likes. Evergreen assets that look valuable with 3 likes are worth more than posts that die in 24 hours.

---

## 2. Channels Decision

### Keep
1. **Zaboraa.com Tools + KB / SEO** — PRIMARY lead gen. Quiet, evergreen, works while founder is on contract.
2. **LinkedIn** — PRIMARY social. Tool-led, checklist, comparison format. Not founder stories.
3. **YouTube Shorts + Instagram Reels** — SECONDARY, repurpose only. Same short screen video posted to 3 places. No extra creation.
4. **Reddit / Communities** — TERTIARY, 1 answer/week, no selling.

### Defer (Phase 2)
- LinkedIn API auto-post — deferred until Community Management approved
- Instagram API auto-post — deferred, manual repurpose only
- Long YouTube masterclasses (§16.2b) — ON HOLD per D9, videos don't exist

### Rejected (do not propose again)
- Webinars / Live Q&A — rejected by founder
- Founder stories / talking-head personal brand — rejected
- X / Twitter, Paid Ads — wrong audience / not free

---

## 3. Content System — 1 Idea / Week

One idea from 6 pillars: AVS Migrations, Broadcom / VMware Licensing, Multi-Hyperscaler Strategy, Cloud Sizing / FinOps, Modernization Without Rewrite, Zaboraa Proof / Case Studies.

Content Agent generates (all require human approval before use):
1. LinkedIn Text Post (existing, working)
2. Poster Image — 1200×627 (LinkedIn) + 1080×1080 (Instagram)
3. Short Video Script — 40–60s, screen recording of real tool, no face required
4. KB / Article Draft — 800–1200 words, markdown download, Briefing CTA at bottom
5. Captions — Instagram (150 chars), YouTube Shorts (title + description), Briefing CTA
6. Generate All — runs all 5 tracks in parallel, previews inline

**Publishing flow (manual, async, founder decides when):**
- Approve Idea + assets in admin
- Post LinkedIn text + poster (manual copy-paste via existing Copy for LinkedIn)
- Post short video to LinkedIn + Instagram Reels + YouTube Shorts (same file, manual upload)
- Publish KB article (manual PR or file drop)

---

## 4. Build Order & Decision Matrix

| Track | Solo Build Effort | Reuses Design System | Unblocks Others | Risk Level | Build Order |
|---|---|---|---|---|---|
| Captions | Very low — text only | None needed | Instagram/YouTube repurpose | Low | **1st** |
| Video Script | Low — text only | None needed | Founder screen recording | Low | **2nd** |
| KB Draft | Low — text only | None needed | Future SEO | Low | **3rd** |
| Poster | Medium — Sharp + SVG | Defines design system | Carousel (deferred) | Medium | **4th** |
| Generate All | Low — orchestration | Depends on all above | Convenience | Low | **5th** |
| Carousel PDF | High — PDF library | Depends on Poster | Nothing blocked | High | **DEFERRED** |

**Why text tracks first:** Pure Gemini calls, same pattern as generate-content.js, no new libraries, cannot fail due to runtime issues. Build what cannot fail first.

**Why Poster before Generate All:** Generate All orchestrates existing tracks. It cannot exist before them.

**Carousel deferred:** PDF generation in Vercel serverless has size/memory risks. Alternative for Phase 2: generate carousel content as structured JSON, founder pastes into Canva. Same content value, no PDF library risk.

---

## 5. New Tools to Add (Separate from Content Studio, 1 per month max)

1. **Broadcom Exit Cost Calculator** — "Enter VMware cores → See AVS vs NC2 vs GCVE cost". Highest demand post-Broadcom. Shareable.
2. **AVS vs NC2 Comparison Page** — Honest table, links to tools. Target keyword "AVS vs NC2".
3. **HCX Readiness Checker** — Checklist from existing KB. Low build effort, high value.

Do NOT build 3 tools at once. Solo = 1 per month.

---

## 6. Metrics (Solo, Realistic)

Do NOT track likes/followers as primary metric.

| Metric | Target |
|---|---|
| Briefing bookings / month | 2–4 to start (not 20) |
| Tool uses / week | Track via Supabase / Vercel analytics |
| Google indexed pages | 6/30 now → 20/30 in 3 months |
| KB articles published | 1/week (when ready) |
| LinkedIn carousel saves | More meaningful than likes for solo |
| Founder approval time | ≤ 3 hrs/week — if over, drop to 1 idea/2 weeks |

If a post gets 2 likes but tool uses go up: **that is a WIN.** Do not judge by likes.

Track `/briefing` page visits separately from tool uses — this tells you if content is driving booking intent.

---

## 7. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Time / burnout | 1 idea/week max, batch approval on Sunday, cut carousel first if over 3 hrs |
| Low reach looking bad | Evergreen tools + KB + posters look good with low likes. No "comment YES" posts. |
| Gemini trial ends 7 Jan 2027 | Before 15 Dec 2026: evaluate switching to pay-as-you-go on same project. Cost for 1 generation/week is negligible. Do not let trial expiry silently break Content Agent. |
| Model retirement ~28 Jan 2027 | Model in env var GEMINI_MODEL — switch to gemini-3.8-flash in Dec 2026, not now. |
| Sharp runtime issue on Vercel | Confirm Node.js runtime (not Edge) before PR. See §8 checklist. |
| PDF/Carousel complexity | Carousel deferred to Phase 2. Screen videos first (free). |
| Video script inventing fake tools | Shot list validator: only real zaboraa.com URLs allowed. Regenerate once on violation. |
| Instagram Business account not set up | Do not block poster/video work on Instagram setup. Manual repurpose only until ready. |

---

## 8. Sharp + Vercel Runtime Checklist (verify before running Antigravity)

- [ ] Open `vercel.json` — confirm NO `"runtime": "edge"` anywhere under `functions` or top level. Sharp requires Node.js runtime.
- [ ] Open `package.json` — check `"engines": { "node": "..." }`. Must be `>=18`. If 16 or lower, update before PR.
- [ ] Vercel Dashboard → Zaboraa-12 → Settings → General → Node.js Version. Set to 18.x or 20.x.
- [ ] Vercel plan memory limit: Hobby = 1024 MB per function. Sharp for two poster sizes is well within this. No action needed.

---

## 9. Supabase Migration Required Before Deploy

New table: `public.generated_assets`

```sql
CREATE TABLE IF NOT EXISTS public.generated_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  draft_id TEXT NOT NULL REFERENCES content_drafts(id) ON DELETE CASCADE,
  asset_type TEXT NOT NULL CHECK (asset_type IN (
    'poster_linkedin', 'poster_instagram', 'video_script', 'kb_draft', 'captions'
  )),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS generated_assets_draft_id_idx
  ON public.generated_assets(draft_id);
```

**RLS:** SELECT for authenticated users, INSERT/DELETE for admin only (service-role key on server side).

**Must be run in Supabase dashboard BEFORE deploying the PR.**

---

## 10. API Specifications

### Shared rules for all new APIs
- Auth: `requireAdmin` pattern identical to `api/generate-content.js`
- Error surfacing: HTTP 502 `{ success:false, error:"...", upstreamStatus:<code> }` — no secrets
- Forbidden claims validator on all generated text — HTTP 400 on violation
- Missing draftId → 400
- Unauthenticated → 401
- Save result to `generated_assets` table after successful generation

---

### api/generate-captions.js

**Input:** `{ draftId }`

**Output:**
```json
{
  "success": true,
  "draftId": "...",
  "linkedin_caption": "...",
  "instagram_caption": "...",
  "youtube_title": "...",
  "youtube_description": "...",
  "briefing_cta": "Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing"
}
```

**Rules:**
- `instagram_caption`: max 150 chars, hook/value only, no URL in body (link in bio), max 5 hashtags
- `youtube_title`: max 70 chars, no clickbait, includes primary keyword
- `youtube_description`: 200–300 chars + hashtags + Briefing CTA + zaboraa.com URL
- `briefing_cta`: hardcoded verbatim template, never AI-generated
- `linkedin_caption`: same format as existing Copy for LinkedIn — do not duplicate that button

---

### api/generate-video-script.js

**Input:** `{ draftId }`

**Output:**
```json
{
  "success": true,
  "draftId": "...",
  "script": {
    "HOOK": "...",
    "PROBLEM": "...",
    "POINT_1": "...",
    "POINT_2": "...",
    "POINT_3": "...",
    "CTA": "Running VMware on-prem or evaluating AVS? Book a free 30-min architecture briefing → https://zaboraa.com/briefing"
  },
  "shot_list": [
    { "second_mark": 0, "action": "Screen record: https://zaboraa.com/tools/avs-sizing" },
    { "second_mark": 15, "action": "Text overlay on dark background: ..." }
  ],
  "duration_estimate": 55
}
```

**Rules:**
- Script sections: HOOK 5s, PROBLEM 10s, POINT 1–3 ~8s each, CTA 5s. Total 40–60s.
- CTA section: verbatim Briefing CTA template, never AI-generated
- Shot list actions: ONLY one of:
  - `"Screen record: [exact URL of existing tool at zaboraa.com]"`
  - `"Screen record: zaboraa.com homepage"`
  - `"Text overlay on dark background: [text]"`
  - `"Diagram: [name of diagram that exists in /resources]"`
- NEVER invent a tool or page. Only reference URLs from the 30 public routes.
- Validator: if shot_list references a non-existent tool → regenerate once → 400 fail-closed

---

### api/generate-kb.js

**Input:** `{ draftId }`

**Output:**
```json
{
  "success": true,
  "draftId": "...",
  "slug": "avs-migration-checklist",
  "meta_title": "...",
  "meta_description": "...",
  "outline": [
    { "h2": "...", "summary": "..." }
  ],
  "body": "...",
  "frontmatter": "---\ntitle: ...\nslug: ...\n..."
}
```

**Rules:**
- `slug`: kebab-case, max 60 chars
- `meta_title`: max 60 chars, includes primary keyword
- `meta_description`: max 156 chars, includes primary keyword + zaboraa.com
- `body`: 800–1200 words, Markdown, H2 headings (no H1), 4–6 sections
- Internal links: real tool URL from topic mapping + 2 KB placeholders `[KB_LINK_1]` `[KB_LINK_2]`
- FAQ section: 3 questions minimum
- Briefing CTA block at bottom (verbatim template, in a Markdown blockquote)
- Download format: `.md` file named `[slug].md` with frontmatter + body

---

### api/generate-poster.js

**Input:** `{ draftId }`

**Output:**
```json
{
  "success": true,
  "draftId": "...",
  "linkedin": "<base64 PNG 1200x627>",
  "instagram": "<base64 PNG 1080x1080>"
}
```

**Design spec:**
- Background: `#0f172a`
- Title: white, 32px bold
- Bullets: `#94a3b8`, 24px, ✓ prefix, max 55 chars each
- `zaboraa.com` bottom-left: `#64748b`, 18px
- Tool name bottom-right: `#64748b`, 18px
- "ZABORAA" wordmark top-left: white, 20px bold
- No external image assets, no external font URLs
- Font: system font stack (`-apple-system, BlinkMacSystemFont, sans-serif`)
- Library: Sharp + SVG-to-PNG pipeline. Node.js runtime only (not Edge).
- `vercel.json`: add `"api/generate-poster.js": { "maxDuration": 30 }` to functions block

---

### api/generate-all.js

**Input:** `{ draftId }`

Calls all 4 tracks in parallel (`Promise.all`). Partial failures allowed — returns per-track status.

**Output:**
```json
{
  "success": true,
  "partial": true,
  "results": {
    "captions": { "ok": true, "data": {} },
    "video_script": { "ok": true, "data": {} },
    "kb": { "ok": false, "error": "Content validator rejected..." },
    "poster": { "ok": true, "data": {} }
  }
}
```

- `vercel.json`: `"api/generate-all.js": { "maxDuration": 60 }`

---

## 11. Frontend Spec (AdminContentAgentView.tsx)

- In Drafts tab, for each draft with `status='approved'` or `status='queued'`, add a **"Content Studio"** collapsible section **below** existing buttons.
- Do NOT modify or move existing buttons (Copy for LinkedIn, Mark as Posted, etc.).

**Buttons inside Content Studio:**
```
[Generate Poster] [Generate Captions] [Generate Video Script] [Generate KB Draft] [Generate All]
```

**Asset status badges:** After generation, show ✓ badge on each button that has a saved result in `generated_assets` for this `draftId`. Load badges on mount.

**Per-track output display:**

| Track | Display |
|---|---|
| Poster | Inline preview (max-height 200px) + "Download LinkedIn (1200×627)" + "Download Instagram (1080×1080)" |
| Captions | Read-only textarea per field + Copy button per field. Do NOT duplicate existing Copy for LinkedIn. |
| Video Script | Labelled sections (HOOK, PROBLEM, POINT 1–3, CTA) + numbered shot list + "Copy Full Script" |
| KB Draft | meta_title, meta_description, outline preview + "Download KB (.md)" + "Copy Body" |
| Generate All | Per-track ✓ or ✗ with inline error + each track's output revealed |

- Errors: inline per track, same pattern as existing error display. No `alert()` or modal.
- Loading state: "Generating…" per button while API call is in progress.

---

## 12. Lib Additions (src/lib/contentAgent.ts)

```typescript
generateCaptions(draftId: string): Promise<CaptionsResult>
generateVideoScript(draftId: string): Promise<VideoScriptResult>
generateKB(draftId: string): Promise<KBResult>
generatePoster(draftId: string): Promise<PosterResult>
generateAll(draftId: string): Promise<GenerateAllResult>
```

Same error propagation pattern as `generateContentIdeas`.

---

## 13. Test Checklist

For each API (captions, video-script, kb, poster, generate-all):
- [ ] Valid draft → correct success shape
- [ ] Forbidden claim in relevant field → 400 naming the field
- [ ] Missing draftId → 400
- [ ] Unauthenticated → 401

API-specific:
- [ ] Poster: `linkedin` base64 starts with `iVBOR` (PNG magic bytes)
- [ ] Poster: `instagram` base64 starts with `iVBOR`
- [ ] Video script: script contains all 6 labelled sections
- [ ] Video script: shot_list actions reference only zaboraa.com URLs, "Text overlay", or "Diagram"
- [ ] KB: body contains Briefing CTA verbatim template
- [ ] KB: frontmatter contains slug, meta_title, meta_description, date, topic
- [ ] Captions: `instagram_caption` ≤ 150 chars
- [ ] Captions: `briefing_cta` matches verbatim template exactly
- [ ] Generate All: partial failure (one track 500) → `partial:true`, other tracks ok

Lib:
- [ ] `generatePoster()` resolves with `{ linkedin, instagram, draftId }`
- [ ] `generateAll()` resolves with `GenerateAllResult` including per-track status

**Baseline:** 202 pass, 4 baseline failures (206 total). New tests add on top.

---

## 14. Antigravity Branch Pattern

```
Branch: feature/content-agent-studio from main
Never push to main.
PR → Vercel Preview → merge.
Bible gets §16.2.17 addendum only after merge.
```

Build order inside the PR:
1. Supabase migration file (document: founder must run in Supabase before deploy)
2. `api/generate-captions.js`
3. `api/generate-video-script.js`
4. `api/generate-kb.js`
5. `api/generate-poster.js` (install Sharp if not in package.json)
6. `api/generate-all.js`
7. `src/lib/contentAgent.ts` additions
8. `AdminContentAgentView.tsx` Content Studio UI
9. Tests

---

## 15. Future Phases (Do Not Build Now)

| Item | Phase | Trigger |
|---|---|---|
| Carousel PDF (5–7 slides) | Phase 2 | After poster stable, PDF library risk resolved |
| LinkedIn API auto-post | Phase 2 | Community Management approval + founder ready |
| Instagram API auto-post | Phase 2 | Instagram Business account linked + founder ready |
| YouTube Shorts API | Phase 2 | After manual repurpose workflow stable |
| Veo video generation | Phase 2 | B-roll / diagram animation only, never fake person |
| Long YouTube masterclasses | ON HOLD | Videos must exist first (D9) |
| Webinars / Live Q&A | REJECTED | Do not propose |
| Founder stories / talking-head | REJECTED | Do not propose |

---

*File maintained in docs/ alongside docs/content-agent-phase-2a-2b-2c.md.  
Update this file when Phase 2 scope is confirmed. Do not add automation specs here until Phase 1 is fully stable.*
