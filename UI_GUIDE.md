# UI Design Guide — AI Interview Platform
> Inspired by Chakra.sh — Dark editorial aesthetic

---

## Philosophy

Not glassmorphism. Not neon. Extremely refined **dark editorial** — Linear.app meets a luxury magazine.
Power comes from typography scale and whitespace, not color.

**Core traits:**
- Off-black base background (`#0a0a0a`)
- Warm white (cream) text — never pure white
- Zero accent colors — pure grayscale (with one rare teal accent)
- Serif font (Fraunces) for headlines only
- Inter for all body/UI text
- No shadows, no gradients — depth via layered bg values

---

## Color System

| Token     | Hex       | Tailwind class        | Usage                       |
|-----------|-----------|-----------------------|-----------------------------|
| `ink`     | `#0a0a0a` | `bg-[#0a0a0a]`        | Page background              |
| `surface` | `#141414` | `bg-[#141414]`        | Section backgrounds          |
| `card`    | `#1e1e1e` | `bg-zinc-900`         | Card backgrounds             |
| `border`  | `#2a2a2a` | `border-zinc-800`     | All borders                  |
| `cream`   | `#f0ede6` | `text-[#f0ede6]`      | Primary text                 |
| `muted`   | `#888780` | `text-zinc-500`       | Secondary text               |
| `subtle`  | `#555555` | `text-zinc-600`       | Tertiary / hints             |

> **Rule:** Zero accent colors. All zinc grayscale. One teal accent allowed — use once, sparingly.

---

## Typography Rules

### Headlines — Fraunces serif, font-light
```tsx
className="font-serif text-5xl md:text-7xl font-light tracking-tight text-[#f0ede6]"
```

### Subheadings — Inter, normal weight
```tsx
className="font-sans text-xl text-zinc-400 font-normal leading-relaxed"
```

### Body — Inter 400 only. No bold body text.
```tsx
className="font-sans text-sm text-zinc-400 leading-relaxed"
```

### Labels / Caps
```tsx
className="text-xs uppercase tracking-widest text-zinc-600 font-sans"
```

---

## Spacing

```
Section padding:   py-32 md:py-40
Container:         px-6 md:px-12 max-w-6xl mx-auto
Card padding:      p-6 md:p-8
Gap between items: gap-4 to gap-8
```

---

## Tailwind Config Reference

```js
theme: {
  extend: {
    colors: {
      cream:   '#f0ede6',
      ink:     '#0a0a0a',
      surface: '#141414',
    },
    fontFamily: {
      serif: ['Fraunces', 'Georgia', 'serif'],
      sans:  ['Inter', 'system-ui', 'sans-serif'],
    },
  },
}
```

---

## Component Patterns

### Navbar
- Transparent background, no border
- Logo: `font-serif text-cream`
- Links: `text-sm text-zinc-400 hover:text-cream`
- CTA: white pill button

```tsx
<nav className="fixed top-0 w-full z-50 px-6 py-4 flex items-center justify-between">
  <span className="font-serif text-[#f0ede6] text-lg">InterviewAI</span>
  <button className="bg-white text-black rounded-full px-5 py-2 text-sm font-medium hover:bg-[#f0ede6]">
    Get started
  </button>
</nav>
```

### Cards
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
  {/* No box-shadow. Depth from bg contrast only. */}
</div>
```

### Buttons

Primary CTA:
```tsx
<button className="bg-white text-black rounded-full px-6 py-2.5 text-sm font-medium hover:bg-[#f0ede6] transition-colors">
  Start Interview
</button>
```

Secondary:
```tsx
<button className="border border-zinc-700 text-zinc-300 rounded-full px-6 py-2.5 text-sm hover:border-zinc-500 transition-colors">
  View History
</button>
```

Destructive / subtle:
```tsx
<button className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors">
  Cancel
</button>
```

### AI Chat Bubbles
```tsx
{/* AI message */}
<div className="flex gap-3 items-start">
  <div className="w-7 h-7 rounded-full bg-zinc-700 flex-shrink-0 flex items-center justify-center text-xs text-zinc-300">AI</div>
  <div className="bg-zinc-800 rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-zinc-200 max-w-lg">
    Tell me about a time you disagreed with your manager.
  </div>
</div>

{/* Human message */}
<div className="flex gap-3 items-start justify-end">
  <div className="bg-zinc-700 rounded-2xl rounded-tr-sm px-4 py-3 text-sm text-[#f0ede6] max-w-lg">
    I once pushed back on a deadline...
  </div>
</div>
```

### Score / Metric Cards
```tsx
<div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
  <p className="text-xs uppercase tracking-widest text-zinc-600 mb-2">Confidence Score</p>
  <p className="text-4xl font-serif text-[#f0ede6] font-light">87%</p>
  <p className="text-sm text-zinc-500 mt-1">Strong delivery, clear examples</p>
</div>
```

### Form Inputs
```tsx
<input
  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-[#f0ede6] placeholder-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
  placeholder="Job role..."
/>
```

### Section Dividers
```tsx
<div className="border-t border-zinc-800 my-16" />
```

---

## Page-Level Layout

### Landing Page
```
01  Navbar      — logo left · CTA right · transparent
02  Hero        — serif headline · subtext · 2 CTA buttons
03  Feature 1   — text left · UI mockup right
04  Feature 2   — UI mockup left · text right
05  Feature 3   — chat transcript mockup right
06  Footer CTA  — repeat headline + single button
```

### Dashboard
```
01  Topbar      — logo + user avatar + sign out
02  Stats row   — 3–4 metric cards
03  Recent      — table/list of past interviews
04  CTA card    — "Start New Interview"
```

### Interview Page
```
01  Header      — role + difficulty badge + timer
02  Chat area   — scrollable Q&A bubbles
03  Input area  — textarea + submit button (sticky bottom)
04  Progress    — question count indicator
```

### Report Page
```
01  Header      — role + date + overall score badge
02  Score grid  — 4 metric cards
03  Q&A review  — each question + answer + AI feedback
04  Actions     — Download (future) · New Interview
```

---

## Animation (framer-motion)

Fade-up on scroll — apply to every major section:
```tsx
<motion.div
  initial={{ opacity: 0, y: 24 }}
  whileInView={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.6, ease: 'easeOut' }}
  viewport={{ once: true }}
>
```

Page transitions — wrap page content:
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.4 }}
>
```

---

## The 5 Rules That Make It Premium

1. **Serif font for headlines** — single biggest change, 80% of the premium feel
2. **`#0a0a0a` not `#000000`** — off-black breathes; pure black feels cheap
3. **`#f0ede6` not `#ffffff`** — warm cream reduces harshness
4. **`py-32` / `py-40` section padding** — feels like too much but is correct
5. **No shadows, no gradients** — depth only via layered background values

---

## Do / Don't

| ✅ Do                              | ❌ Don't                          |
|------------------------------------|-----------------------------------|
| Serif for all H1/H2                | Bold body text                    |
| Zinc grayscale borders             | Colored borders                   |
| `rounded-2xl` / `rounded-3xl`      | Sharp corners on cards            |
| Generous section whitespace        | Tight cramped layouts             |
| Off-black + cream contrast         | Pure black or pure white          |
| One subtle teal accent max         | Rainbow accent colors             |
| `transition-colors` on all hovers  | Instant color changes             |
