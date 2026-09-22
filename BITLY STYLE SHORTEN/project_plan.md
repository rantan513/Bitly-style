# Linkly — URL Shortener & Link Analytics

## 1. Project Description
A branded URL shortener with rich click analytics for marketers, creators, and businesses. Users paste a long URL, get a short link, share it, and see detailed analytics: location, device, browser, referrer, bot detection — visualized in a beautiful dashboard.

## 2. Page Structure
- `/` — Marketing landing page
- `/login` — Login
- `/signup` — Sign up (with optional OTP verify)
- `/dashboard` — User dashboard (links list + create link)
- `/dashboard/links/:id` — Per-link analytics
- `/dashboard/compare` — Compare two links
- `/dashboard/settings` — Account settings
- `/r/:slug` — Redirect page (tracks click, redirects to destination)

## 3. Core Features
- [ ] Marketing landing page (hero, features, analytics preview, pricing, FAQ, CTA, footer)
- [ ] Email/password auth + optional OTP verification
- [ ] Create/edit/delete/toggle/bulk-delete short links
- [x] Custom slug + title when creating a link (expiration date still pending)
- [ ] Copy-to-clipboard + client-side QR code
- [ ] Redirect edge function with:
  - IP extraction (multi-header fallback + private-IP skip)
  - Geolocation consensus across 3 APIs (ipinfo, ipapi, ipwho)
  - User agent parsing (device, OS, browser, model)
  - Bot detection (UA patterns + hosting/proxy ISP + heuristics)
- [ ] De-dup via sessionStorage
- [x] Per-link analytics dashboard: trend chart, top locations, devices, browsers, referrers (world map + click history pending)
- [ ] Compare mode (two links side-by-side)
- [ ] Search / sort / filter links

## 4. Data Model
### Table: `links`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| user_id | uuid FK auth.users | |
| slug | text unique | short code |
| destination_url | text | |
| title | text | optional |
| active | bool | default true |
| expires_at | timestamptz | nullable |
| total_clicks | int | default 0 |
| created_at | timestamptz | |

### Table: `clicks`
| Field | Type | Notes |
|---|---|---|
| id | uuid PK | |
| link_id | uuid FK links | |
| ip_address | text | |
| country / city / region | text | |
| device | text | Mobile/Desktop/Tablet |
| device_model | text | |
| browser | text | |
| os | text | |
| referrer | text | |
| user_agent | text | |
| latitude / longitude | numeric | |
| is_bot | bool | |
| isp | text | |
| is_hosting / is_proxy | bool | |
| clicked_at | timestamptz | |

RLS: each user can only see their own links and their links' clicks. Redirect edge function uses service role.

## 5. Backend / Integrations
- Database: **connected — Readdy Backend** (`links` + `clicks` tables, RLS policies, `increment_link_clicks` RPC created)
- No Shopify / Stripe / payments needed for MVP

## 6. Development Phase Plan

### Phase 1: Marketing landing page ← current
- Goal: Ship a polished, on-brand marketing homepage
- Deliverable: `/` with hero, features grid, analytics preview, pricing, FAQ, CTA, footer

### Phase 2: Backend + Auth
- Connect Readdy Backend or SaaS Supabase
- Create `links` + `clicks` tables + RLS + RPC increment function
- Build login / signup / OTP pages

### Phase 3: Dashboard + link CRUD
- Create link (with custom slug + title), list, search/sort/filter, edit, toggle, delete, QR modal, copy

### Phase 4: Redirect + click tracking edge function
- `/r/:slug` page + `redirect-link` edge function with geo/UA/bot detection

### Phase 5: Analytics dashboard
- Per-link charts (trend, locations, devices, browsers, referrers), world map, click history, compare mode

### Phase 6: Polish
- Dark mode, animations, settings page, seed demo data