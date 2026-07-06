## Pre-Launch Security Hardening & Account Setup

Here's what I found in the audit and what I'll do to fix it.

### 🔍 Audit Findings

**Good news — no leaked secrets in code:**
- ✅ No hardcoded passwords, emails, or admin credentials anywhere in `src/`
- ✅ Only the Supabase **publishable (anon)** key is in `.env` — safe to ship (it's designed for browser use, and RLS protects the data)
- ✅ No `service_role` key anywhere in the client bundle
- ✅ No stray `console.log` leaks in admin/lib code

**Issues to fix:**
1. ❌ `.env` is **NOT in `.gitignore`** — it will be pushed to GitHub. Even though its contents are publishable, best practice is to keep it local.
2. ❌ `.env` contains a stale `REACT_APP_BACKEND_URL=https://gh-sync-5.preview.emergentagent.com` (leftover from scaffolding — not used anywhere in code, but looks unprofessional in the repo).
3. ❌ No way for the client to change their own password from the admin dashboard.
4. ❌ Current admin account is your test one — needs to be transferred to the client.

---

### 🛠 What I'll Do

**1. Repo hygiene**
- Add `.env` and `.env.local` to `.gitignore`.
- Create `.env.example` with placeholder values so a fresh clone knows what vars to set.
- Remove the stale `REACT_APP_BACKEND_URL` line.

**2. New Admin → Account page** (`/admin/account`)
Add a new route with two sections:
- **Change email** — input new email → calls `supabase.auth.updateUser({ email })` → Supabase sends a confirmation link to the new address.
- **Change password** — current password + new password + confirm → re-authenticates with `signInWithPassword` (to prove ownership) then `supabase.auth.updateUser({ password })`.
- Client-side validation: min 8 chars, mismatch check, "password too weak" warning.
- Add "Account" link to the admin sidebar nav (in `AdminShell.tsx`).

**3. Create the client's admin account**
I'll need you to give me:
- The **client's email address** (the Gmail/business email they'll use to log in).
- A **temporary password** I should set for them (they'll change it on first login via the new Account page).

I'll create the user via Supabase Auth Admin, grant them the `admin` role in `user_roles`, and confirm they can log in. Then you can delete your test account from Supabase Auth once the client confirms access.

**4. Enable leaked-password protection**
Turn on Supabase's HIBP (Have I Been Pwned) check so weak/leaked passwords are rejected at signup and password-change time.

**5. Run the security scanner**
Run the full RLS + policy audit and fix any critical findings before deploy.

---

### ❓ I need from you before I start

1. **Client's login email**?
2. **Temporary password** for the client's first login? (Or should I generate a strong random one and show it to you once?)
3. **Your current test admin email** — so I can delete it after the client's account is confirmed working? (Do NOT paste the password.)
4. Do you want **email confirmation required** for the new admin, or should I mark it confirmed instantly so they can log in right away?

Once you answer, I'll implement everything in one pass.