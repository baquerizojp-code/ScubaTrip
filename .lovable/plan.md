

# ScubaTrip Webapp -- Full Code Review & Recommendations

After reviewing the entire codebase, here is my assessment organized by priority. The app is well-structured overall -- good use of lazy loading, RLS policies, i18n, and a clean component hierarchy. Below are the areas that would have the highest impact on quality, reliability, and user experience.

---

## Critical Issues

### 1. No error handling on data fetches
Multiple pages (`Discover.tsx`, `Explore.tsx`, `TripDetail.tsx`, `MyBookings.tsx`, `DiverProfile.tsx`) use raw `useEffect` + `supabase.from()` calls that silently swallow errors. If a query fails, the user sees either an empty page or an infinite loading state with no feedback.

**Recommendation**: Migrate these to `useQuery` from TanStack Query (already installed and used in admin pages). This gives you automatic retries, error states, loading states, and cache invalidation for free. The admin pages already follow this pattern well.

### 2. Duplicated trip card component
The trip card rendering is copy-pasted across `Explore.tsx` and `Discover.tsx` (lines are nearly identical). Same for trip detail rendering between `ExploreTrip.tsx` and `TripDetail.tsx`.

**Recommendation**: Extract a `<TripCard />` component and a shared trip detail layout. This prevents divergence and reduces maintenance burden.

### 3. Missing `aria-label` on icon-only buttons
Several icon-only buttons lack accessible names: the Globe button in `DiverLayout.tsx` (line 31), the LogOut button (line 34), the Menu hamburger in `AdminLayout.tsx` (line 92), and the cancel X buttons in `MyBookings.tsx`. This is the same class of issue flagged in the earlier SEO audit.

**Recommendation**: Add `aria-label` to every icon-only `<Button>` across layouts and pages.

---

## Architecture & Code Quality

### 4. i18n system is a single massive file
`i18n.ts` is 519+ lines and growing. Every new feature adds more keys inline.

**Recommendation**: Split translations into separate JSON files per locale (`es.json`, `en.json`) and load them dynamically. This also opens the door to adding more languages later. For now, even just splitting the object into `const es = {...}` and `const en = {...}` in separate files would help.

### 5. Inconsistent toast usage
Some pages use `toast` from `sonner` directly, others use `useToast` from the shadcn hook. This creates two parallel toast systems.

**Recommendation**: Pick one and standardize. The shadcn `useToast` is more flexible for structured toasts; sonner is simpler. Either works, but be consistent.

### 6. `as any` type casts scattered throughout
Files like `AdminSettings.tsx`, `TripDetail.tsx`, and `MyBookings.tsx` use `as any` to work around type mismatches with the Supabase-generated types. This hides real bugs.

**Recommendation**: When the generated types don't match your schema, the fix is to update the schema/migration so the types regenerate correctly, rather than casting.

---

## UX Improvements

### 7. No search or filtering on Discover/Explore
Divers see a flat chronological list of all trips. As trip volume grows, this becomes unusable.

**Recommendation**: Add location-based filtering, date range picker, and difficulty/certification filters. This is likely the single highest-impact UX feature to build next.

### 8. No loading/empty states after profile creation from popup
After the new profile completion dialog creates a profile and booking, the `TripDetail` page doesn't refresh its local state to reflect the booking was made. The user might need to navigate away and back.

**Recommendation**: After `handleCompleteProfileAndBook`, refetch the booking state (similar to how `insertBooking` already does `setExistingBooking`). This is already partially handled but worth verifying end-to-end.

### 9. No confirmation before deleting trips (uses `window.confirm`)
`AdminTrips.tsx` line 220 uses `confirm()` which is a browser native dialog -- ugly and not translatable.

**Recommendation**: Replace with the existing `AlertDialog` component (already used elsewhere in the app) for a consistent, branded experience.

### 10. No pull-to-refresh or realtime updates on diver pages
The diver Discover and MyBookings pages fetch data once on mount. If a booking status changes (confirmed by admin), the diver won't see it until they refresh.

**Recommendation**: Either add realtime subscriptions (like NotificationBell already does) or use `useQuery` with a reasonable `refetchInterval` (e.g. 30 seconds).

---

## Performance

### 11. Source maps in production (just added)
The recent `sourcemap: true` change exposes your source code to anyone who opens DevTools. This is a security/IP concern.

**Recommendation**: Use `sourcemap: 'hidden'` instead. This generates `.map` files for error tracking services but doesn't expose them via the browser's DevTools. Lighthouse will still pass the audit.

### 12. Hero image not optimized
The hero image (`hero-ocean.jpg`) is loaded eagerly at full resolution. On mobile, this can be 2-5MB.

**Recommendation**: Provide responsive `srcSet` sizes or convert to WebP/AVIF format. Even just adding `width` and `height` attributes would help with CLS (Cumulative Layout Shift).

---

## Security

### 13. `Remember Me` implementation is non-standard
In `Login.tsx`, the "Remember Me" logic tries to move sessions between `localStorage` and `sessionStorage` manually (lines 42-54). This is fragile and can lead to broken auth states.

**Recommendation**: Supabase sessions already persist by default. A simpler approach: if `rememberMe` is false, call `signOut()` on the `beforeunload` event. Or just remove the feature -- most users expect to stay logged in on their own devices.

### 14. The `ProtectedRoute` role check uses string comparison without type safety
Line 34: `allowedRoles.includes(role)` where `allowedRoles` is `string[]` but `role` is `AppRole | null`. This works but loses type safety.

**Recommendation**: Type `allowedRoles` as `AppRole[]` to catch mismatches at compile time.

---

## Summary of Recommended Action Items (ordered by impact)

1. **Extract shared components** -- TripCard, trip detail layout (reduces duplication, prevents bugs)
2. **Add search/filters to Discover** (biggest UX win for divers)
3. **Migrate diver pages to useQuery** (error handling, retries, cache)
4. **Fix all missing aria-labels** (accessibility compliance)
5. **Standardize toast system** (consistency)
6. **Change sourcemap to 'hidden'** (security)
7. **Replace window.confirm with AlertDialog** (polished UX)
8. **Split i18n into separate locale files** (maintainability)
9. **Add realtime or polling to diver booking pages** (live updates)
10. **Optimize hero image** (performance)

