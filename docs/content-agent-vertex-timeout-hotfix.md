# Content Agent Hotfix & Timeout Optimization Record

## Summary
- **Branch:** `fix/content-agent-vertex-timeout`
- **Latest Commit:** `0c78fc9` (`fix(content-agent): configure 55s Vertex timeout, Vercel maxDuration 60s, and frontend auto-retry UX`)
- **Date:** 12 November 2026

## Changes Implemented

1. **Server Timeout & Logging (`api/generate-content.js`)**:
   - Helper function `getVertexTimeoutMs` introduced to parse and validate `VERTEX_TIMEOUT_MS` environment variable.
   - Values $< 10000$ or $> 58000$ or invalid numeric format (e.g. `NaN`) automatically fall back to 55000ms with distinct warning logs.
   - Replaced fixed 25s timeout with clamped timeout duration on `AbortController`.
   - Log instrumentation updated to print `"Vertex call started"` with resolved string values for `location` and `model`, and `"Vertex call finished in Xms"`.
   - Generation parameters set: `maxOutputTokens: 4000`, `temperature: 0.7`.
   - Timeout failures return HTTP status `504` with `{ success: false, error: "Vertex request timed out after 55s, please retry", upstreamStatus: 504, retryable: true }`.

2. **Vercel Function Configuration (`vercel.json`)**:
   - Configured `maxDuration: 60` for `api/generate-content.js` to prevent premature 30s/15s Vercel execution timeouts:
     ```json
     "functions": {
       "api/generate-content.js": {
         "maxDuration": 60
       }
     }
     ```

3. **Client-Side Timeout Handling (`src/lib/contentAgent.ts`)**:
   - `generateContentIdeas` updated to parse and preserve `retryable` flag and `upstreamStatus` on thrown Error objects.

4. **Frontend UX & Auto-Retry (`src/components/admin/views/AdminContentAgentView.tsx`)**:
   - Added auto-retry logic to `handleGenerateIdeas`:
     - Displays status message and toast: `"Taking longer than usual, retrying…"`
     - Auto-retries generation once after a 2,000ms delay if `retryable: true` or timeout error is received.
     - Halts cleanly on subsequent failures without infinite loops.

5. **Unit & Build Verifications**:
   - **Vitest**: `src/tests/contentAgent.test.ts` passed **60 / 60 tests** (including 6 new Section 10 test cases).
   - **Full Test Suite**: `npm test` passed **202 / 206 tests** (4 baseline failures in `adminSuite.test.ts` and `supabaseAndAuth.test.ts`).
   - **Production Build**: `npm run build` compiled 53 static routes and generated 52 sitemap URLs successfully.

## Git Details
- **Branch:** `fix/content-agent-vertex-timeout`
- **Latest Commit Hash:** `0c78fc9`
- **PR URL:** https://github.com/congodb1-ui/Zaboraa-12/pull/new/fix/content-agent-vertex-timeout
