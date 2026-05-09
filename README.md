# MathBloom

> Type a word, watch mathematics bloom into art. A Next.js 15 mathematical art generator that maps keywords (rose, heart, galaxy…) to animated polar, parametric & Cartesian curves rendered in real-time with neon glow effects, 4 visual themes, and interactive particle backgrounds. No AI — pure math.

![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss) ![Framer Motion](https://img.shields.io/badge/Framer_Motion-11-pink)

---

## Features

- **7 mathematical curves** — Rose, Heart, Butterfly, Spiral, Galaxy, Sine Wave, Lissajous
- **Keyword search** — type `rose`, `galaxy`, `wave` etc. to instantly render a curve
- **Progressive animation** — curves draw themselves on canvas with neon glow
- **Preset gallery** — clickable cards with live mini-canvas previews
- **Random art generator** — one click for a surprise curve
- **4 visual themes** — Neon, Galaxy, Cyberpunk, Aurora
- **Export as PNG** — save your art
- **Particle background** — interactive floating particles via tsParticles

## Tech Stack

| Layer | Library |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Canvas rendering | Canvas 2D API |
| UI animations | Framer Motion 11 |
| Particles | tsParticles 3 |
| Icons | Lucide React |

## Getting Started

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000).

## Curves Reference

| Keyword | Curve | Formula |
|---|---|---|
| `rose` / `flower` | Polar Rose | `r = cos(kθ)` |
| `heart` / `love` | Heart Curve | `x=16sin³t, y=13cos t−5cos 2t−2cos 3t−cos 4t` |
| `butterfly` / `wings` | Butterfly Curve | `r = e^sin(θ) − 2cos(4θ) + sin⁵((2θ−π)/24)` |
| `spiral` / `vortex` | Archimedean Spiral | `r = aθ` |
| `galaxy` / `cosmos` | Logarithmic Spiral | `r = ae^(bθ)` |
| `wave` / `ocean` | Sine Wave | `y = A·sin(Bx + Ct)` |
| `lissajous` | Lissajous Curve | `x=A·sin(at+δ), y=B·sin(bt)` |

## Project Structure

```
src/
├── app/             # Next.js App Router pages & layout
├── components/      # GraphCanvas, Hero, ControlPanel, PresetGallery, ThemeSelector, ParticleBackground
└── lib/             # equations.ts, themes.ts, utils.ts
```

## License

MIT
