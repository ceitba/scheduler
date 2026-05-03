# Editorial UI System
### A design + implementation guide for warm, content-first SPAs

This document captures every UI decision made in a production student newsletter
SPA and explains the *why* behind each one. It is written as a direct brief for
an AI agent starting a new project that should feel similar: editorial, human,
warm — not a SaaS dashboard.

---

## 1. Aesthetic philosophy

### The target feeling

> "A university bulletin meets a well-designed web magazine."
> Think Substack editorial + printed student paper. Not a startup landing page,
> not a B2B dashboard, not a portfolio site.

This distinction drives every decision below. Content is the hero. Typography
does the heavy lifting. Color is used for meaning, not decoration.

### Three rules to keep on the wall

1. **Density with breathing room.** Pack information, but give it space. Section
   padding is generous. Card gaps are consistent. Never let the page feel empty,
   but never let it feel cluttered.

2. **Type over decoration.** When in doubt, solve with better type. A strong
   Fraunces headline communicates more than any icon or gradient ever could.

3. **Warmth through restraint.** The palette is cool (deep blue) with a single
   warm accent (amber). Using amber sparingly — for highlights, active states,
   dots — makes it feel intentional rather than noisy.

---

## 2. Color system

### Palette

| Token | Hex | Usage |
|---|---|---|
| `primary` | `#1A3C6E` | Brand color. Buttons, active nav, headings on hover, dark backgrounds |
| `primary-900` | `#091633` | Admin sidebar, dark footer |
| `primary-50` | `#EEF3FA` | Hover backgrounds, tag backgrounds |
| `accent` | `#F5A623` | Active indicators, highlights, CTAs that need warmth |
| `accent-50` | `#FEF8EC` | Tag backgrounds, light highlights |
| `surface` | `#FAFAF8` | Page background — **not pure white** |
| `ink-primary` | `#1C1C1E` | All body text, headlines |
| `ink-secondary` | `#6B7280` | Metadata, captions, secondary labels |
| `border` | `#E5E7EB` | All dividers, card borders, input borders |

### The off-white rule

`#FAFAF8` instead of `#FFFFFF` as the page background. The slight warmth (a
whisper of yellow) makes the page feel like paper rather than a screen. Pure
white against cards also looks flat — the slight contrast between `surface` and
`bg-white` card gives depth without a heavy shadow.

### Color usage rules

```
Primary uses:
  - Primary buttons: bg-primary text-surface
  - Active nav underline: border-b-2 border-accent
  - Admin sidebar: bg-primary-900
  - Article card hover: text-primary (headline color shift)
  - Focus rings: outline-accent (via *:focus-visible)

Accent uses:
  - Active filter button: bg-primary (not accent — accent is reserved for indicators)
  - Event dot on calendar: bg-accent
  - "Featured" badge secondary indicator
  - Live preview pulse dot: animate-pulse bg-accent
  - Active vote button hover: border-accent

Ink uses:
  - All readable body text: text-ink-primary
  - Dates, authors, meta: text-ink-secondary
  - DO NOT use gray-500 or gray-600 directly — always use ink tokens

Never:
  - Gradients (gradient-to-r, etc.)
  - Purple, neon, or bright secondary colors on backgrounds
  - Text on colored backgrounds (except primary and accent full-opacity buttons)
```

### Category color mapping

When you need per-category color coding (tags, badges), use these Tailwind
pairs. They are deliberately muted — they complement, not compete with, the
primary palette:

```js
const CATEGORY_STYLES = {
  Academic / Académico:  'bg-primary-100 text-primary-700',
  Campus:                'bg-accent-50 text-accent-600',
  Culture / Cultura:     'bg-emerald-50 text-emerald-700',
  Tech / Tecnología:     'bg-violet-50 text-violet-700',
  Sports / Deportes:     'bg-orange-50 text-orange-700',
  General:               'bg-border text-ink-secondary',
}
```

### Shadows

Shadows use the primary color (blue-tinted) rather than gray, tying them to
the brand:

```js
card:       '0 1px 3px rgba(26,60,110,0.08), 0 4px 16px rgba(26,60,110,0.06)'
card-hover: '0 4px 12px rgba(26,60,110,0.12), 0 12px 32px rgba(26,60,110,0.10)'
```

Never use `shadow-md` or Tailwind's default shadows — they are gray and look
generic. Tinted shadows feel intentional.

---

## 3. Typography

### Font stack

| Role | Font | Fallbacks | When to use |
|---|---|---|---|
| `font-display` | Fraunces | Playfair Display, Georgia, serif | All headlines, logotype, page titles, card headings |
| `font-body` | Source Sans 3 | Lato, system-ui, sans-serif | All body text, UI labels, button text |
| `font-mono` | JetBrains Mono | ui-monospace, monospace | Dates, times, category labels, meta info, code |

### Google Fonts import

```html
<link
  href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,600;0,9..144,700;0,9..144,800;1,9..144,300;1,9..144,600&family=Source+Sans+3:wght@300;400;600&family=JetBrains+Mono:wght@400;500&display=swap"
  rel="stylesheet"
/>
```

Load with `rel="preconnect"` on both `fonts.googleapis.com` and
`fonts.gstatic.com` (with `crossorigin`).

### Type scale

```
text-label:   12px / lh 1.4 / ls +0.06em  → dates, tags, mono labels
text-body-sm: 14px / lh 1.7               → captions, secondary text, admin table cells
text-body:    16px / lh 1.7               → all body copy
text-body-lg: 18px / lh 1.7               → page subtitles, lead paragraphs
text-h5:      20px / lh 1.3 / fw 700      → card headlines (secondary)
text-h4:      24px / lh 1.25 / fw 700     → section headings, modal titles
text-h3:      30px / lh 1.2  / fw 700     → page sub-headings
text-h2:      40px / lh 1.15 / fw 800     → featured article titles, section headers
text-h1:      48px / lh 1.1  / fw 800     → page titles on desktop
text-display: 56px / lh 1.05 / fw 800     → hero titles (lg breakpoint only)
```

### Typography rules

**Weight contrast is everything.** Body text at weight 300–400 makes display
text at weight 700–800 feel commanding. Never use 700 for body copy.

**Line height by role:**
- Display/headlines: 1.05–1.3 (tight — they need presence)
- Body text: 1.7 (loose — essential for readability)
- Labels/mono: 1.4 (medium)

**Letter spacing:**
- Mono labels (category tags, uppercase metadata): `tracking-widest` (0.1em) + `uppercase`
- Headlines: default (0)
- Body: default (0)

**Never use Inter or Roboto.** They are neutral workhorses — appropriate for
dashboards, wrong for editorial. The moment you set a headline in Fraunces, the
page has character.

### Practical patterns

```jsx
// Page title
<h1 className="font-display text-h1 lg:text-display font-bold text-ink-primary leading-tight">
  Título de página
</h1>

// Section subheading
<h2 className="font-display text-h3 font-bold text-ink-primary">
  Sección
</h2>

// Card headline (primary)
<h2 className="font-display text-h2 font-bold text-ink-primary leading-tight">
  Artículo destacado
</h2>

// Card headline (secondary grid)
<h3 className="font-display text-h5 font-bold text-ink-primary leading-snug line-clamp-2">
  Artículo secundario
</h3>

// Body paragraph
<p className="font-body text-body text-ink-primary leading-[1.75]">
  Texto del cuerpo…
</p>

// Date / meta label
<time className="font-mono text-label text-ink-secondary">
  28 jul. 2025
</time>

// Category tag
<span className="font-mono text-label uppercase tracking-widest px-2 py-0.5 rounded-sm bg-primary-100 text-primary-700">
  Académico
</span>

// Logotype (navbar brand)
<span className="font-display text-h5 font-bold text-primary tracking-tight">
  ITBA News
</span>
<span className="font-mono text-label text-ink-secondary uppercase tracking-widest">
  Boletín Estudiantil
</span>
```

---

## 4. Spacing and layout

### Content container

Max width 1120px, centered, with responsive horizontal padding:

```jsx
// Add to @layer components in index.css:
.container-content {
  @apply max-w-content mx-auto px-4 sm:px-6 lg:px-8;
}
```

Never exceed 1120px for text content. Reading lines longer than ~75 chars
fatigue the eye.

### Section rhythm

```
Section vertical padding: py-section-mobile (48px) on mobile, py-section (80px) on desktop
Card gap: gap-6 (24px)
Sidebar gap: gap-8 to gap-10 (32–40px)
Form field gap: gap-5 (20px)
Inline meta items: gap-3 or gap-4 (12–16px)
```

### Breakpoints

```
sm:  640px  — single → two column grids, desktop nav appears
lg:  1024px — two column → three column grids, sidebar layouts
xl:  1280px — wider sidebars
```

### Editorial grid pattern

The core layout for article feeds:

```
Desktop:
  ┌─────────────────────────────────────────┐
  │  Featured article (full width)          │
  └─────────────────────────────────────────┘
  ┌───────────┐ ┌───────────┐ ┌───────────┐
  │ Secondary │ │ Secondary │ │ Secondary │
  └───────────┘ └───────────┘ └───────────┘

Mobile:
  Single column, featured first.
```

```jsx
// Featured
<ArticleCard article={featured} featured />

// Secondary grid
<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
  {secondary.map(a => <ArticleCard key={a.id} article={a} />)}
</div>
```

---

## 5. Card patterns

Cards are the primary content unit. Every card follows the same construction rules.

### Anatomy

```
border border-border       ← always, never borderless
rounded-card (6px)         ← consistent, never round, never square
bg-white                   ← white on surface (#FAFAF8), creates subtle lift
shadow-card                ← brand-tinted shadow (not generic gray)
hover:shadow-card-hover    ← transition on hover, not on active
overflow-hidden            ← required for rounded corners on image
```

### Featured article card

```jsx
<article className="rounded-card border border-border bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col lg:flex-row">
  {/* Left: cover media (image or geo fill) — 50% width on desktop */}
  <div className="h-56 lg:h-auto lg:w-1/2 flex-shrink-0">
    {/* image or geometric fill */}
  </div>

  {/* Right: content */}
  <div className="p-6 lg:p-10 flex flex-col justify-between gap-4">
    <div className="flex flex-col gap-3">
      <CategoryBadge />
      <h2 className="font-display text-h2 font-bold">Headline</h2>
      <p className="font-body text-body text-ink-secondary line-clamp-3">Excerpt</p>
    </div>
    <footer className="flex items-center gap-4 pt-2 border-t border-border text-ink-secondary">
      <time className="font-mono text-label">Date</time>
      <span>·</span>
      <span className="font-body text-body-sm">Author</span>
    </footer>
  </div>
</article>
```

### Standard grid card

```jsx
<article className="rounded-card border border-border bg-white overflow-hidden shadow-card hover:shadow-card-hover transition-shadow duration-200 flex flex-col">
  {/* Cover: fixed height */}
  <div className="h-44">{/* image or geo fill */}</div>

  <div className="p-5 flex flex-col gap-3 flex-1">
    <CategoryBadge />
    <h3 className="font-display text-h5 font-bold line-clamp-2">Headline</h3>
    <p className="font-body text-body-sm text-ink-secondary line-clamp-2 flex-1">Excerpt</p>
    <footer className="flex items-center gap-3 pt-2 border-t border-border mt-auto text-ink-secondary">
      <time className="font-mono text-label">Date</time>
      <span>·</span>
      <span className="font-body text-body-sm truncate">Author</span>
    </footer>
  </div>
</article>
```

### Geometric cover fill (when no image)

Use CSS shapes instead of placeholder images. This is a firm anti-rule: no
Unsplash, no Lorem Picsum, no generic stock photos as placeholders.

```jsx
// Map content category to a background color
const GEO_BG = {
  blue:   'bg-primary-500',
  amber:  'bg-accent-400',
  green:  'bg-emerald-600',
  violet: 'bg-violet-600',
}

// Render layered abstract shapes
<div className={`relative overflow-hidden ${GEO_BG[scheme]}`}>
  <div className="absolute inset-0 opacity-20">
    <div className="absolute top-[-20%] right-[-10%] w-2/3 h-2/3 rounded-full bg-white/30" />
    <div className="absolute bottom-[-15%] left-[-5%] w-1/2 h-1/2 rotate-45 bg-white/20" />
    <div className="absolute top-1/3 left-1/4 w-1/3 h-1/3 rounded-sm rotate-12 bg-black/10" />
  </div>
  <div className="absolute inset-0 bg-gradient-to-br from-black/0 to-black/25" />
</div>
```

The gradient overlay (`from-black/0 to-black/25`) ensures text overlaid on the
fill is always readable.

---

## 6. Navigation patterns

### Public navbar (sticky)

```
Height: h-16 (64px)
Background: bg-surface/95 backdrop-blur-sm (frosted glass effect)
Border: border-b border-border
Position: sticky top-0 z-40
```

**Logotype:** Two-line, `font-display` name above `font-mono text-label` tagline.
Never a single word mark — the tagline grounds the brand.

**Active state:** `border-b-2 border-accent pb-0.5` — an amber underline.
Not background-based, not bold-weight — just a precise accent line.

**Mobile hamburger → slide-in drawer:**
- Drawer slides from the right (`animate-slide-in`)
- `bg-surface/95` not `bg-white` (matches navbar)
- Body scroll locked while open (`overflow: hidden`)
- Closes on Escape, backdrop click, and route change
- Focus-traps to first link on open

```jsx
// Drawer: right-side slide-in
<div className="fixed top-0 right-0 z-50 h-full w-72 bg-surface shadow-xl ...
  transition-transform duration-250
  ${open ? 'translate-x-0 animate-slide-in' : 'translate-x-full'}">
```

### Admin sidebar

```
Width: w-56 (224px) fixed
Background: bg-primary-900
Position: fixed inset-y-0 left-0 (desktop), slide-in drawer from left (mobile)
```

**Nav item active state:** `bg-primary-700 text-white` (lighter on dark background).
**Inactive:** `text-primary-200 hover:bg-primary-800 hover:text-white`.
**Section labels:** `font-mono text-label uppercase tracking-widest text-primary-500`.
**Badges (count):** `bg-primary-800 text-primary-300` — dark on dark, readable.

---

## 7. Interactive element patterns

### Buttons

```jsx
// Primary action
<button className="min-h-[44px] px-4 bg-primary text-surface font-body font-semibold rounded-sm hover:bg-primary-600 transition-colors duration-150 disabled:opacity-60 focus-visible:rounded">

// Secondary / ghost
<button className="min-h-[44px] px-4 bg-white border border-border text-ink-secondary font-body font-semibold rounded-sm hover:border-primary hover:text-primary transition-colors duration-150 focus-visible:rounded">

// Destructive (only after confirmation)
<button className="min-h-[36px] px-3 font-body text-body-sm text-red-600 hover:bg-red-50 rounded-sm transition-colors duration-150">
```

Rules:
- **Minimum touch target: 44px height** on all interactive elements. Non-negotiable on mobile.
- Use `rounded-sm` (2px) not `rounded` (4px) or `rounded-lg`. Subtle rounding is editorial, heavy rounding is SaaS.
- `duration-150` for color transitions, `duration-200` for shadow/transform transitions.
- `disabled:opacity-60 disabled:cursor-not-allowed` — always, never remove disabled styling.

### Form inputs

```jsx
<input className="w-full min-h-[44px] px-3 py-2 border border-border rounded-sm font-body text-body text-ink-primary bg-white focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-colors duration-150" />
```

Error state:
```jsx
// Replace border-border and ring with red:
"border-red-400 focus:border-red-500 focus:ring-red-300"
```

Never use `:focus` — always `:focus-visible` (keyboard-only ring). Exception:
inputs, where `:focus` is appropriate since keyboard and mouse users both need
to know which input is active.

### Filter/tab toggles

```jsx
// Toggle group (e.g. Status: Published | Draft)
<div className="flex rounded-sm border border-border overflow-hidden">
  {options.map(opt => (
    <button className={`flex-1 min-h-[36px] font-mono text-label uppercase tracking-widest transition-colors duration-150 ${active === opt ? 'bg-primary text-white' : 'text-ink-secondary hover:bg-surface'}`}>
      {opt}
    </button>
  ))}
</div>
```

The `overflow-hidden` on the container clips the individual button borders at
the edges, creating a single unified component feel.

---

## 8. State patterns

Every component that loads data must handle all three states. No exceptions.

### Loading — skeleton shimmer

```css
/* In @layer base or a global CSS file */
.skeleton {
  background: linear-gradient(90deg, #e9e9e7 25%, #f0f0ee 50%, #e9e9e7 75%);
  background-size: 800px 100%;
  animation: shimmer 1.4s infinite linear;
}

@keyframes shimmer {
  0%   { background-position: -400px 0 }
  100% { background-position:  400px 0 }
}
```

Skeleton shapes must approximate the real content's bounding box. Heights:
- Headline: `h-6` or `h-10` (depending on scale)
- Body line: `h-4`
- Image area: `h-44` or `h-56`
- Badge: `h-4 w-16`
- Meta: `h-3 w-24`

Always add `aria-busy="true"` and `aria-hidden="true"` to the skeleton container.

### Empty state

```jsx
// Geometric illustration — no icons from a library, no stock illustrations
<div className="flex flex-col items-center justify-center py-24 gap-6 text-center animate-fade-in">
  <div className="relative w-24 h-24">
    <div className="absolute inset-0 rounded-full bg-primary-50" />
    <div className="absolute top-3 left-3 w-10 h-10 rotate-45 bg-accent-100" />
    <div className="absolute bottom-4 right-3 w-6 h-6 rounded-full bg-primary-200" />
  </div>
  <p className="font-display text-h4 font-bold text-ink-primary">Título del estado vacío</p>
  <p className="font-body text-body text-ink-secondary mt-1">Mensaje explicativo breve.</p>
</div>
```

The layered geometric shapes echo the card cover fills — the empty state feels
like part of the system, not an afterthought.

### Error state

```jsx
<div role="alert" className="flex flex-col items-center justify-center py-24 gap-6 text-center">
  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
    {/* inline SVG warning icon — no library */}
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  </div>
  <div>
    <p className="font-display text-h4 font-bold text-ink-primary">Algo salió mal</p>
    <p className="font-body text-body text-ink-secondary mt-1">Mensaje de error accionable.</p>
  </div>
  <button className="min-h-[44px] px-6 py-2.5 bg-primary text-surface font-body font-semibold rounded-sm ...">
    Reintentar
  </button>
</div>
```

---

## 9. Animation and motion

Minimal, purposeful. Every animation serves a function — it does not decorate.

### Keyframes to define

```js
keyframes: {
  shimmer: {
    '0%':   { backgroundPosition: '-400px 0' },
    '100%': { backgroundPosition: '400px 0' },
  },
  'fade-in': {
    '0%':   { opacity: '0', transform: 'translateY(8px)' },
    '100%': { opacity: '1', transform: 'translateY(0)' },
  },
  'slide-in': {
    // Right-to-left (mobile drawer from right)
    '0%':   { transform: 'translateX(100%)' },
    '100%': { transform: 'translateX(0)' },
  },
}
```

### When to animate

| Trigger | Animation | Duration |
|---|---|---|
| Content loads (cards, lists) | `animate-fade-in` | 300ms ease-out |
| Drawer/modal opens | `animate-slide-in` | 250ms ease-out |
| Skeleton loader | `animate-shimmer` | 1.4s infinite linear |
| Card hover | `transition-shadow duration-200` | — |
| Button/link hover | `transition-colors duration-150` | — |
| Pulse indicator (live preview) | `animate-pulse` | Tailwind default |

### What NOT to animate

- Page transitions (jarring in SPAs, not worth the complexity)
- Staggered list animations (too playful for editorial)
- Scroll-triggered reveals (adds JS complexity, no editorial benefit)
- Scale transforms on hover (feels SaaS, not editorial)

---

## 10. Accessibility rules

Every interactive element must be keyboard accessible and screen-reader friendly.

### Focus rings

```css
/* Global in @layer base */
*:focus-visible {
  outline: 2px solid #F5A623;   /* accent color */
  outline-offset: 2px;
}
```

Amber focus rings are both accessible (high contrast) and brand-consistent.

### ARIA patterns

```jsx
// Filter buttons (toggle behavior)
<button aria-pressed={active === cat}>Filtro</button>

// Nav open/close
<button aria-expanded={open} aria-controls="mobile-drawer" aria-label="Abrir menú">

// Content loading
<div aria-busy="true" aria-label="Cargando artículos">

// Error messages
<div role="alert">

// Skip links (add to top of PublicLayout)
<a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded">
  Ir al contenido
</a>

// Image alt text: decorative images get aria-hidden="true" alt=""
// Meaningful images get descriptive alt text
```

### Touch targets

`min-h-[44px]` on all buttons and links that appear on mobile. This is a hard
minimum — never reduce it.

### Semantic HTML

```
<header>     navbar
<main>       page content (gets id="main-content")
<nav>        navigation groups (with aria-label)
<article>    individual content cards and detail pages
<aside>      sidebar content
<section>    named content regions (add aria-labelledby)
<footer>     page footer
<time>       all date/time values (with dateTime attribute)
```

---

## 11. Admin panel design language

The admin is a different context but stays in the same brand family.

### Layout

```
Fixed sidebar (w-56, bg-primary-900) + scrollable main content area.
Main content has its own topbar (h-14, bg-white, border-b).
Content padding: p-4 sm:p-6 lg:p-8.
```

### Admin color shifts

- Background: `bg-surface` (same as public — admin isn't a different world)
- Cards/panels: `bg-white rounded-card border border-border shadow-card` (same)
- Sidebar: `bg-primary-900` — deepest brand blue
- Status badges:
  - Published: `bg-emerald-50 text-emerald-700`
  - Draft: `bg-amber-50 text-amber-700`
  - Past events: `opacity-50` on the row

### Tables

```jsx
// Header row
<tr className="border-b border-border bg-surface">
  <th className="px-4 py-3 text-left font-mono text-label uppercase tracking-widest text-ink-secondary">

// Data row
<tr className="border-b border-border last:border-b-0 hover:bg-surface transition-colors duration-100">
  <td className="px-4 py-3 font-body text-body-sm text-ink-primary">
```

### Destructive actions (delete)

Always require two clicks:
1. First click: show "Confirmar / Cancelar" inline — no modal
2. Second click: execute

```jsx
{confirmId === row.id ? (
  <span className="flex items-center gap-1.5">
    <button onClick={() => handleDelete(row.id)} className="text-red-600 hover:bg-red-50 ...">Confirmar</button>
    <button onClick={() => setConfirmId(null)} className="text-ink-secondary ...">Cancelar</button>
  </span>
) : (
  <button onClick={() => setConfirmId(row.id)} className="text-ink-secondary hover:text-red-600 ...">Eliminar</button>
)}
```

---

## 12. Icon policy

**No icon library.** All icons are inline SVG. This eliminates a dependency,
ensures icons are always brand-consistent, and allows color control via
`stroke="currentColor"`.

Standard icon attributes:
```jsx
<svg
  width="20"
  height="20"
  viewBox="0 0 24 24"
  fill="none"
  stroke="currentColor"
  strokeWidth="2"
  strokeLinecap="round"
  strokeLinejoin="round"
  aria-hidden="true"    // always, if paired with visible label text
>
```

For social icons (Instagram, X, LinkedIn), use the brand's exact path data.
For UI icons, use Lucide-style strokes (consistent weight, clean geometry).

Stroke width scale:
- Large icons (24px+): `strokeWidth="1.75"`
- Medium icons (18–20px): `strokeWidth="2"`
- Small icons (14–16px): `strokeWidth="2.5"`

---

## 13. Internationalization

When the product is multilingual, make these commitments from day one:

1. All UI strings live in `src/locales/{lang}.json`. Never hardcode UI text.
2. Primary language first — define the primary locale's file completely before
   the secondary.
3. Date formatting uses `toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'es-AR', ...)` — never hardcode a locale.
4. Category/tag names that appear in data AND UI get their own translation key
   (`categories.Académico → "Academic"`).
5. The language toggle lives in the navbar, always visible. `font-mono text-label uppercase` button showing the *other* language code (ES / EN).

---

## 14. Anti-rules (what to actively avoid)

These are failure modes that will make the design feel generic or wrong.

| Rule | Reason |
|---|---|
| No pure white (`#FFFFFF`) page backgrounds | Feels like a screen, not paper. Use `#FAFAF8`. |
| No Inter or Roboto | Neutral fonts erase editorial character. |
| No gradient backgrounds | Gradients signal SaaS, not editorial. |
| No Unsplash/Lorem Picsum placeholders | Use geometric CSS fills (they're part of the design system). |
| No default gray Tailwind shadows | Tint shadows with the primary brand color. |
| No `rounded-lg` or `rounded-full` on cards | Cards are `rounded-card` (6px). Only avatars and toggle handles use full rounding. |
| No icon libraries (Heroicons, Lucide package) | Inline SVG only. |
| No decorative emojis in UI chrome | Emojis are for content, never for navigation or labels. |
| No centered hero-only homepage layout | Content flows editorially — asymmetric grid, not a billboard. |
| No `hover:scale-105` on cards | Scale transforms feel SaaS. Use shadow transitions only. |
| No staggered entrance animations | One clean `fade-in` per page load. Not per-item. |
| No mega menus | Navigation is flat: max one level deep. |
| No full-width colored section bands | Use the editorial flow — same background, content creates the rhythm. |

---

## 15. Complete tailwind.config.js

Drop this directly into a new project and adjust the content paths:

```js
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1A3C6E',
          50:  '#EEF3FA',
          100: '#D5E2F3',
          200: '#ADC5E7',
          300: '#7FA1D4',
          400: '#4D79BC',
          500: '#1A3C6E',
          600: '#163462',
          700: '#122B52',
          800: '#0E2243',
          900: '#091633',
        },
        accent: {
          DEFAULT: '#F5A623',
          50:  '#FEF8EC',
          100: '#FDEECE',
          200: '#FBD98E',
          300: '#F8C150',
          400: '#F5A623',
          500: '#E08B05',
          600: '#B87005',
          700: '#8C5504',
          800: '#5F3903',
          900: '#341F01',
        },
        surface: '#FAFAF8',
        ink: {
          primary:   '#1C1C1E',
          secondary: '#6B7280',
        },
        border: '#E5E7EB',
      },
      fontFamily: {
        display: ['"Fraunces"', '"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"Source Sans 3"', 'Lato', 'system-ui', 'sans-serif'],
        mono:    ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      fontSize: {
        'body-sm': ['0.875rem', { lineHeight: '1.7' }],
        'body':    ['1rem',     { lineHeight: '1.7' }],
        'body-lg': ['1.125rem', { lineHeight: '1.7' }],
        'label':   ['0.75rem',  { lineHeight: '1.4', letterSpacing: '0.06em' }],
        'h5': ['1.25rem',  { lineHeight: '1.3', fontWeight: '700' }],
        'h4': ['1.5rem',   { lineHeight: '1.25', fontWeight: '700' }],
        'h3': ['1.875rem', { lineHeight: '1.2',  fontWeight: '700' }],
        'h2': ['2.5rem',   { lineHeight: '1.15', fontWeight: '800' }],
        'h1': ['3rem',     { lineHeight: '1.1',  fontWeight: '800' }],
        'display': ['3.5rem', { lineHeight: '1.05', fontWeight: '800' }],
      },
      maxWidth: {
        content: '1120px',
      },
      spacing: {
        section:         '5rem',
        'section-mobile': '3rem',
      },
      boxShadow: {
        card:       '0 1px 3px rgba(26,60,110,0.08), 0 4px 16px rgba(26,60,110,0.06)',
        'card-hover': '0 4px 12px rgba(26,60,110,0.12), 0 12px 32px rgba(26,60,110,0.10)',
      },
      borderRadius: {
        card: '0.375rem',
      },
      keyframes: {
        shimmer: {
          '0%':   { backgroundPosition: '-400px 0' },
          '100%': { backgroundPosition: '400px 0' },
        },
        'fade-in': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%':   { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
      },
      animation: {
        shimmer:    'shimmer 1.4s infinite linear',
        'fade-in':  'fade-in 0.3s ease-out both',
        'slide-in': 'slide-in 0.25s ease-out both',
      },
    },
  },
  plugins: [],
}
```

---

## 16. index.css baseline

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    background-color: #FAFAF8;
    color: #1C1C1E;
    font-family: 'Source Sans 3', Lato, system-ui, sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  *:focus-visible {
    outline: 2px solid #F5A623;
    outline-offset: 2px;
  }

  .skeleton {
    background: linear-gradient(90deg, #e9e9e7 25%, #f0f0ee 50%, #e9e9e7 75%);
    background-size: 800px 100%;
    animation: shimmer 1.4s infinite linear;
  }
}

@layer components {
  .container-content {
    @apply max-w-content mx-auto px-4 sm:px-6 lg:px-8;
  }
}
```

---

## 17. Adapting to a different brand

The system works with any brand color pair. To adapt:

1. Replace `primary` (`#1A3C6E`) with the brand's main color. Generate the
   9-stop scale by lightening toward 50 and darkening toward 900.
2. Replace `accent` (`#F5A623`) with a warm complementary color (amber, coral,
   gold). Keep it high-energy — this is the highlight color.
3. Keep `surface` as a slightly off-white tinted toward the primary hue (e.g.
   a warm brand → `#FAFAF8`, a cool brand → `#F8FAFE`).
4. Keep `ink` values unchanged — they are neutral and work with any brand.
5. Keep the fonts. Fraunces + Source Sans 3 is the combination that produces
   the editorial feel. If licensing is a concern, Playfair Display + Lato is
   an acceptable substitute.

The architecture of the system (three-font stack, tinted shadows, off-white
surface, amber accent) is more important than the specific hex values.
