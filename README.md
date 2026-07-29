# Barline Scope (React + Tailwind)

Paste raw `.osu` `[TimingPoints]` lines and see the barline's actual scroll
speed — animated sweep + graphs — computed from `BPM × SV`, the same math
osu!mania uses.

## Run it

```bash
npm install
npm run dev       # dev server with hot reload
npm run build     # production build → dist/
npm run preview   # preview the production build locally
```

Requires Node.js 18+.

## Structure

```
src/
├── lib/
│   ├── timingMath.js   # parsing + speed/position simulation (pure functions)
│   └── canvas.js        # HiDPI canvas-fitting helper
├── components/
│   ├── Header.jsx
│   ├── InputPanel.jsx    # paste box + params + parse button
│   ├── ScopePanel.jsx    # animated barline sweep + HUD + transport controls
│   ├── GraphPanel.jsx    # speed (log-scale) + cumulative distance graphs
│   └── Footer.jsx
├── App.jsx               # state + the requestAnimationFrame playback loop
├── main.jsx
└── index.css              # Tailwind directives
```

## How the math works

- Red (uninherited) line → `BPM = 60000 / beatLength`
- Green (inherited) line → `SV = -100 / beatLength`
- Effective speed at time *t* → `SV(t) × BPM(t) / referenceBPM`
- Barline position → that speed integrated over time

This is the literal math the game multiplies together to decide scroll
speed — it doesn't try to reproduce the game's rendering-cache bugs, so an
extreme BPM/SV spike (like the classic LN-glitch trick) shows up honestly as
a huge, real jump in distance.
