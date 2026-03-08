

## Plan: Fix Post-Signup Redirect + Save Profile Data Once

### Problem
1. After signing up from a trip page (`/explore/:id` → `/signup?redirect=/app/trip/:id`), the user goes to `/complete-profile` but after completing it, they're redirected to `/app/discover` instead of back to the trip.
2. The name and certification collected in `/complete-profile` are already saved to `diver_profiles`, but the redirect doesn't preserve the original trip URL.

### Root Cause
- `Signup.tsx` line 32: when user exists but has no role, it navigates to `/complete-profile` **without passing the `from` state**.
- `CompleteProfile.tsx` line 75: after profile creation, it hard-redirects to `/app/discover` without checking for any pending redirect.

### Changes

#### 1. `src/pages/Signup.tsx`
- Pass the `from` (redirect) value to `/complete-profile` via route state:
  ```
  navigate('/complete-profile', { replace: true, state: { from } });
  ```
- Also store the redirect in `localStorage` (e.g., `pending_redirect`) before OAuth calls so it survives the OAuth redirect flow.

#### 2. `src/pages/CompleteProfile.tsx`
- Read the `from` value from `location.state` or `localStorage.getItem('pending_redirect')`.
- After successful profile creation, redirect to `from` (if it exists) instead of `/app/discover`.
- Clean up the `pending_redirect` localStorage key after use.
- Also update the role-based redirect in the `useEffect` (line 32) to respect pending redirect when role is already `diver`.

#### 3. `src/pages/ExploreTrip.tsx`
- Before redirecting to signup, also store the redirect URL in `localStorage('pending_redirect')` so it persists through OAuth flows.

### Files to Change
1. `src/pages/Signup.tsx` — pass redirect state to complete-profile + store in localStorage for OAuth
2. `src/pages/CompleteProfile.tsx` — read redirect from state/localStorage, use it after profile creation
3. `src/pages/ExploreTrip.tsx` — store pending redirect in localStorage

