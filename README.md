# Bookworm Light Pro

> A modern blogging platform with bi-directional Google Sheets sync. Built with Next.js 16, React 19, Supabase, and Google Sheets API.

**Production URL:** https://k-sheetsync5.vercel.app

## Overview

Bookworm Light Pro clones the clean, reader-friendly design of the [Bookworm Light](https://themefisher.com/demo?theme=bookworm-light-nextjs) template and transforms it into a Medium.com-style blogging platform with a unique twist: every post lives in both Supabase (for fast reads/writes) **and** the author's own Google Spreadsheet (for easy editing and sharing). Changes sync bi-directionally — write in the app, it appears in the sheet. Edit the sheet, it updates the site.

## Key Features

### Bi-Directional Google Sheets Sync
- **Supabase → Sheets (immediate):** Every post created/edited in the app is instantly replicated to the author's spreadsheet.
- **Sheets → Supabase (multi-mechanism):**
  - **On-demand:** "Sync Now" button in the dashboard triggers an immediate sync.
  - **Google Drive Push Notifications:** Real-time webhook notifications when a sheet is edited.
  - **GitHub Actions cron:** Backup sync every 10 minutes.
- **Conflict resolution:** Latest `last_modified` timestamp wins. System columns (likes, views, comments) only flow Supabase → Sheet.

### Medium.com Features
- Multi-clap button with optimistic UI
- Threaded comments
- Reading time estimates
- Author bylines and profile pages (`/profile/{username}`)
- "More from this author" recommendations
- Social sharing bar (X, Facebook, LinkedIn, WhatsApp, Copy link)

### Post Permalinks
Posts use a clean, SEO-friendly URL structure: `/blog/{cat1}/{cat2}/{post-slug}`

### Admin Dashboard (`/admin`)
WordPress-like CMS with:
- Posts management (CRUD)
- User management (roles, ban)
- Sync log viewer
- Payment transactions viewer
- Site settings (hero, registration toggle, SMTP config)

### User Dashboard (`/dashboard`)
- Author analytics (views, likes, comments)
- Google Sheets setup flow (step-by-step instructions + initialize button)
- Post editor with Markdown support
- "Sync Now" button

### Payments
Lipia M-Pesa integration (STK Push, status polling, callback webhooks) for one-time payments.

### SEO
- Per-route metadata (title, description, canonical, OG, Twitter cards)
- JSON-LD structured data (Article, BreadcrumbList, Organization)
- Dynamic sitemap.xml
- robots.txt
- RSS feed (`/feed.xml`)

### PWA
- Installable manifest
- Service worker (cache-first static, network-first dynamic)
- Offline fallback

### Documentation (`/docs`)
- Landing copy, user manual, changelog (with architecture decisions), roadmap

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.7 (App Router, Turbopack) |
| UI | React 19.1.1, TypeScript 5.8.3 (strict), Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) — project "final prod" (`wjyeqokhmzefvtdimtiy`) |
| Auth | Supabase Auth (email/password + Google OAuth) |
| Sheets API | Google Service Account (Sheets + Drive scopes) |
| Payments | Lipia M-Pesa API |
| Email | Resend (code wired, key deferred) |
| Deployment | Vercel |
| CI/CD | GitHub Actions (sync cron) |

## Architecture

### Folder Structure
```
src/
├── app/              # Next.js App Router (pages, API routes, layouts)
│   ├── api/          # Route handlers (posts, sheets, sync, payments)
│   ├── admin/        # Admin dashboard
│   ├── blog/         # Blog pages with /cat1/cat2/slug permalinks
│   ├── dashboard/    # User dashboard + post editor
│   ├── docs/         # Documentation pages
│   └── ...
├── components/       # Reusable UI components
├── config/           # Site config, env validation, menus
├── lib/              # Supabase clients, error handling, utils
├── providers/        # React contexts (Auth, Theme)
├── schemas/          # Zod validation schemas
├── services/         # External service integrations (Sheets, Lipia, Email)
├── actions/          # Server-side data access layer
└── types/            # TypeScript domain types
```

### Database Schema (Supabase, `bookworm_` prefix)
- `bookworm_profiles` — user profiles (username, bio, sheet_id, role)
- `bookworm_posts` — posts (cat1, cat2, slug, content_md, likes, views, sheet_row_id)
- `bookworm_post_comments` — threaded comments
- `bookworm_post_likes` — clap records (unique per user+post)
- `bookworm_sync_log` — sync operation logs (direction, trigger, status)
- `bookworm_audit_logs` — sensitive operation audit trail
- `bookworm_payment_transactions` — M-Pesa payment records
- `bookworm_site_settings` — site-wide configuration
- `bookworm_follows` — author follow relationships

### Google Sheets Column Schema
```
post_id | cat1 | cat2 | title | slug | excerpt | content | tags | likes | comments | view_count | status | featured_image | created_at | last_modified
```

## Demo Accounts
- **Admin:** admin@bookworm.pro / password123
- **Author:** author@bookworm.pro / password123

## Environment Variables

See `.env.example` for all required variables. Key ones:
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_SECRET`
- `GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL` / `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`
- `LIPIA_API_KEY` / `LIPIA_BASE_URL`
- `SYNC_WORKER_SECRET` (for GitHub Actions cron authentication)

## License

MIT — Based on [Bookworm Light](https://github.com/themefisher/bookworm-light-nextjs) by Themefisher.
