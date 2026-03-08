

## Plan: Dive Center Registration with Google/Apple + Simplified Flow

### Current State
- `RegisterCenter.tsx` combines account creation (email/password) AND center setup (name, description, WhatsApp) in one form
- `CompleteProfile.tsx` only handles diver role setup
- Login/Signup pages already have Google/Apple OAuth buttons
- After OAuth signup, users go to `/complete-profile` which only offers diver path

### New Flow

**Registration page (`/register-center`):**
1. Show Google, Apple, and email/password signup options (same as diver signup)
2. After account creation, redirect to a new **center setup step** that asks only:
   - Center name (required)
   - WhatsApp number with country code (required)
3. On submit: create role `dive_center_admin`, create `dive_centers` row, create `staff_members` row, redirect to `/admin`

**Login page (`/login`):**
- Already works for all users (Google/Apple/email) — no changes needed. Centers log in the same way as divers.

### Changes

#### 1. Refactor `RegisterCenter.tsx`
- **Step 1 (Account creation)**: Show Google/Apple buttons + email/password form (reuse pattern from `Signup.tsx`)
- **Step 2 (Center setup)**: After auth, show a simple form with center name + WhatsApp (with country code placeholder). Remove description field (moved to Settings).
- Use internal state to track which step the user is on
- If user arrives already authenticated (no role), skip to step 2

#### 2. Update `CompleteProfile.tsx`
- No changes needed — this page is for divers only, and center users go through `/register-center`

#### 3. Update Auth redirect logic
- In `AuthContext` / `ProtectedRoute`: users with no role arriving from OAuth get sent to `/complete-profile` (diver) as before. The `/register-center` page handles its own OAuth flow with a query param or localStorage flag to distinguish center signups.
- Add a `localStorage` flag `pending_center_signup` set before OAuth redirect, checked on return to route back to `/register-center` step 2

#### 4. Admin Settings page
- Already has name, description, WhatsApp fields — no changes needed. Description gets filled in here later.

### Technical Details

- OAuth flow: set `localStorage.setItem('pending_center_signup', 'true')` before calling `lovable.auth.signInWithOAuth()`, then in the auth state change or on the landing page redirect, check this flag and route to `/register-center`
- The redirect check should be added to the root `/` page or the `CompleteProfile` page — if `pending_center_signup` flag exists and user has no role, redirect to `/register-center` instead of `/complete-profile`
- WhatsApp input: use a text input with placeholder showing country code format like `+52 998 123 4567`

