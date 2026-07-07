## Goal
Centralize contact info (phone, email, address, social links) so the admin can edit them once and every page reflects the change.

## What lives where today (hardcoded)
- `src/components/site/Footer.tsx` — social links (Instagram, LinkedIn, X, YouTube) all set to `#`
- `src/routes/contact.tsx` — phone `+91 11 0000 0000`, email `private@southdelhi.estate`, address `Aurangzeb Road, New Delhi`
- Likely also referenced in `Navbar`, `ContactSection`, `CtaBanner` (will audit during build)

## Plan

### 1. Database (Lovable Cloud migration)
Create `public.site_contact` — a single-row settings table:
- `id` (fixed uuid, singleton)
- `phone`, `email`, `address` (text)
- `instagram_url`, `linkedin_url`, `twitter_url`, `youtube_url` (text, nullable)
- `updated_at`
- Grants: `SELECT` to `anon` + `authenticated` (public read), `UPDATE` to `authenticated` gated by `has_role(auth.uid(),'admin')`
- RLS policies for public read + admin write
- Seed one row with current values

### 2. API layer
Add to `src/lib/api.ts`:
- `getSiteContact()` — public read
- `updateSiteContact(payload)` — admin update

### 3. Shared hook
`src/lib/useSiteContact.ts` — React Query hook (`['site-contact']`) used by Navbar, Footer, Contact page, and any other component with contact info.

### 4. Admin UI
New route `src/routes/admin/contact.tsx`:
- Form with phone, email, address, and 4 social URL fields
- Save button → `updateSiteContact` → invalidate `['site-contact']`
- Add nav entry in `AdminShell` sidebar

### 5. Replace hardcoded values
- `Footer.tsx` — SOCIALS array pulls from hook; hide icons whose URL is empty
- `contact.tsx` — phone/email/address bound to hook values
- Audit `Navbar`, `ContactSection`, `CtaBanner` and swap any hardcoded contact strings

### 6. Verify
Run Playwright: load `/`, `/contact`, admin edits a field, reload public pages, confirm change appears everywhere.

## Notes
- Single-row pattern keeps queries trivial and cacheable.
- Empty social URL → icon hidden (avoids dead `#` links).
- No changes to auth or existing tables.
