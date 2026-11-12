# AI News Desk

AI News Desk is an internal media operating system for tracking global AI stories plus an Australian lane, clustering signals from X/watchlists, RSS feeds, and lab blogs. This repo ships a Next.js + Tailwind + TypeScript stack wired to Supabase/Postgres, modular ingestion connectors, clustering/ranking, summaries, and a digest email workflow.

## Tech stack

- **Next.js 16 app router** with server components for Today, All Stories, and Story Detail views
- **Tailwind CSS 4** for clean responsive UI (custom layout + cards)
- **Supabase/Postgres** (optional) for connectors, raw items, stories, and settings
- **Node Cron** powering hourly pipeline + 8 AM digest automation
- **RSS Parser + mock pipelines** for V1 ingestion
- **Nodemailer** for digest email
- **TSX scripts** for running manual pipeline/digest jobs

## Quick start

1. **Copy `.env.example` → `.env.local`** and populate Supabase credentials (optional) plus SMTP/digest info.
2. **Install deps:** `npm install`
3. **Run dev server:** `npm run dev`
4. **Seed connectors** automatically on the first pipeline run; manual seeds provided in `src/data/seedConnectors.ts`.
5. **Run the pipeline instantly:** `npm run pipeline` to ingest, cluster, and summarize in one sweep.
6. **Send a digest manually:** `npm run digest`

## Supabase / Postgres schema

Apply `db/schema.sql` to create the required tables (`connectors`, `raw_items`, `story_clusters`, `settings`). Supabase clients are optional—without credentials the app uses an in-memory store seeded from `src/data/seedConnectors.ts`.

## Ingestion + clustering

- **Connectors** live in `src/lib/connectors` with modular handlers for RSS, watchlists, and mock data. Defaults defined in `src/data/seedConnectors.ts`.
- **Pipeline**: `runStoryPipeline` (ingest → raw items → cluster/rank/summarize). The clustering logic groups items by shared tokens, calculates a weighted score, and generates short/full summaries plus content angles.
- **Normalization** and seeds: raw items include category/region tags plus extracted keywords. Story clusters store all source IDs for later detail URLs.

## Daily digest

- `node-cron` schedules:
  - `PIPELINE_CRON` (default `0 * * * *`) runs the pipeline every hour.
  - `DIGEST_CRON` (default `0 8 * * *`) sends the digest email at 8 AM AEST.
- Use the `sendDailyDigest` helper to build an HTML summary (top clusters, angles, source counts).
- The digest also records metadata in `settings` for auditing.

## UI overview

- **Today view** (`/`): top clusters, refresh cadence stats, Australian signal badge, quick links to story detail.
- **All Stories** (`/all`): filter by category or Australia lane; uses the `ClusterCard` component for consistency.
- **Story detail** (`/story/[id]`): shows short + full summaries, “why it matters”, content angles, and all source items with copy-friendly text.
- **Config page** (`/config`): forms for each connector letting you tweak priority weights and seed JSON. Submits to `/api/connectors`.
- **Drafts** (`/drafts`): placeholder page ready for future content pack + publishing workflow.

## Operations

- **Run the pipeline**: `npm run pipeline`
- **Send the digest**: `npm run digest`
- **Use cron**: Point your hosting process (`npm run dev`/`next start`) to keep `node-cron` alive. You can disable cron by setting `DISABLE_CRON=true`.
- **Manual updates**: Update connector JSON via the config page or adjust `src/data/seedConnectors.ts` for new sources before seeding.

## Future-ready hooks

- The story detail view includes a placeholder “Generate Content Pack” button and content angles ready to be copied into drafts.
- The modular ingestion architecture lets you drop in new connectors (X API, advanced RSS, structured APIs).
- `scripts/pipeline.ts` and `scripts/digest.ts` can be run from CI, scheduled tasks, or triggered by webhooks as needed.
