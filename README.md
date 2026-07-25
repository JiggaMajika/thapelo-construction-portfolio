# The Bridge

A shared workspace between **Global Media Content Ltd (GMC)** and **AppSumo** for
tracking whether software vendors keep the promises they made when they sold a
lifetime deal. Think Linear/Monday, purpose-built for one job.

Designed to be simple enough that a support agent uses it without training —
every screen answers "what needs me?" in three seconds.

## Zero running cost

Everything runs on Cloudflare's free tier. The only paid thing is a domain name.

| Concern | Choice |
|---|---|
| Frontend | Vite + React 18 + TypeScript + Tailwind (hand-built components) |
| Hosting | Cloudflare Pages / Worker static assets |
| API | Cloudflare Workers + Hono |
| Database | Cloudflare D1 (SQLite) via Drizzle ORM |
| File storage | Cloudflare R2 (evidence screenshots + weekly backups) |
| Auth | Hand-written JWT (`jose`) in an httpOnly cookie; PBKDF2 (Web Crypto) hashing |
| Data fetching | TanStack Query (30s polling, paused when tab hidden) |
| Charts | Recharts · Dates: date-fns |

No external services. No bcrypt (PBKDF2 keeps within the 10ms CPU budget). Login
is per-IP rate limited and accounts lock for 15 minutes after 5 failed attempts.

## Project layout

```
worker/                 Cloudflare Worker (Hono API)
  index.ts              entry: routes + weekly backup cron
  db/schema.ts          Drizzle schema (18 tables, indexed)
  auth/                 PBKDF2 hashing + JWT
  routes/               auth, vendors, promises, issues, comments,
                        notifications, approvals, honours, dashboard,
                        support, reports, uploads, ingest, admin, misc
  lib/                  sla/activity helpers, rate limit, backup
  seed/                 seed source data + SQL generator
shared/types.ts         enums + role logic shared by worker and frontend
src/frontend/           React SPA (pages + components + lib)
migrations/             Drizzle-generated SQL migrations
seed.sql                generated demo data (run separately, not a migration)
wrangler.toml           bindings: DB (D1), SCREENSHOTS + BACKUPS (R2), cron
```

## Local development

Prerequisites: Node 18+.

```bash
npm install

# 1. Local secrets for `wrangler dev`
cp .dev.vars.example .dev.vars     # edit JWT_SECRET / INGEST_TOKEN

# 2. Create the local D1 schema and seed it
npm run seed:build                 # regenerate seed.sql (optional; committed)
npm run db:migrate:local
npm run db:seed:local

# 3. Run the API (Worker + local D1 + R2) on :8787
npm run dev:api

# 4. In another terminal, run the frontend on :3000 (proxies /api -> :8787)
npm run dev
```

Open http://localhost:3000.

### Demo accounts

Seeded one user per role. Password for all: **`BridgeDemo2024!`**

| Role | Email |
|---|---|
| GMC Admin | admin@gmc.test |
| GMC Analyst | analyst@gmc.test |
| AppSumo Exec | exec@appsumo.test |
| AppSumo Partnerships | partnerships@appsumo.test |
| AppSumo Support | support@appsumo.test |
| AppSumo Finance | finance@appsumo.test |

The login screen has one-click buttons to fill each account.

## Deploying to Cloudflare

```bash
# One-time: create the D1 database and R2 buckets
wrangler d1 create bridge-db          # copy the id into wrangler.toml
wrangler r2 bucket create bridge-screenshots
wrangler r2 bucket create bridge-backups

# Secrets (never committed)
wrangler secret put JWT_SECRET        # a long random string
wrangler secret put INGEST_TOKEN      # bearer token for /api/ingest

# Schema + demo data on the remote DB
npm run db:migrate:remote
npm run db:seed:remote                # optional; for the client demo only

# Build the SPA and deploy the Worker (serves API + static assets)
npm run build
npm run deploy:worker
```

Until a domain is bought, the free `*.workers.dev` / `*.pages.dev` address works.
Attach a custom domain in the Cloudflare dashboard; SSL is automatic.

### Cloudflare MCP

Once the first deploy is live, connect the Cloudflare MCP server so the site can
be managed conversationally through Claude afterwards.

## Backups

- A **cron Worker** runs weekly (Sun 03:00 UTC), exports every table to a single
  JSON file, and writes it to R2 at `backups/{date}.json`.
- Admins also get an **Export everything** button (Settings → Data) that downloads
  the full dataset as JSON (`GET /api/admin/export`, `gmc_admin` only).

## The ingest API

The only automated way data enters the system. GMC's monitoring engine — which
lives **entirely outside this codebase** — posts to it:

```
POST /api/ingest
Authorization: Bearer <INGEST_TOKEN>
```

It accepts JSON that can create/update vendors, append score-history rows, and add
issues, promises and complaint themes. Validated with Zod; returns a write summary.
The Bridge never crawls or fetches from vendor sites itself.

## Demo data

The eight real vendors (Yapper, Qolaba, JoggAI, Pickaxe, ContentGroove,
Cosmos Video, Adilo, Pictory) are publicly documented lifetime-deal cases, seeded
for client demonstration only and flagged `is_demo_record = true`. The dashboard
shows a dismissible banner when demo records are present, and they are easy to
purge before live use. The remaining 14 vendors are clearly fictional filler.

## Scores are never calculated here

Health scores arrive pre-calculated through the ingest API. The Bridge never
computes scores and never exposes weightings, formulas, or component breakdowns
in the interface — only the resulting numbers.
