# Divine Word

A free, beautiful, distraction-free Bible web app. Read scripture the way it was meant to be read.

**Live:** [divineword.app](https://www.divineword.app)

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** [Convex](https://convex.dev)
- **Auth:** [Clerk](https://clerk.com)
- **UI:** Tailwind CSS, shadcn/ui, Lucide icons
- **Fonts:** Cormorant Garamond (reading), Cinzel (headings), DM Mono (UI)
- **Hosting:** Vercel
- **Bible Data:** [Bolls.life API](https://bolls.life) (KJV, WEB, ASV)
- **PWA:** Service worker + manifest for installable app

## Features

### Core

- Full KJV Bible — all 66 books, 1,189 chapters
- Chapter reader with verse numbers and clean typography
- Scripture search (full-text, 50+ results)
- Verse of the Day on homepage
- Book listing with OT/NT categorization
- Single verse pages with shareable URLs
- Light, Dark, and Sepia themes
- Adjustable font size (14–24px)
- Mobile-responsive with bottom sheet navigation

### Auth-Gated (Clerk)

- Bookmark verses across devices with collection/folder organization
- Highlight verses with 6 colors (Gold, Rose, Sage, Sky, Lavender, Peach) + personal notes
- Devotional journal — create, edit, delete entries
- Prayer journal — add requests, categorize (Personal, Family, Community, Praise), mark answered
- Reading progress tracking per chapter
- 6 reading plans (30-Day Psalms, Gospels, NT in 90, Bible in a Year, etc.)

### Personal Dashboard

- Reading streak tracker with GitHub-style heatmap calendar
- Daily reading goal ring (configurable chapters/day)
- Verse of the Day embed with deep link to passage
- Per-book progress cards with completion percentage
- Recent reading history (last 8 chapters)
- Recent journal & prayer entries at a glance
- Bookmark collection summary with counts
- Highlight notes preview
- Milestone achievements (chapters read, streak, books completed, etc.)
- Share progress — copy-to-clipboard summary text
- Reading reminder banner when daily goal not met
- Dashboard settings panel (daily goal, reminder time, toggle)

### Infrastructure

- Convex real-time database with full-text search index
- Fallback data strategy: Convex DB → Bolls.life API
- PWA installable on mobile/desktop
- Vercel Analytics
- SEO: sitemap, robots.txt, Open Graph, Twitter cards

## Project Structure

```
src/
  app/
    page.tsx              # Homepage (VOTD, quick nav)
    bible/
      page.tsx            # All books listing
      [book]/[chapter]/   # Chapter reader
        [verse]/          # Single verse page
    bookmarks/            # Saved verses with collection filtering
    dashboard/            # Personal reading dashboard (12 features)
    journal/              # Devotional entries
    prayers/              # Prayer journal (CRUD, categories, filters)
    plans/                # Reading plans
    search/               # Scripture search
    stats/                # Reading statistics
    login/                # Clerk sign-in/sign-up
    api/                  # Bible & search API routes
  components/
    navbar.tsx            # Navigation bar
    footer.tsx            # Site footer
    streak-calendar.tsx   # GitHub-style reading heatmap
    daily-goal-ring.tsx   # SVG circular progress ring
    highlight-picker.tsx  # Color picker with note support
    ui/                   # shadcn/ui primitives
  lib/                    # Bible data, utilities
convex/
  schema.ts               # Database schema (10 tables)
  bible.ts                # Verse queries & search
  bookmarks.ts            # Bookmark CRUD + collections
  highlights.ts           # Highlight CRUD + notes
  journal.ts              # Journal CRUD
  dashboard.ts            # Aggregated dashboard query
  prayerJournal.ts        # Prayer request CRUD
  milestones.ts           # Achievement tracking
  userSettings.ts         # User preferences (goals, reminders)
  readingPlans.ts         # Plan tracking
  readingProgress.ts      # Chapter progress
  seed.ts                 # Bible data seeder
  auth.config.ts          # Clerk JWT validation
```

## Getting Started

### Prerequisites

- Node.js 18+
- A [Convex](https://convex.dev) account
- A [Clerk](https://clerk.com) account with the Convex integration enabled

### Setup

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Fill in your keys (see below)

# Start Convex dev server
npx convex dev

# Start Next.js dev server
npm run dev
```

### Environment Variables

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_...
CLERK_SECRET_KEY=sk_...

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud
CONVEX_DEPLOYMENT=dev:your-deployment
```

Set on Convex dashboard (or via CLI):

```
CLERK_JWT_ISSUER_DOMAIN=https://your-clerk-frontend-api-url
```

## Deployment

```bash
# Deploy Convex functions to production
npx convex deploy

# Deploy to Vercel (auto-deploys from GitHub)
vercel --prod
```

Vercel env vars needed: `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`, `CLERK_SECRET_KEY`, `NEXT_PUBLIC_CONVEX_URL`

## Roadmap

- [x] Reading statistics dashboard (streaks, completion %)
- [x] Bookmark collections / folder organization
- [x] Highlight notes
- [x] Prayer journal
- [x] Daily reading goal tracking
- [x] Reading streak calendar (heatmap)
- [x] Milestone achievements system
- [x] Share progress functionality
- [x] Reading reminders
- [ ] Fix single verse Copy/Share buttons
- [ ] Persist font size preference to localStorage
- [ ] Enable WEB/ASV translation switching
- [ ] Fix footer testament filter links
- [ ] Reading plan chapter-by-chapter mappings
- [ ] Verse cross-references
- [ ] Export bookmarks/journal/prayers as PDF
- [ ] Full offline support with cached verse data
- [ ] Audio Bible playback
- [ ] Accountability partners (social sharing)
- [ ] Dynamic OG images for social sharing

## License

Scripture text is in the public domain (KJV). Built with love for the glory of God.
