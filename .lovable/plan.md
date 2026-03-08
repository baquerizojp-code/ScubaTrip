

## Plan: Landing Page Rebrand — Deep Ocean Navy + Electric Cyan

This is a significant visual overhaul touching colors, layout, navbar behavior, CTAs, and the logo icon. Here's the breakdown:

### 1. Color Palette (CSS variables in `src/index.css`)

- Add new CSS custom properties for the three brand colors:
  - `--cyan-electric: 187 100% 50%` (approx #00E5FF)
  - `--coral-red: 0 100% 70%` (approx #FF6B6B)
- Update `--ocean-900` to match Deep Ocean Navy (#0A1B2A → `205 60% 10%`)
- Add Tailwind color mappings in `tailwind.config.ts` for `cyan-electric` and `coral`

### 2. Navbar — Transparent on Load, Solid on Scroll (`src/components/Navbar.tsx`)

- Add scroll state with `useState` + `useEffect` listening to `window.scroll`
- Default: `bg-transparent`, white text/icons, no border
- On scroll (>20px): add `bg-[#0A1B2A]/90 backdrop-blur-md border-b border-white/10` transition
- Logo text: white always (on landing). Icon container: transparent bg with white icon
- "Comenzar" button: add `min-h-[44px] min-w-[44px]` for touch target compliance
- Accept an optional `transparent` prop so it only goes transparent on the Landing page

### 3. Hero Section Updates (`src/pages/Landing.tsx`)

- **Gradient overlay**: strengthen the gradient behind hero text — use `bg-gradient-to-t from-[#0A1B2A] via-[#0A1B2A]/70 to-transparent`
- **Primary CTA**: change "Explorar Inmersiones" to Electric Cyan bg (`bg-[#00E5FF] text-[#0A1B2A]`) with hover darken
- **Secondary CTA**: convert "Soy Centro de Buceo" link to a ghost button — `border border-white/60 text-white bg-transparent hover:bg-white/10 rounded-md px-4 py-2`
- **Viewport optimization**: reduce `pt-24` to `pt-16` on mobile, reduce `pb-16` to `pb-12` to push content higher and keep CTA above the fold
- **Bottom CTA section**: also update primary button to Electric Cyan, secondary link to ghost button style

### 4. Logo SVG Component (`src/components/ScubaMaskLogo.tsx`)

- Create a new SVG component: a minimalist scuba mask outline where the top frame forms a map location pin shape
- Single-color, flat, white fill/stroke
- Replace `<Waves>` icon in Navbar with this new component

### 5. Sections Below Hero

- Features section and Steps section keep their current light background — no changes needed there (the new palette is primarily for the hero/CTA/navbar/footer which are dark)
- Footer: update `bg-ocean-900` to use the new Deep Ocean Navy

### Files Modified
- `src/index.css` — new CSS variables
- `tailwind.config.ts` — new color tokens
- `src/components/ScubaMaskLogo.tsx` — new file (SVG logo)
- `src/components/Navbar.tsx` — transparent-on-scroll behavior, new logo, touch targets
- `src/pages/Landing.tsx` — hero gradient, CTA colors, ghost button, viewport tuning

