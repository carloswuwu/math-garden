# ADR-0009: Lazy-load teaching content out of the boot bundle

- **Status:** Accepted (post-roadmap performance)
- **Context:** The single-IIFE bundle reached **169.4 KB gzip** against a 170 KB advisory — the whole teaching corpus (`lessons.js`, ~58 KB gzip minified) was downloaded, parsed and kept in memory at boot even though only the lesson screen reads it. Raising the gate again would have hidden the structural problem rather than fixing it.
- **Decision:** Split `lessons.js` into a separate deterministic chunk `dist/lessons.<hash>.js` (same build hash):
  - `tools/build.js` no longer concatenates `lessons.js` into the boot bundle; it minifies it as its own classic IIFE and writes `<meta name="math-garden-lessons">` + `<link rel="prefetch">` into `dist/index.html`.
  - `src/ui/globals.js` exposes `getLessons()` (late-bound); `src/ui/lessons-loader.js` injects the chunk on first lesson open and resolves immediately when `window.Lessons` already exists (root `file://` dev still loads the seven classic scripts synchronously).
  - `renderLesson` shows a minimal, accessible “loading” card while the chunk loads, then re-renders the same route without touching history; failures show a localized retry card.
  - The generated SW precaches the chunk and treats `app.<hash>.js` and `lessons.<hash>.js` as cache-first immutable assets, so cold offline still renders lessons.
  - Budgets move with the split: boot ≤ 130 KB gzip, lessons chunk ≤ 100 KB gzip, precache ≤ 1.2 MB.
- **Consequences:** First paint parses ~112 KB gzip instead of ~169 KB; lesson content is paid for only when needed (prefetch makes the first lesson effectively instant). Content growth now lands in the lazy chunk instead of the boot budget. Cost: one extra request/execution on first lesson open, a small loading state, and the UI/a11y/perf harnesses must preload the chunk (the `ui` dist smoke test additionally exercises the un-loaded → loaded transition). Keep engine/practice data in the boot bundle: session restore and the Continue card validate answers at init.
