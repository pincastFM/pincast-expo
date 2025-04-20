# Pincast Expo — Revised Specification (Cursor‑first SDK)

*Version 2 • 2025‑04‑20*

---

## 0 · Purpose

**Baseline accomplished so far (Tickets #1 ‑ #3):** repo scaffold on Nuxt 3 + Tailwind, Logto RBAC middleware, and Vercel Postgres + PostGIS schema are already merged on `main`. Spec v2 builds on that foundation; no previously delivered code is discarded. Existing database tables (`users`, `apps`, `versions`, …) stay intact and are consumed by the new SDK/CLI pipeline.

Enable **Cursor** vibe‑coders (VS‑Code users) to build, test, and publish full‑stack location‑based experiences that plug natively into the Pincast platform with two commands:

```text
⌘⇧P  »  Pincast: Enable Expo   # scaffolds SDK & auth
pincast deploy                 # builds + registers app (state=pending)
```

This replaces the earlier "CMS upload" concept; Expo is now an **SDK + extension + CLI + minimal catalog API**.

---

## 1 · Components

| Layer                                 | Artifact                    | Responsibility                                                                             |
| ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| **Cursor extension** (`pincast-expo`) | VS‑Code marketplace package | • Palette commands (`Enable`, `Publish`)  • Writes config & env • Calls CLI                |
| `@pincast/sdk`                        | NPM package (Nuxt3)         | • Logto auth wrapper  • `usePincastLocation`, `usePincastData`, `useAnalytics` composables |
| **CLI**                               | Binary published via pkg    | • Local dev proxy  • Build+deploy to Pincast Vercel org  • Register app via REST           |
| **Expo API** (`POST /ci/apps`)        | Edge function               | • Accept build hash + metadata → write to `apps` + first `versions` row (`state=pending`)  |
| **Staff dashboard**                   | Nuxt page `/review`         | • Approve / reject / hide                                                                  |
| **Marketplace catalog**               | Public API `/catalog`       | • Geo‑filtered list for players                                                            |

---

## 2 · Developer Flow

1. **Install extension** or run `npm i -g pincast && pincast init`.
2. Command *Enable* →
   - Adds `@pincast/sdk` & Pinia if missing.
   - Generates `pincast.json` (title, geo, hero).
   - Writes `.env.pincast` with Logto + Customer.io keys fetched via OAuth device flow.
3. Dev codes using Cursor prompts; SDK composables handle storage & auth.
4. *Publish* command → CLI:
   - Runs Nuxt `build`, uploads assets to Pincast Vercel org (bucket per app).
   - Calls `POST /ci/apps` with build URL, metadata, token.
   - Response shows dashboard link (pending).
5. Staff approves → app visible in catalog; players authenticate once via Logto and play.

---

## 3 · Auth & Data

- **Auth**: same Logto tenant; SDK exchanges player ID token for scoped App token (JWT `aud=app:{id}`) to call Data API.
- **Data API**: REST routes `/data/{collection}` auto‑namespaced per app.
- **Storage**: key‑value + GeoJSON blob backed by Postgres (JSONB + PostGIS).
- **Analytics**: SDK pipes events to Customer.io with `app_id` & `player_id`.

---

## 4 · CLI Commands

```bash
pincast init            # clone starter, set env
pincast dev             # start Nuxt + local proxy (Port 8787)
pincast deploy [--prod] # build, upload, register version
pincast login           # device‑flow OAuth to get dev token
```

---

## 5 · API Contract (CI endpoint)

```http
POST /ci/apps
Headers: Authorization: Bearer <dev_token>
Body: {
  "title": "Zombie Run NYC",
  "slug": "zombie-run-nyc",
  "geo": { "center": [-73.93,40.72], "radiusMeters":1500 },
  "heroUrl": "https://res.cloudinary.com/...",
  "buildUrl": "https://pincast-apps.vercel.app/_next/static/...",
  "sdkVersion": "0.1.0"
}
```

Returns `{ "appId": "uuid", "dashboard": "https://expo.pincast.fm/dashboard/uuid" }`.

---

## 6 · Roadmap & Tickets (v2)

| ID    | Task                                                 | Description                                                                |
|-------|------------------------------------------------------|----------------------------------------------------------------------------|
| T-01  | Create `@pincast/sdk` (Nuxt composables, auth wrapper) | Build Nuxt composables for location, data, analytics with Logto auth      |
| T-02  | `pincast` CLI (login, init, dev proxy, deploy)       | Develop CLI for auth, project setup, local development, and deployment     |
| T-03  | Cursor VS-Code extension (commands, UI)              | Create extension with palette commands for Enable, Publish with UI flows   |
| T-04  | Expo CI API route & token exchange                   | Implement API endpoint for app registration and token exchange mechanism   |
| T-05  | Staff review dashboard redux (reads apps.state)      | Update review dashboard to work with new app states and approval flow      |
| T-06  | Catalog endpoint & player auth flow                  | Create API for geo-filtered app discovery and streamlined player auth      |
| T-07  | Starter template (`create-pincast-app`)              | Build template with Nuxt 3 + Mapbox with required components pre-configured|
| T-08  | Docs site rewrite                                    | Update documentation to reflect new SDK/CLI-focused workflow               |

---

## 7 · Success Criteria (MVP)

- 100 Cursor users run `pincast init` in first 30 days.
- ≥ 50 apps reach `state='pending'`; ≥ 25 approved.
- DAU/MAU across published apps ≥ 0.20 by week 6.

---

## 8 · Permanent Quality Directives

- **Zero TypeScript errors**: Code must compile without errors before being considered complete.
- **Tests must be passing**: All tests must be run and pass before completing any ticket.
- **No hypotheticals**: Never say something "should" work - test it immediately and fix any issues.
- **Implementation verification**: Always check and prove that implementations work before completion.
- **Documentation quality**: All documentation must have proper front matter with title and description, and all internal links must be valid.
- **Clean commits**: Never add AI assistant branding, emoji, or co-author tags to commit messages. Keep messages concise and descriptive.

---

*End of spec v2*