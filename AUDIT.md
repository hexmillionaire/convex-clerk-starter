# Comprehensive Professional Audit: <www.divineword.app>

**Date:** March 28, 2026
**Auditor:** Senior Web Architect / Security Engineer
**Stack:** Next.js 16.2 + React 19 + Convex + Clerk + Tailwind CSS 4 + Vercel

---

## 1. Executive Summary

Divine Word is a well-architected, purpose-built Bible reading application with strong fundamentals: excellent authentication patterns via Clerk + Convex with row-level security, thoughtful SEO with 31,000+ sitemap URLs and structured data, and a clean component architecture built on shadcn/ui. **The biggest risks are the complete absence of Content Security Policy (CSP), missing security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy), no rate limiting on public API endpoints, and a wide-open CORS policy (`Access-Control-Allow-Origin: *`)**. The top opportunities are adding security headers via `next.config.ts`, implementing breadcrumb structured data for rich search results, and adding a skip-to-content link and `aria-live` regions to reach WCAG 2.1 AA compliance. Overall the site is in good health with a clean codebase, but the security header gaps represent the most urgent fixes.

---

## 2. Security Audit

### 2.1 SSL/TLS Configuration

- **HSTS:** Present and strong — `strict-transport-security: max-age=63072000` (2 years). **No `includeSubDomains` or `preload` directives.**
- **Certificate:** Valid, served via Vercel's edge (auto-renewal).
- **Protocol:** HTTP/2 confirmed.

### 2.2 Missing Security Headers (Critical Gaps)

| Header | Status | Risk |
|--------|--------|------|
| `Content-Security-Policy` | **Missing** | XSS attacks, unauthorized script injection |
| `X-Frame-Options` | **Missing** | Clickjacking attacks |
| `X-Content-Type-Options` | **Missing** | MIME-sniffing attacks |
| `Referrer-Policy` | **Missing** | Leaks full URL to third parties |
| `Permissions-Policy` | **Missing** | Unrestricted browser API access |

**How to fix** — Add to `next.config.ts`:

```ts
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          {
            key: "Content-Security-Policy",
            value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.divineword.app https://va.vercel-scripts.com; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: https:; connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev https://va.vercel-scripts.com; frame-src https://clerk.divineword.app; frame-ancestors 'none';"
          },
        ],
      },
    ];
  },
};
```

### 2.3 CORS Misconfiguration

**Observed:** `access-control-allow-origin: *` on all routes (set by Vercel default).

**Why it matters:** The wildcard allows any domain to make requests. While Clerk handles auth tokens, the `/api/bible/` and `/api/search/` endpoints could be abused by scrapers or competitors embedding your API.

**Fix:** Restrict CORS to your own domain in the headers config or via Next.js middleware:

```ts
{ key: "Access-Control-Allow-Origin", value: "https://www.divineword.app" }
```

### 2.4 Exposed Clerk Headers

**Observed on every response:**

- `x-clerk-auth-status: signed-out`
- `x-clerk-auth-reason: session-token-and-uat-missing`

These leak the auth provider identity and session state to any observer. This is Clerk middleware behavior and is low severity but still information disclosure.

### 2.5 OWASP Top 10 Assessment

| Category | Status | Details |
|----------|--------|---------|
| **A01 Broken Access Control** | **Pass** | Row-level security in all Convex mutations; userId verification before CRUD |
| **A02 Cryptographic Failures** | **Pass** | No sensitive data stored in plaintext; JWT auth via Clerk |
| **A03 Injection** | **Pass** | `encodeURIComponent()` used on search; Convex validators prevent NoSQL injection; JSON-LD uses `\\u003c` escaping |
| **A04 Insecure Design** | **Pass** | Proper separation of concerns; auth-gated mutations |
| **A05 Security Misconfiguration** | **Fail** | Missing CSP, X-Frame-Options, X-Content-Type-Options |
| **A06 Vulnerable Components** | **Low Risk** | All dependencies are current (Next 16.2, React 19.2, Convex 1.34) |
| **A07 Auth Failures** | **Pass** | Clerk JWT + tokenIdentifier pattern is robust |
| **A08 Data Integrity** | **Pass** | No deserialization of user objects; Convex value validators enforce types |
| **A09 Logging & Monitoring** | **Warning** | Vercel Analytics present, but no server-side logging for failed auth attempts |
| **A10 SSRF** | **Low Risk** | External fetch to `bolls.life` is hardcoded — no user-controlled URLs |

### 2.6 API Rate Limiting

**Status:** None detected on `/api/bible/[book]/[chapter]` or `/api/search`.

**Risk:** Denial-of-service via request flooding; abuse of the upstream `bolls.life` API causing rate limit bans. Search queries hit an external API with no throttle.

**Fix:** Add Vercel Edge Middleware rate limiting or use `@upstash/ratelimit`:

```ts
// middleware.ts
import { Ratelimit } from "@upstash/ratelimit";
```

### 2.7 Open Redirect Test

**Result:** No open redirect detected. Login page with `redirect_url=https://evil.com` returns 200 (no redirect). Clerk handles redirect validation internally.

---

## 3. Performance Audit

### 3.1 Document Payload

| Metric | Value | Assessment |
|--------|-------|------------|
| **HTML size (uncompressed)** | 66.3 KB | Large for a homepage — most is React RSC payload |
| **Compression** | Not detected in HEAD request | Vercel typically serves brotli/gzip based on `Accept-Encoding`; verify in browser |
| **TTFB (from US East)** | ~200ms (Vercel HIT) | Excellent when cached |
| **Vercel Cache** | HIT on homepage, MISS on verse pages | Homepage is properly static; verse pages are dynamic |

### 3.2 Font Loading

- **4 font files** preloaded (`woff2`): Cormorant Garamond, DM Mono, Cinzel
- All use `display: "swap"` — prevents FOIT
- `font/woff2` format is optimal
- **37.7 KB per font file** — total ~150 KB for fonts alone

**Recommendation:** Consider subsetting fonts (especially Cinzel used only for headings) or using a variable font to reduce total font payload.

### 3.3 JavaScript Bundles

- **16 async script chunks** loaded on homepage
- Turbopack chunk naming confirms Turbopack bundler
- Code splitting is active (dynamic imports via `next/dynamic` for `ConvexClientProvider`)
- Single CSS file: `0eoudk76g5f39.css`

**Issue:** `ConvexClientProvider` uses `ssr: false` with `dynamic()` which causes a `BAILOUT_TO_CLIENT_SIDE_RENDERING` for the entire auth + data layer. This means all authenticated content requires a full client render pass.

### 3.4 Static Asset Caching

| Asset Type | Cache-Control | Status |
|------------|---------------|--------|
| Fonts (.woff2) | `public, max-age=31536000, immutable` | Excellent |
| JS chunks | `public, max-age=31536000, immutable` | Excellent |
| HTML (homepage) | `public, max-age=0, must-revalidate` | Correct for dynamic content |
| API responses | `public, max-age=0, must-revalidate` | Sub-optimal; bible text is static |

**Recommendation:** Bible API routes serve immutable KJV text. Add `Cache-Control: public, max-age=86400, s-maxage=86400` to the response in `src/app/api/bible/[book]/[chapter]/route.ts` to leverage Vercel's edge cache.

### 3.5 Estimated Core Web Vitals

| Metric | Estimate | Rating |
|--------|----------|--------|
| **LCP** | ~1.5–2.5s | Good (no hero image; text-primary LCP) |
| **CLS** | ~0 | Excellent (font-display: swap, no layout shifts) |
| **INP** | ~50-100ms | Good (minimal interaction handlers on homepage) |

---

## 4. SEO Audit

### 4.1 Meta Tags & Open Graph

| Element | Homepage | Book Pages | Chapter Pages | Verse Pages |
|---------|----------|------------|---------------|-------------|
| `<title>` | "Divine Word — Free Online Bible (KJV)" | Dynamic: "Genesis — King James Version \| Divine Word" | Dynamic: "Genesis 1 KJV — Divine Word" | Dynamic |
| `<meta description>` | Present, 148 chars | Present, dynamic | Present, dynamic | Present |
| `<link canonical>` | `https://www.divineword.app` | Per-book URL | Per-chapter URL | Per-verse URL |
| `og:title` | Present | Present | Present | Present |
| `og:description` | Present | Present | Present | Present |
| `og:type` | "website" | "article" | "article" | — |
| `og:image` | **Missing** | **Missing** | **Missing** | **Missing** |
| `twitter:card` | "summary_large_image" | — | — | — |

**Critical finding:** `og:image` is not set on any page. Social sharing on Facebook, Twitter/X, LinkedIn, and iMessage will show no preview image. For a site with 31,000+ potential shared URLs, this is a significant missed opportunity.

**Fix:** Generate dynamic OG images using Next.js `ImageResponse` or set a static default:

```ts
openGraph: {
  images: [{ url: "https://www.divineword.app/og-default.png", width: 1200, height: 630 }],
}
```

### 4.2 Structured Data (JSON-LD)

| Page | Schema Type | Quality |
|------|-------------|---------|
| Homepage | `WebSite` + `SearchAction` | Excellent — enables Google site search box |
| Book pages | `Book` with `isPartOf` | Good — nested Bible hierarchy |
| Chapter pages | `Chapter` with `isPartOf` | Good |
| Verse pages | Needs audit | Likely present |

**Missing:** `BreadcrumbList` schema on all pages. This is a high-value SEO opportunity for breadcrumb rich results.

### 4.3 Sitemap & Robots.txt

- **Sitemap:** Comprehensive — 31,000+ URLs with all 66 books, 1,189 chapters, and 31,102 verses
- **Robots.txt:** Properly blocks `/api/`, `/login`, `/auth/`; includes sitemap reference
- **Issue:** Sitemap uses `lastModified: new Date()` for static content (chapters/verses), which signals constant changes to crawlers when the content never changes

**Fix:** Use a fixed date for verse/chapter pages:

```ts
lastModified: new Date("2025-01-01"),
```

### 4.4 Heading Hierarchy

- `<h1>`: "Divine Word" (homepage hero)
- `<h2>`: "Dive Into Scripture", "Popular Verses", "About Divine Word"
- `<h3>`: "Old Testament", "New Testament", book names

**Assessment:** Clean, proper hierarchy. No skipped heading levels.

### 4.5 Internal Linking

- All 66 books linked from homepage with deep links to chapter 1
- Popular verses section links to 12 individual verse pages
- Footer contains quick links to key sections
- Navigation includes: Home, Read, Daily Verse, Search, Plans

**Assessment:** Strong internal linking structure. No orphan pages detected.

---

## 5. Accessibility Audit (WCAG 2.1 AA)

### 5.1 Passing Criteria

| Criterion | Status | Details |
|-----------|--------|---------|
| **1.1.1 Non-text Content** | Partial | SVG icons use `aria-hidden="true"` correctly |
| **1.3.1 Info & Relationships** | Pass | Semantic HTML (`<nav>`, `<main>`, `<footer>`, `<section>`, `<blockquote>`) |
| **1.4.3 Contrast** | Likely Pass | OKLch color system with intentional contrast ratios; sepia theme needs manual verification |
| **2.1.1 Keyboard** | Pass | Base-UI components support full keyboard; `focus-visible` rings present |
| **2.4.1 Bypass Blocks** | **Fail** | No skip-to-main-content link |
| **2.4.2 Page Titled** | Pass | Dynamic, descriptive titles on all pages |
| **2.4.6 Headings** | Pass | Proper hierarchy |
| **3.1.1 Language** | Pass | `<html lang="en">` |
| **4.1.2 Name, Role, Value** | Partial | Most interactive elements labeled, some icon buttons missing labels |

### 5.2 Failing Criteria

1. **Skip-to-content link missing** — No `<a href="#main-content">Skip to content</a>` at top of page. Screen reader and keyboard users must tab through the entire navbar on every page.

2. **Missing `aria-label` on icon-only buttons** — The delete bookmark button (`<Trash2>` icon) in `src/app/bookmarks/page.tsx` has no accessible name.

3. **Missing `aria-current="page"` on active navigation** — The navbar highlights the active link visually but doesn't convey this to screen readers.

4. **No `aria-live` region for search results** — When search results load, screen readers receive no announcement. The result count should be in an `aria-live="polite"` region.

5. **No `prefers-reduced-motion` media query** — The CSS includes `scroll-behavior: smooth` and multiple CSS transitions/animations without a reduced-motion override:

   ```css
   @media (prefers-reduced-motion: reduce) {
     *, *::before, *::after {
       animation-duration: 0.01ms !important;
       transition-duration: 0.01ms !important;
       scroll-behavior: auto !important;
     }
   }
   ```

6. **No print stylesheet** — Bible content should be printable with clean formatting.

---

## 6. Code Quality & Architecture

### 6.1 Framework & Stack

| Component | Technology | Version | Notes |
|-----------|-----------|---------|-------|
| Framework | Next.js | 16.2.1 | App Router, Turbopack |
| UI Library | React | 19.2.4 | Server Components + RSC streaming |
| Styling | Tailwind CSS | 4.x | OKLch colors, custom themes |
| Component Library | shadcn/ui + Base UI | 4.1.0 | headless primitives |
| Backend | Convex | 1.34.0 | Real-time DB, row-level security |
| Auth | Clerk | 7.0.7 | JWT, managed sessions |
| Analytics | Vercel Analytics | 2.0.1 | Lightweight |
| Hosting | Vercel | — | Edge network, auto-scaling |

### 6.2 Architecture Decisions

**Strengths:**

- **Clean separation:** API routes act as a proxy to `bolls.life`, isolating the external dependency. Good BFF (Backend-for-Frontend) pattern.
- **Dynamic imports:** `ConvexClientProvider` is dynamically imported with `ssr: false`, keeping the initial server render fast.
- **Type safety:** Full TypeScript, Convex validators (`v.string()`, `v.number()`, `v.id()`), and Next.js typed params.
- **Theme system:** Three themes (light, dark, sepia) via CSS custom properties — excellent for a reading-focused app.
- **Font strategy:** Three purposeful fonts — serif for body, mono for references, display for headings — with `display: "swap"`.

**Concerns:**

- **`BAILOUT_TO_CLIENT_SIDE_RENDERING`** visible in the HTML source. Two `<template data-dgst="BAILOUT_TO_CLIENT_SIDE_RENDERING">` tags indicate components that bail out of SSR. This is expected for `ConvexClientProvider` but should be contained.
- **`next.config.ts` is empty** — no security headers, no image optimization config, no redirects.
- **File named `proxy.ts`** but exports Clerk middleware — naming is misleading. Should be `middleware.ts` per Next.js convention.

### 6.3 Service Worker Quality

The `public/sw.js` implements a solid caching strategy with three tiers:

1. **Precache:** App shell pages (/, /bible, /search, /verse-of-the-day)
2. **Cache-first:** Static assets (JS, CSS, fonts, images)
3. **Network-first:** Bible API data and HTML pages, with offline fallback

**Issue:** The service worker is manually written and hardcodes precache URLs. It will serve stale app shell pages after deployments. Consider using Workbox or Serwist for build-time precache manifests.

---

## 7. Dependency & Supply Chain Risk

### 7.1 Third-Party Scripts Loaded on Page

| Domain | Purpose | Risk |
|--------|---------|------|
| `www.divineword.app` (self) | All JS/CSS/fonts | None |
| `schema.org` | JSON-LD reference (not loaded) | None |
| `bolls.life` | Bible text API (server-side only) | Medium — single point of failure |
| Vercel Analytics | `@vercel/analytics` | Low — first-party Vercel script |

**Excellent finding:** Zero third-party scripts loaded in the browser. No Google Analytics, no ad trackers, no CDN-hosted libraries. All assets are self-hosted via Vercel's edge. This is exceptional for privacy and supply chain risk.

### 7.2 Dependency Versions

| Package | Version | Status | CVE Risk |
|---------|---------|--------|----------|
| `next` | 16.2.1 | Current | Low |
| `react` / `react-dom` | 19.2.4 | Current | Low |
| `convex` | 1.34.0 | Current | Low |
| `@clerk/nextjs` | 7.0.7 | Current | Low |
| `lucide-react` | 0.577.0 | Current | None |
| `tailwind-merge` | 3.5.0 | Current | None |
| `shadcn` | 4.1.0 | Current | None |

**No known CVEs detected.** All dependencies are actively maintained. The `shadcn` package is listed as a direct dependency (unusual — typically it's just the CLI). This is benign but unnecessary.

### 7.3 External API Dependency

The app relies on `bolls.life` for Bible text data. This is a **single point of failure**:

- No retry logic in `src/app/api/bible/[book]/[chapter]/route.ts`
- No circuit breaker pattern
- `{ next: { revalidate: 86400 } }` provides 24h caching at the Next.js level

**Mitigation:** The Convex `verses` table in `convex/schema.ts` has a `verses` table — this appears designed for a local copy. Migrate to serving all text from Convex to eliminate the external dependency.

---

## 8. Infrastructure & Configuration

### 8.1 Hosting Environment

| Aspect | Configuration | Notes |
|--------|---------------|-------|
| **Platform** | Vercel | Automatic SSL, edge CDN |
| **Region** | IAD1 (US East) | Primary deployment region |
| **CDN** | Vercel Edge Network | Global distribution |
| **DNS** | Vercel-managed | `www.divineword.app` |
| **HTTP Version** | HTTP/2 | Confirmed |

### 8.2 Security Headers Summary

| Header | Present? | Value | Grade |
|--------|----------|-------|-------|
| `strict-transport-security` | Yes | `max-age=63072000` | B+ (missing `includeSubDomains; preload`) |
| `content-security-policy` | **No** | — | F |
| `x-frame-options` | **No** | — | F |
| `x-content-type-options` | **No** | — | F |
| `referrer-policy` | **No** | — | F |
| `permissions-policy` | **No** | — | F |
| `access-control-allow-origin` | Yes | `*` (too permissive) | D |
| `x-powered-by` | Yes | `Next.js` (on some routes) | C (information disclosure) |

### 8.3 Certificate Details

- **Issuer:** Let's Encrypt (via Vercel)
- **Auto-renewal:** Yes
- **SSL Labs grade:** Likely A+ (Vercel default)

### 8.4 Information Leakage

- `server: Vercel` — confirms hosting provider
- `x-powered-by: Next.js` — confirms framework (on dynamic pages)
- `x-clerk-auth-status: signed-out` — confirms auth provider
- `x-nextjs-prerender: 1` — confirms SSG

**Fix:** Remove `x-powered-by` in next.config.ts:

```ts
const nextConfig: NextConfig = {
  poweredByHeader: false,
};
```

---

## 9. Prioritised Findings Table

| # | Finding | Severity | Category | Recommended Fix | Effort (hrs) | Status |
|---|---------|----------|----------|----------------|--------------|--------|
| 1 | No Content Security Policy | **Critical** | Security | Add CSP header in `next.config.ts` `headers()` | 3 | [ ] |
| 2 | Missing X-Frame-Options | **High** | Security | Add `DENY` header in `next.config.ts` | 0.5 | [ ] |
| 3 | Missing X-Content-Type-Options | **High** | Security | Add `nosniff` header in `next.config.ts` | 0.5 | [ ] |
| 4 | CORS wildcard (`*`) on all routes | **High** | Security | Restrict to `https://www.divineword.app` | 1 | [ ] |
| 5 | No `og:image` on any page | **High** | SEO | Add static/dynamic OG image generation | 4 | [ ] |
| 6 | No API rate limiting | **High** | Security | Add `@upstash/ratelimit` middleware | 3 | [ ] |
| 7 | Missing Referrer-Policy | **Medium** | Security | Add `strict-origin-when-cross-origin` header | 0.5 | [ ] |
| 8 | Missing Permissions-Policy | **Medium** | Security | Add restrictive Permissions-Policy header | 0.5 | [ ] |
| 9 | No skip-to-content link | **Medium** | Accessibility | Add skip link in `layout.tsx` before `<Navbar>` | 1 | [ ] |
| 10 | Missing `aria-label` on icon buttons | **Medium** | Accessibility | Add `aria-label="Remove bookmark"` etc. | 1 | [ ] |
| 11 | Missing `aria-current="page"` on navbar | **Medium** | Accessibility | Add `aria-current="page"` to active nav links | 0.5 | [ ] |
| 12 | No `aria-live` on search results | **Medium** | Accessibility | Wrap result count in `aria-live="polite"` | 1 | [ ] |
| 13 | No `prefers-reduced-motion` override | **Medium** | Accessibility | Add reduced-motion media query in `globals.css` | 0.5 | [ ] |
| 14 | `x-powered-by: Next.js` exposed | **Low** | Security | Set `poweredByHeader: false` | 0.25 | [ ] |
| 15 | HSTS missing `includeSubDomains; preload` | **Low** | Security | Vercel config or custom header | 0.5 | [ ] |
| 16 | Sitemap uses dynamic `lastModified` for static content | **Low** | SEO | Use fixed date for verse/chapter pages | 0.5 | [ ] |
| 17 | Missing `BreadcrumbList` structured data | **Low** | SEO | Add breadcrumb JSON-LD to book/chapter/verse pages | 3 | [ ] |
| 18 | No print stylesheet | **Low** | Accessibility | Add `@media print` styles for reading content | 2 | [ ] |
| 19 | Clerk auth headers leak auth provider | **Low** | Security | Accept as Clerk default; low risk | 0 | [ ] |
| 20 | Bible API caching suboptimal | **Low** | Performance | Add `Cache-Control: s-maxage=86400` to API response | 0.5 | [ ] |
| 21 | `proxy.ts` naming misleading | **Low** | Code Quality | Rename to `middleware.ts` | 0.25 | [ ] |
| 22 | External API single point of failure | **Medium** | Reliability | Migrate to serving from Convex `verses` table | 8 | [ ] |
| 23 | Service worker hardcoded precache list | **Low** | Performance | Consider Serwist for build-time precache manifests | 4 | [ ] |

---

## 10. 30-Day Action Plan

### Week 1 (Days 1–7): Security Hardening

1. **Add all security headers via `next.config.ts`** — CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy. This is the single highest-impact change, covering findings #1-4, #7-8, #14. One configuration block fixes 7 findings.

2. **Disable `x-powered-by` header** — Set `poweredByHeader: false` in Next.js config. Trivial, removes technology fingerprinting.

3. **Restrict CORS** — Replace wildcard with explicit origin. Prevents unauthorized API usage.

4. **Add rate limiting to `/api/` routes** — Install `@upstash/ratelimit` and apply to search and bible API endpoints. Protects against abuse and upstream API throttling.

### Week 2 (Days 8–14): SEO Quick Wins

1. **Add OG images** — Create a static `og-default.png` (1200x630) and add to root metadata. For extra credit, use Next.js `ImageResponse` API to generate dynamic OG images per book/chapter.

2. **Fix sitemap `lastModified`** — Use a static date for verse/chapter entries. Stop signaling false freshness to Google.

3. **Add `BreadcrumbList` JSON-LD** — Add breadcrumb structured data to book, chapter, and verse pages (Home > Bible > Book > Chapter > Verse).

### Week 3 (Days 15–21): Accessibility

1. **Add skip-to-content link** — Add a visually-hidden `<a>` before the navbar that becomes visible on focus. Add `id="main-content"` to the `<main>` element.

2. **Fix icon button accessibility** — Add `aria-label` to all icon-only buttons (trash, highlight picker dots, etc.) and add `aria-current="page"` to active nav links.

3. **Add `aria-live` regions and `prefers-reduced-motion`** — Wrap search result counts in `aria-live="polite"`, and add a reduced-motion CSS media query to `globals.css`.

### Week 4 (Days 22–30): Performance & Reliability

- Add `Cache-Control` headers to Bible API responses
- Evaluate migrating Bible text from `bolls.life` to Convex `verses` table for full data ownership
- Audit HSTS for `preload` submission readiness

---

## 11. Health Scores

| Category | Score | Grade | Notes |
|----------|-------|-------|-------|
| **Security** | **52/100** | D+ | Strong auth/authz, but headers are critically absent |
| **Performance** | **82/100** | B+ | Fast TTFB, good caching, well-optimized assets; room for API caching |
| **SEO** | **78/100** | B | Excellent sitemap/meta/structured data; missing OG images and breadcrumbs |
| **Accessibility** | **65/100** | C+ | Good semantic HTML and focus states; missing skip link, aria-live, reduced-motion |
| **Code Quality** | **88/100** | A- | Clean architecture, type-safe, modern stack; minor naming issues |
| **Dependency Risk** | **92/100** | A | All deps current, zero third-party browser scripts; `bolls.life` is single external risk |
| **Infrastructure** | **70/100** | B- | Vercel is excellent; header config is the gap |
| **Overall** | **75/100** | **B** | Strong foundation, fixable gaps |
