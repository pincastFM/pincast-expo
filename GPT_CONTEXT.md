# Pincast Expo Project Context

## Project Overview
You are tasked with helping create the "pincast-expo" project that enables Cursor VS Code users to build, test, and publish full-stack location-based experiences that plug natively into the Pincast platform. The new approach uses an SDK, CLI, and VS Code extension to provide a streamlined developer experience with just two commands:

```
⌘⇧P  »  Pincast: Enable Expo   # scaffolds SDK & auth
pincast deploy                # builds + registers app (state=pending)
```

This project should:
1. Be built in its own repository (named "pincast-expo")
2. Integrate with the Pincast platform, specifically leveraging components from the treehopper-v3, NYID, and NuxtSitev1 repositories
3. Ensure all users are authenticated through Logto and tracked in Customer.io

## Spec Highlights (v2)

### Pincast Expo — Revised Specification (Cursor‑first SDK)

*Version 2 • 2025‑04‑20*

**Baseline accomplished so far (Tickets #1 ‑ #3):** repo scaffold on Nuxt 3 + Tailwind, Logto RBAC middleware, and Vercel Postgres + PostGIS schema are already merged on `main`. Spec v2 builds on that foundation; no previously delivered code is discarded. Existing database tables (`users`, `apps`, `versions`, …) stay intact and are consumed by the new SDK/CLI pipeline.

### Components

| Layer                                 | Artifact                    | Responsibility                                                                             |
| ------------------------------------- | --------------------------- | ------------------------------------------------------------------------------------------ |
| **Cursor extension** (`pincast-expo`) | VS‑Code marketplace package | • Palette commands (`Enable`, `Publish`)  • Writes config & env • Calls CLI                |
| `@pincast/sdk`                        | NPM package (Nuxt3)         | • Logto auth wrapper  • `usePincastLocation`, `usePincastData`, `useAnalytics` composables |
| **CLI**                               | Binary published via pkg    | • Local dev proxy  • Build+deploy to Pincast Vercel org  • Register app via REST           |
| **Expo API** (`POST /ci/apps`)        | Edge function               | • Accept build hash + metadata → write to `apps` + first `versions` row (`state=pending`)  |
| **Staff dashboard**                   | Nuxt page `/review`         | • Approve / reject / hide                                                                  |
| **Marketplace catalog**               | Public API `/catalog`       | • Geo‑filtered list for players                                                            |

### Developer Flow

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

### Auth & Data

- **Auth**: same Logto tenant; SDK exchanges player ID token for scoped App token (JWT `aud=app:{id}`) to call Data API.
- **Data API**: REST routes `/data/{collection}` auto‑namespaced per app.
- **Storage**: key‑value + GeoJSON blob backed by Postgres (JSONB + PostGIS).
- **Analytics**: SDK pipes events to Customer.io with `app_id` & `player_id`.

### CLI Commands

```bash
pincast init            # clone starter, set env
pincast dev             # start Nuxt + local proxy (Port 8787)
pincast deploy [--prod] # build, upload, register version
pincast login           # device‑flow OAuth to get dev token
```

### Authentication Roles

The application uses a role-based access control system with three roles:

| Role | Description | Access Level |
|------|-------------|--------------|
| `player` | Default role for all users | Can browse and install apps |
| `developer` | App developers | All player rights + submit/manage apps |
| `staff` | Pincast staff | All rights + approve/reject/rollback apps |

Roles are managed through Logto claims. The SDK handles token exchange for scoped app access.

## Important Instructions for Project Development

1. **ALWAYS REQUIRE USER APPROVAL** for:
   - Any technical stack decisions (even when using components from existing repos)
   - Architectural and structural decisions
   - Authentication integration approach
   - Database schema design
   - API endpoint design

2. **NEVER MAKE ASSUMPTIONS** about any detail of the specification. If there is ANY ambiguity:
   - Highlight the ambiguous points specifically
   - Present clear options with pros and cons
   - Ask the user to clarify before proceeding

3. **FOCUS PRIMARILY ON**:
   - Implementing the Cursor-first SDK, CLI, and VS Code extension workflow
   - Ensuring all users are authenticated through Logto with proper token exchange
   - Maintaining Customer.io integration for analytics
   - Creating a clean, maintainable codebase in the pincast-expo repository

When crafting prompts for Claude Code, ensure they:
1. Are precise and specific
2. Include relevant technical context from the CLAUDE.md document
3. Break complex tasks into manageable steps
4. Ask for clarification on ambiguous points
5. Request user approval for key decisions

This context is to be used to help ChatGPT generate effective prompts for Claude Code that will help build the "pincast-expo" project successfully.