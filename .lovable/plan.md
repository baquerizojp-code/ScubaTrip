

## Plan: Replace Logo SVG Throughout the Webapp

### What the reference images show

The uploaded images depict a **scuba dive mask inside a location pin** — a rounded pin outline forms the outer shape, with the mask (two lenses, nose bridge, and side straps) centered inside. One version is dark on white, the other white on dark. The design is bolder and more detailed than the current SVG, with:
- A **full circular arc** at the top (the strap/pin top)
- Two **goggle lenses** with visible inner reflections/curves
- A **nose piece** with a triangular shape
- **Side straps** extending from the mask to the pin edges
- The pin **narrows to a point** at the bottom with a small circle beneath

### Changes

**1. Rewrite `src/components/ScubaMaskLogo.tsx`**
- Recreate the logo as a detailed SVG that closely matches the reference images
- Keep using `currentColor` for stroke/fill so it adapts to context (white on dark backgrounds, dark on light)
- Increase the viewBox to accommodate the more detailed design (~100x120)
- All paths: pin outline, mask lenses, nose bridge, side straps, bottom dot

**2. Replace logo in all 8 locations across the app**

| File | Current | Change |
|------|---------|--------|
| `Navbar.tsx` | `ScubaMaskLogo` + "ScubaTrip" | Already uses it — just ensure consistent sizing |
| `AdminLayout.tsx` (sidebar) | `Ship` icon + "Scuba Planner" | Replace `Ship` with `ScubaMaskLogo` |
| `AdminLayout.tsx` (mobile header) | "Scuba Planner" text only | Add `ScubaMaskLogo` before text |
| `DiverLayout.tsx` | "Scuba Planner" text only | Add `ScubaMaskLogo` before text |
| `Login.tsx` | `Waves` icon in circle + "Scuba Planner" | Replace `Waves` with `ScubaMaskLogo` |
| `Signup.tsx` | `Waves` icon in circle + "Scuba Planner" | Replace `Waves` with `ScubaMaskLogo` |
| `ForgotPassword.tsx` | `Waves` icon in circle + "Scuba Planner" | Replace `Waves` with `ScubaMaskLogo` |
| `ResetPassword.tsx` | `Waves` icon in circle + "Scuba Planner" | Replace `Waves` with `ScubaMaskLogo` |
| `RegisterCenter.tsx` | `Waves` icon in circle + "Scuba Planner" | Replace `Waves` with `ScubaMaskLogo` |
| `Landing.tsx` (footer) | "Scuba Planner" text | Add logo + unify brand name |

**3. Unify brand name** — Replace all "Scuba Planner" references with "ScubaTrip" to match the Navbar branding.

### Context-appropriate variants
- **Dark backgrounds** (Navbar, hero, ocean-900 sections): white logo via `text-primary-foreground`
- **Light backgrounds** (auth pages, admin sidebar, diver header): dark logo via `text-foreground` or `text-primary`

### Files modified
- `src/components/ScubaMaskLogo.tsx` — complete SVG rewrite
- `src/components/AdminLayout.tsx` — import + use logo
- `src/components/DiverLayout.tsx` — import + use logo
- `src/pages/Login.tsx` — replace Waves icon
- `src/pages/Signup.tsx` — replace Waves icon
- `src/pages/ForgotPassword.tsx` — replace Waves icon
- `src/pages/ResetPassword.tsx` — replace Waves icon
- `src/pages/RegisterCenter.tsx` — replace Waves icon
- `src/pages/Landing.tsx` — add logo to footer

