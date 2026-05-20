# UX Radar

A premium editorial feed aggregator for UX Design, Technology, AI, Product Design, and Gadgets. Aggregates 30+ top sources into one beautiful, bookmarkable daily feed — updated hourly.

## Features

- **Unified feed** from 30 curated sources across UX, tech, AI, gadgets, and design
- **Hero article** + editorial card layout
- **Category filtering** across 10 categories
- **Save/bookmark** articles (per-browser session)
- **Mark read/unread** tracking
- **Search** across all articles
- **Sort** by latest, oldest, saved, or unread
- **Time filters**: Today / This Week / All time
- **Daily Digest**: Top 10 articles of the day grouped by category
- **Web Push Notifications** with category filtering and quiet hours
- **Admin panel** for managing sources
- **Dark/light mode**
- **PWA** — bookmarkable from your home screen
- **Hourly RSS refresh** via Vercel Cron

---

## Quick Start

### 1. Clone & install

```bash
git clone <your-repo>
cd ux-radar
npm install
```

### 2. Set up Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the contents of `supabase/schema.sql`
3. Note your project URL and keys from **Settings → API**

### 3. Generate VAPID keys (for push notifications)

```bash
npx web-push generate-vapid-keys
```

### 4. Configure environment variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

NEXT_PUBLIC_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key
VAPID_EMAIL=mailto:admin@yourdomain.com

CRON_SECRET=generate_a_random_string_here
```

### 5. Seed the database

```bash
npm run db:seed
```

This inserts all 30 RSS sources into Supabase.

### 6. Run locally

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### 7. Trigger the first feed fetch

```bash
curl http://localhost:3000/api/cron
```

Or click **Refresh all** in the admin panel at `/admin/sources`.

---

## Database Schema

Run `supabase/schema.sql` to create all tables:

| Table | Purpose |
|-------|---------|
| `sources` | RSS feed sources (name, URL, category, status) |
| `categories` | Category definitions with colors |
| `articles` | All fetched articles, deduplicated by URL |
| `saved_articles` | Per-session bookmarked articles |
| `read_articles` | Per-session read history |
| `notification_subscriptions` | Web Push subscriptions and preferences |

---

## Deployment (Vercel)

1. Push to GitHub
2. Import into [Vercel](https://vercel.com)
3. Set all environment variables in Vercel dashboard
4. Deploy

The `vercel.json` configures hourly cron (`0 * * * *`) hitting `/api/cron`.

The cron endpoint validates the `Authorization: Bearer <CRON_SECRET>` header sent automatically by Vercel Cron.

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Home feed with hero article |
| `/category/[slug]` | Filter by category |
| `/source/[id]` | Articles from a single source |
| `/saved` | Your bookmarked articles |
| `/daily-digest` | Today's top 10 picks |
| `/settings` | Notifications, theme, data |
| `/admin/sources` | Manage RSS sources |

---

## API Routes

| Route | Method | Description |
|-------|--------|-------------|
| `/api/articles` | GET | Paginated article feed with filters |
| `/api/sources` | GET, POST | List / add sources |
| `/api/sources/[id]` | PUT, DELETE | Update / remove a source |
| `/api/sources/[id]/refresh` | POST | Refresh a single source |
| `/api/saved` | GET, POST, DELETE | Manage saved articles |
| `/api/read` | POST, DELETE | Manage read state |
| `/api/cron` | GET, POST | Trigger RSS refresh (secured) |
| `/api/daily-digest` | GET | Today's top articles grouped by category |
| `/api/notifications/subscribe` | POST, DELETE | Push subscription management |
| `/api/notifications/preferences` | GET, PUT | Notification preferences |

---

## Project Structure

```
ux-radar/
├── app/                    # Next.js App Router pages + API routes
│   ├── api/               # All API endpoints
│   ├── category/[category]
│   ├── source/[source]
│   ├── saved/
│   ├── daily-digest/
│   ├── settings/
│   ├── admin/sources/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── features/          # FeedFilters
│   ├── layout/            # Navigation, Sidebar, MobileNav
│   ├── providers/         # ThemeProvider
│   └── ui/                # ArticleCard, HeroArticle, badges, states
├── data/
│   └── sources.ts         # 30 RSS sources seed data
├── lib/
│   ├── categories.ts      # Auto-categorization logic
│   ├── rss.ts             # RSS fetcher + parser
│   ├── session.ts         # Browser session ID
│   └── supabase.ts        # Supabase client
├── scripts/
│   └── seed.ts            # Database seeder
├── supabase/
│   └── schema.sql         # Database schema
├── types/
│   └── index.ts           # TypeScript types
├── public/
│   ├── sw.js              # Service worker (push notifications)
│   └── manifest.json      # PWA manifest
└── vercel.json            # Vercel cron config
```

---

## Adding New Sources

Via the admin UI at `/admin/sources`, or add to `data/sources.ts` and re-run `npm run db:seed`.

Required fields: `name`, `url` (website), `rss_url` (RSS feed), `category`.

Categories: `ux-design`, `ui-design`, `product-design`, `design-systems`, `ai`, `technology`, `gadgets`, `startups`, `innovation`, `research`
