# Drift Performance — 2FI.7 Findings

Record of the drift-performance profiling pass (roadmap task **2FI.7**) and the
decision it led to. Kept so the result isn't lost to chat history.

---

## What changed

Shard drift was driven by GSAP's ticker writing each shard's `left` / `top`
(in `vw`/`vh`) every frame — which forces the browser to recompute **layout +
paint per shard, per frame**. It now defaults to GPU-composited
`transform: translate3d` motion, which skips layout entirely.

- `src/lib/field/drift.ts` — `positionMode: 'transform' (default) | 'offset'`.
- `src/lib/components/Shard.svelte` — split into an outer GSAP-owned drift anchor
  and an inner interaction layer so the drift transform and the CSS hover-scale
  transform don't collide.
- Dev profiling harness at **`/dev/perf`** (`src/lib/dev/perf.svelte.ts`,
  `src/lib/dev/PerfHud.svelte`) — live FPS / frame-time HUD, configurable shard
  count, and a `transform` ↔ `offset` toggle to A/B the two paths.

---

## Method

Run `/dev/perf`, set a shard count, pick a mode, **reset stats**, let it settle
~15–20s, read the HUD. Repeated across two devices and both modes.

| Device | Display | Browser |
| --- | --- | --- |
| iPhone 11 | 60 Hz | iOS 26.5, Chrome |
| MacBook Air M2 (2022) | 60 Hz | macOS 26.3, Dia |

### Results

| Device | Mode | Shards | FPS | p95 (ms) | >16.7ms | >33ms |
| --- | --- | --- | --- | --- | --- | --- |
| phone | offset | 30 | 60 | 17.0 | 66% | 0% |
| phone | offset | 15 | 60 | 17.0 | 68% | 0% |
| phone | offset | 5 | 60 | 17.0 | 63% | 0% |
| phone | transform | 30 | 60 | ~17 | ~64% | 0% |
| phone | transform | 15 | 60 | ~17 | ~64% | 0% |
| phone | transform | 5 | 60 | ~17 | ~64% | 0% |
| mac | offset | 30 | 60 | 18.0 | 64% | 0% |
| mac | offset | 15 | 60 | 18.0 | 62% | 0% |
| mac | offset | 5 | 60 | 18.0 | 60% | 0% |
| mac | transform | 30 | 60 | 18.0 | 62% | 0% |
| mac | transform | 15 | 60 | 18.0 | 63% | 0% |
| mac | transform | 5 | 60 | 18.0 | 60% | 0% |

---

## Interpretation

- **`>33ms` = 0% everywhere.** Neither mode dropped a frame into visible-jank
  territory, on either device, at any count. Both ran a smooth, locked 60fps.
- **`fps`=60, `p95`≈17–18ms are the 60 Hz vsync ceiling.** Both displays cap at
  ~16.67ms/frame, so frames physically cannot go faster regardless of how little
  work drift does.
- **`>16.7ms`≈60–68% is a measurement artifact, not jank.** The threshold
  (16.667ms) sits *on* the 60 Hz frame interval, so normal timer jitter pushes
  ~⅔ of perfectly-fine frames just over the line. It reads ~64% whether a frame's
  work took 2ms or 14ms — so it cannot distinguish the two modes. **Don't read the
  `>16.7ms` figure as a quality signal at 60 Hz.** `>33ms` (real dropped frames)
  is the trustworthy one.

In short: at the MVP's realistic density (≤~20–30 shards), drift is effortless for
both modes on modern hardware. The A/B gap is invisible here simply because nothing
is stressed — both paths bottleneck on the same vsync cap.

---

## Decision

- **Keep GPU `transform` as the production default.** It's strictly cheaper
  (no per-frame layout), so even with no measurable win today it's the right
  baseline — and it future-proofs **3OP.2** (the blurred-but-drifting backdrop),
  where `backdrop-filter` over a layout-thrashing layer is exactly where `offset`
  would have hurt.
- **Drift performance is adequate for MVP; 2FI.7 is closed.**
- **The `/dev/perf` harness is retained** as a reusable profiling tool. To make the
  `transform` vs `offset` gap actually visible later you'd need to push shard
  counts well past 30 (until `offset` drops below 60fps while `transform` holds),
  replace the vsync-fooled `>16.7ms` metric with true dropped-frame detection
  (e.g. interval > 1.5× the rolling median), and add a blur-backdrop antagonist.
  Revisit when 3OP.2 lands.
