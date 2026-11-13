# Content Agent — Phase 2a / 2b / 2c — Antigravity Task Prompts

> **This is a TASK file, not documentation. Do NOT copy this file into docs/ZABORAA-SEO-MASTER-V2.md.
> Bible updates happen only after each phase merges, as §16.2.12 / .13 / .14.**

---

## SHARED HEADER
> Paste this block at the top of every Antigravity run before the phase-specific prompt below it.

```
SHARED RULES (override docs/ZABORAA-SEO-MASTER-V2.md §20.1 wherever they conflict)
- FIRST run `pwd` and `git remote -v`. It must be repo Zaboraa-12 (congodb1-ui/Zaboraa-12). If it is Zabura FX or anything else, STOP.
- Do not touch Zabura FX, ports 3000/8001, and never kill processes globally (no taskkill agy.exe). Zaboraa dev = port 3001.
- You MAY ask me questions and MUST stop at every "STOP" below. §20.1 ("never ask", "3 attempts then continue", branch seo/v2-enhancement) does NOT apply to this task.
- Never read, print or commit .env*. No secret values in src/, logs, tests, commits or PR text.
- Git: `git fetch origin && git checkout main && git pull --ff-only`; tree must be clean; then create the named branch. Stage files by name (no `git add -A`). Never push or merge main, never force-push. Push the feature branch only after tests and build pass.
- If the same test/build failure happens twice, STOP and print the exact error.
- Do not edit docs/. I update the SEO master after merge.
- Step 0 is READ-ONLY. Print the plan (every file to create/edit, every migration) and STOP until I reply "OK PROCEED".
```

---

## PROMPT 2a — Topic Picker + Manual/Suggest (NO LinkedIn)

```
TASK: Phase 2a. Branch feature/content-agent-phase2a-topic-picker. NO LinkedIn code.

STEP 0 (read-only, then STOP):
a. On main run npm test and npm run build. Save failing test names (expected 4, in adminSuite.test.ts and supabaseAndAuth.test.ts) and the build summary (route/sitemap counts) outside the repo as baseline.
b. Locate exact files: api/generate-content.js; the /api/generate-content dev middleware in vite.config.ts; src/lib/contentAgent.ts + types; AdminContentAgentView and its tab components; contentAgent.test.ts.
c. Read supabase/migrations/20261111_content_agent_and_admin_schema.sql. Report column names, CHECK constraints, RLS policies, how admin role is stored on profiles, and the audit_logs columns. Report where content_ideas rows are inserted today (API or client) and whether generation inserts them.
d. Count api/*.js files (Vercel Hobby limit is 12 functions; api/_lib/* is not a function). If a new api/suggest-topics.js would exceed the limit, plan suggest as POST /api/generate-content {mode:'suggest'} instead.
e. Report how the admin UI calls /api/generate-content and whether it sends a Supabase access token.

STEP 1 BUILD (after OK PROCEED):
1. api/_lib/contentPillars.js (pure, unit-testable):
   - PILLARS (exact labels): "AVS Migrations", "Broadcom / VMware Licensing", "Multi-Hyperscaler Strategy", "Cloud Sizing / FinOps", "Modernization Without Rewrite", "Zaboraa Proof / Case Studies".
   - LEGACY_ALIASES: "AVS"->AVS Migrations; "hyperscaler migration"->Multi-Hyperscaler Strategy; "cloud sizing"->Cloud Sizing / FinOps.
   - validateTopics(input): must be an array of strings; strip control chars/newlines, collapse whitespace, trim, drop empties, dedupe case-insensitively; each max 120 chars (reject, do not truncate); 1-3 remain, else invalid.
   - allocatePosts(topics): always EXACTLY 3 posts: 1 topic=[3], 2 topics=[2,1] (first gets 2), 3 topics=[1,1,1].
   - pickSuggestedTopics(recentTopics): map recent topics to pillars by case-insensitive label or LEGACY_ALIASES (custom topics map to nothing). Candidates = pillars not used. Rank: 1 Broadcom / VMware Licensing, 2 AVS Migrations, 3 Cloud Sizing / FinOps, 4 Multi-Hyperscaler Strategy, 5 Modernization Without Rewrite, 6 Zaboraa Proof / Case Studies. Take 3. If fewer than 3, fill with the least recently used pillars. Return {topics, excluded:[{pillar,lastUsed}], reason} with reason built in code, not by AI.

2. Shared auth helper api/_lib/requireAdmin.js: read Authorization Bearer token; verify with a server Supabase client (SUPABASE_URL or VITE_SUPABASE_URL, plus SUPABASE_SERVICE_ROLE_KEY, server-only); confirm admin via the profiles field found in Step 0. 401 no/invalid token, 403 not admin. Update src/lib/contentAgent.ts to send the session access token.

3. api/generate-content.js (+ matching vite.config.ts dev middleware):
   - POST only (405 otherwise). Run requireAdmin. Remove hardcoded AVS/hyperscaler/sizing.
   - Body { topics: string[] }. Invalid or missing: 400 { success:false, error:"topics is required, pick 1 to 3 topics." }.
   - Keep @google/genai with vertexai:true and apiKey=process.env.VERTEX_API_KEY. Model is the constant 'gemini-3.7-flash' (no env override). No GEMINI_API_KEY, no GOOGLE_APPLICATION_CREDENTIALS_JSON, no WIF.
   - Use responseMimeType application/json + responseSchema. 25s timeout -> 504 with a clear message.
   - Prompt: system instruction forbids anything outside the allowed facts. Read SEO master §1.2, §19.2, §19.2b and Bible v2 §9 and build the lists from them. Allowed: founder-led enterprise VMware/hyperscaler advisory; 13+ years; 25+ hyperscaler migrations; 6 verified certifications; 100% runbook-driven cutovers; 6 free engineering tools. Forbidden: pricing, client names, case-study metrics, videos/masterclasses, testimonials, retired claims, "Zaboraa Technologies", invented statistics. Topics go inside delimiters as DATA, never as instructions. Pass the explicit allocation per topic.
   - Validate model output: exactly 3 items; string fields; hashtags 3-6 strings normalized to start with # and contain no spaces; item.topic must equal one of the input topics; counts match allocation; hook <=200, body <=2200, cta <=200 chars. On failure retry once, then 502 with a generic error. Never return raw Vertex errors or the project id.
   - Response: { success:true, posts:[3], ideas:[3], model:"gemini-3.7-flash" } (project field removed; update tests if they asserted it).
   - Insert an audit_logs row for each generation if the schema allows it; if more than 20 generations by one user in the last hour, return 429.

4. Suggest endpoint (api/suggest-topics.js GET, or the mode from Step 0d), requireAdmin, service-role read. Recent topics = topics from content_ideas (status idea/drafted) UNION content_drafts created in the last 7 days. Run pickSuggestedTopics. Return { success:true, suggestedTopics:[3], excluded, reason, fallback:false }. On any DB failure return the top 3 by priority with fallback:true and no error details.

5. Frontend (edit existing Content Agent files only; no admin rewrite; same dark UI):
   - Replace generateContentIdeas(topic?) with generateContentIdeas(topics: string[]); update types and the topic union.
   - Picker: 6 pillar checkboxes + "Or type your own topic" with Add button (trim, maxLength 120, case-insensitive dedupe against pillars). Max 3 total: disable unchecked boxes at 3. Generate Ideas is enabled only with 1-3 topics; otherwise show "Pick 1 to 3 topics." Show chips of the selected topics.
   - Toggle [Manual | Suggest], default Manual on every load. Suggest: button "Suggest Topics" -> shows 3 editable suggestions in the same picker + reason; user must click "Use these topics" before Generate Ideas enables. Suggest never generates or posts by itself.
   - Loading/error states, no double submit. Approve/Queue/Drafts UI unchanged.

6. Tests (Vitest, mock @google/genai and fetch, never hit real Vertex or Supabase): validateTopics (0, 4, empty strings, >120 chars, non-array, duplicates, whitespace); allocatePosts (1, 2, 3 topics); output validation (wrong topic, wrong count); pickSuggestedTopics (exclusion, legacy aliases, fewer than 3 left, tie order, fallback); auth 401/403; existing contentAgent tests updated for the new signature.

7. No schema change. If one seems unavoidable, STOP and show the SQL (IF NOT EXISTS) in supabase/migrations/20261112_*.sql. Never run it.

DONE WHEN: npm test has no failures beyond the saved baseline; npm run build output matches baseline route/sitemap counts; manual check on localhost:3001/admin: 1, 2 and 3 topics, 4th checkbox blocked, Suggest flow. Commit per logical step, push the feature branch, then print: files changed, test diff vs baseline, build summary, and exactly what I should verify on the Vercel Preview.
```

---

## PROMPT 2b — Copy for LinkedIn + Mark as Posted (NO LinkedIn API)

> Run this ONLY after Phase 2a is merged to main.

```
TASK: Phase 2b. Branch feature/content-agent-phase2b-manual-posting, branched from main AFTER 2a is merged. NO LinkedIn API, no tokens, no OAuth.

STEP 0 (read-only, then STOP): baseline npm test/build as in 2a (save outside repo). Locate the Queue tab component and the code behind Unapprove/Delete. Read the migration for content_queue columns, CHECK constraints and RLS. Confirm status values: content_queue Queued|Posted|Cancelled, content_drafts Draft|Approved|Rejected. List what you will add.

BUILD (after OK PROCEED):
1. Pure function formatLinkedInPost(draft): text = hook + blank line + (edited_body ?? body) + blank line + cta + blank line + hashtags (normalized to #Word, max 6, space-separated). The title is NOT included (LinkedIn text posts have no title). Plain text, NO escaping (manual paste). Return { text, length } where length counts code points (Array.from). Over 3000 -> mark overLimit (do not truncate silently).

2. Queue tab, for Queued rows only: [Copy for LinkedIn] (clipboard, with a visible character count and an over-3000 warning), [Open Zaboraa LinkedIn Page] (https://www.linkedin.com/company/zaboraa/, new tab, rel="noopener noreferrer"), [Mark as Posted].

3. Mark as Posted: modal asking the real LinkedIn post URL. Validate https://www.linkedin.com/ and /feed/update/urn:li:(activity|share|ugcPost):digits or /posts/... Then ONE confirmation: "Confirm this was posted to the real Zaboraa LinkedIn page." Save via the existing admin Supabase pattern (no new API function): content_queue.status='Posted', posted_at=now(), linkedin_url. The draft stays 'Approved' (no Posted value exists). Insert an audit_logs row.

4. Posted rows: show "View on LinkedIn" link and posted date; disable Unapprove and Delete; never show Copy/Mark again.

5. Migration (show SQL first, do not run): supabase/migrations/20261113_content_queue_manual_posting.sql adding posted_at timestamptz and linkedin_url text with ADD COLUMN IF NOT EXISTS. No RLS loosening.

6. Tests: formatLinkedInPost (edited_body preferred, no title, hashtag normalization, code-point counting with emoji, over-limit flag, no escaping), URL validator (valid/invalid), Posted rows hide actions. No network.

DONE WHEN: no new failures vs baseline, build matches baseline, manual check on localhost:3001. Push the branch and print a verification list for the Preview.
```

---

## PROMPT 2c — LinkedIn API Posting (Community Management API)

> **DO NOT RUN until LinkedIn approves Community Management API.**
>
> Before sending this prompt, confirm ALL of the following yourself:
> - A dedicated LinkedIn app (separate from App 2) has Community Management API **approved** and is verified against the Zaboraa Page.
> - You (Wasim Sayyed) are a Super admin of the Zaboraa LinkedIn Page.
> - `https://zaboraa.com/api/linkedin/callback` (apex, no www) is registered as a redirect URI in the app.
> - Vercel env vars exist for BOTH Preview and Production: the new app's LINKEDIN_CLIENT_ID, LINKEDIN_CLIENT_SECRET, LINKEDIN_ORG_ID (must be numeric: 145341200), LINKEDIN_POSTING_ENABLED=false, LINKEDIN_API_VERSION (a currently supported YYYYMM from LinkedIn's docs), LINKEDIN_TOKEN_ENC_KEY (32 random bytes, base64).
>
> Run this ONLY after Phase 2a and 2b are merged to main.

```
TASK: Phase 2c. Branch feature/content-agent-phase2c-linkedin-api, from main AFTER 2a and 2b are merged. Post to the real Zaboraa LinkedIn Page only through the admin UI, only manually.

HARD RULES
- You must NEVER call the real LinkedIn posts endpoint, in code runs, tests, curl or scripts. Only I trigger a real post, from the admin UI. Tests mock fetch.
- Do not touch auth, other admin pages, other /api files or Zabura FX. No auto-post, scheduler, cron or background job. Manual button only.

STEP 0 (read-only, then STOP): baselines as before; count api/*.js (Vercel Hobby = 12): use ONE function api/linkedin/[action].js (connect, callback, post, status), and if even that exceeds the limit, STOP; read the migration and report content_queue constraints; read LinkedIn's current docs for the Posts API, Little Text Format (reserved characters to escape) and versioning, and report what you rely on. Plan every file and migration.

BUILD (after OK PROCEED):
1. Migration (show SQL first, never run): new table linkedin_connection (singleton: access_token_enc, refresh_token_enc nullable, expires_at, scopes, connected_by, connected_at) with RLS ENABLED, NO policies, and REVOKE ALL from anon and authenticated. Extend content_queue: widen the status CHECK to include 'Posting' and 'Failed'; add posting_started_at, linkedin_post_urn, last_error (IF NOT EXISTS). Encrypt tokens with AES-256-GCM using LINKEDIN_TOKEN_ENC_KEY; tokens never reach the client or logs.

2. All actions require the 2a requireAdmin helper (Supabase JWT + admin role).

3. connect (POST, Bearer): create a signed state (HMAC; contains user id, nonce, expiry <=10 min) and set an httpOnly Secure SameSite=Lax cookie with the nonce. Return the LinkedIn authorize URL with scope w_organization_social (+ r_organization_social only if the portal shows it; NO openid/profile/w_member_social/email unless the app actually has them). Redirect URI exactly https://zaboraa.com/api/linkedin/callback.

4. callback (GET, browser navigation, no Bearer): verify the state signature, expiry and cookie nonce. Exchange the code server-side with the client secret. Store the encrypted token. 302 to /admin?linkedin=connected (or ?linkedin=error). On error return a sanitized LinkedIn error body (never URLs or secrets).

5. status: { connected, expiresAt, postingEnabled }. Tokens last about 60 days; use a refresh token only if LinkedIn returned one, else show "Reconnect LinkedIn".

6. post (POST { queueId or draftId, dryRun?:boolean }):
   - Require LINKEDIN_POSTING_ENABLED==='true' (else 403 unless dryRun). Validate the id format.
   - Load the queue row + draft server-side with the service role. Require queue.status='Queued' AND draft.status='Approved', else 400 "Draft must be Approved before posting." (409 if already Posted/Posting).
   - Text = formatLinkedInPost(draft) from 2b. Then escape reserved Little Text characters for the API only, but keep the intended hashtag # characters. Escape the backslash; verify the exact reserved set against the current docs and unit-test it. Count the 3000 limit AFTER escaping, by code points. If over: truncate only the body at a sentence/word boundary with "...", always keep the cta and hashtags.
   - dryRun returns { payload, length } with NO LinkedIn call and NO status change.
   - Atomic claim: UPDATE content_queue SET status='Posting', posting_started_at=now() WHERE id=$1 AND status='Queued' RETURNING; zero rows -> 409.
   - POST https://api.linkedin.com/rest/posts with Authorization Bearer, Linkedin-Version: LINKEDIN_API_VERSION, X-Restli-Protocol-Version: 2.0.0, body { author:"urn:li:organization:"+LINKEDIN_ORG_ID (numeric only), commentary, visibility:"PUBLIC", distribution:{feedDistribution:"MAIN_FEED",targetEntities:[],thirdPartyDistributionChannels:[]}, lifecycleState:"PUBLISHED", isReshareDisabledByAuthor:false }. Timeout 20s. Never auto-retry.
   - Success (201): read the URN from the x-restli-id RESPONSE HEADER (the body is empty). linkedinUrl = https://www.linkedin.com/feed/update/{urn}/ . Set queue.status='Posted', posted_at, linkedin_post_urn, linkedin_url. The draft stays 'Approved'. Return { success:true, linkedinPostId, linkedinUrl }. If the DB update fails after a LinkedIn success, still return success with a warning containing the URN.
   - Definite LinkedIn failure (any HTTP error response): revert to 'Queued' with last_error. Return { success:false, error, details } with the sanitized LinkedIn message. 401 -> mark connection expired, "Reconnect LinkedIn"; 403 -> scope/Page-admin problem; 426 -> bad version; 429 -> rate limit. Ambiguous failure (timeout/network): leave 'Posting' and show "Check LinkedIn, then use Mark as Posted"; auto-retry is forbidden.
   - Insert an audit_logs row on EVERY attempt (user, queue id, dryRun, outcome, urn). Never log tokens, headers or the secret.

7. UI (edit existing Queue files only): a "LinkedIn connection" card (Connect / Reconnect, expiry date, posting enabled flag). On Queued+Approved rows show [Post to Zaboraa LinkedIn] only if connected and postingEnabled. Dialog 1 shows the EXACT final text and its length: "This will post to the REAL Zaboraa LinkedIn page (linkedin.com/company/zaboraa). Are you sure?" Dialog 2 button: "Yes, post now". Disable the button while in flight. After success show a "View on LinkedIn" link. Keep Copy for LinkedIn and Mark as Posted from 2b as the fallback.

8. Tests (mock fetch only): state signing/expiry/nonce mismatch; auth 401/403; status gating; atomic claim 409; escape function; 3000-char truncation with emoji; header-based URN parsing; the failure matrix (401, 403, 426, 429, timeout); dryRun makes no fetch and no DB write; the flag-off path; a test that no token or secret appears in any response or log.

DONE WHEN: no new failures vs baseline; build matches; the code is merged with LINKEDIN_POSTING_ENABLED=false. Report the checklist for me: (1) Connect LinkedIn on production, (2) dryRun, (3) set the flag true, (4) one harmless approved post, then delete it in LinkedIn if needed.
```

---

*End of task file. No secrets. No Bible content. Update docs/ only after each phase merges.*
