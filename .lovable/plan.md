# AutoReach MVP Build Plan

This is a large multi-role app. I'll build it in phases so you can review progress and steer direction. Confirm the plan (or tell me what to change) and I'll start with Phase 1.

## Tech & Foundations
- React + Vite + Tailwind + shadcn (already scaffolded)
- **Lovable Cloud** for auth (email/password), Postgres database, RLS, and storage (vehicle/condition photos)
- Role-based access via a separate `user_roles` table (customer / admin / driver) using a `has_role()` security-definer function
- React Router for all routes; React Query for data fetching
- Mobile-first responsive layouts

## Design System
- Navy `#18468B` primary, bright blue `#3D8FFF` secondary, light grey `#EAEAEA`, charcoal `#333333`
- Montserrat (display) + Inter (body) via Google Fonts
- Rounded cards, blue gradient headers, strong CTAs, custom button variants (`hero`, `cta`), badge variants for booking status
- All colors/gradients/shadows as HSL semantic tokens in `index.css` + `tailwind.config.ts`
- One hero image generated for landing page

## Data Model (Lovable Cloud / Postgres)
Tables: `profiles`, `user_roles`, `vehicles`, `service_centers`, `drivers`, `bookings`, `booking_status_updates`, `feedback`, `customer_crm`.
- Enums: `app_role`, `booking_status` (12 values from spec), `service_category`, `payment_status`, `payment_method`, `lifecycle_status`
- RLS: customers see only their own data; drivers see assigned bookings; admins see all
- Trigger: auto-create `profiles` row + default `customer` role on signup
- Storage bucket `booking-photos` (public read, authenticated write)
- Seed: 1 admin, 1 driver, 1 customer demo account (credentials shown on login page)

## Phased Implementation

### Phase 1 — Foundation (this turn)
1. Enable Lovable Cloud
2. Design system (tokens, fonts, button/card variants)
3. DB schema + RLS + seed data
4. Auth pages (login, signup, password reset) + auth context + role-based route guards
5. Landing page (hero, 3-step process, launch offer, trust badges, CTAs)

### Phase 2 — Customer App
- Customer dashboard (greeting, quick actions, active booking)
- Vehicle management (list + add/edit form)
- Booking wizard (vehicle → category → service center type → addresses → datetime → notes → photos → price estimate → confirmation)
- Track My Vehicle (visual timeline, driver/center info, photos, WhatsApp placeholder)
- Service history + booking/invoice detail
- Feedback form (post-completion)
- Profile page

### Phase 3 — Admin Console
- Dashboard with summary cards (today/pending/in-progress/completed/revenue/profit)
- Bookings table with filters; booking detail/edit (status, driver, center, costs, profit auto-calc, notes)
- Driver management (CRUD + availability)
- Service center management (CRUD)
- Customer CRM list + detail (lifecycle, follow-up date, history)
- Invoice summary screen

### Phase 4 — Driver App
- Driver dashboard (assigned jobs as cards)
- Job detail with status update buttons (6 driver-side statuses), notes, photo upload

### Phase 5 — Polish
- Empty states, loading skeletons, toast notifications
- SEO meta + sitemap
- Final QA pass

## MVP Simplifications (per your spec)
- No real payment gateway — status/method fields only
- No live GPS — address + optional map link field
- WhatsApp = `https://wa.me/...` link placeholders
- Photo uploads via Lovable Cloud storage (real uploads, not mocked)

## Assumptions (tell me if wrong)
- English-only UI for MVP
- LKR (Rs.) currency, no conversion
- Single-tenant; no multi-city filtering needed yet
- Demo seed users use simple passwords like `demo1234` — fine for pilot, change before production

Reply "go" (or with edits) and I'll start Phase 1.