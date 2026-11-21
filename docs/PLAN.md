# Math Garden — handoff plan (for a fresh session)

> **Purpose.** This file is the single source of truth for continuing work on the Math Garden PWA in a new conversation. It records the current state, the architecture, what was just fixed, the open debt, and the executable plan (with acceptance criteria and agent prompts). Read this first; do not re-derive the architecture from scratch.

## 0. Snapshot

| Item | Value |
|---|---|
| Repo | `C:\Users\Carlos\Documents\deepseek-harness\math` |
| Branch / HEAD | `main` @ `c4018db` (Phase 1 landed; docs commit on top) |
| Live | https://carloswuwu.github.io/math-garden/ (GitHub Pages, deploy from `main` root) |
| CI | `.github/workflows/tests.yml` — three node suites on every push/PR |
| Content | 14 stages, **111 skills**, 102 lessons, 127 type entries; Pre-K → university |
| Code size | `math-core.js` 3,777 lines · `app.js` 2,274 · `curriculum.js` 1,086 · `lessons.js` 597 · `style.css` 729 |
| Tests | core **571,764** assertions · ui **183** · generators **111,680** (111 skills) |
| Persistence | progress schema **v2** (`mathpath.progress`), legacy v1 key migrated, sanitized import |
| In-flight session | `sessionStorage['mathpath.session.v1']` (24 h TTL, practice/quiz/exam only, never in progress) |
| Offline | SW cache `math-garden-v10`, 20 KaTeX woff2 precached, nav-only shell fallback |
| Local preview | `$env:PORT=8080; node tests/serve.js` → http://localhost:8080 (also LAN/tailnet) |
| Dev env | Windows, PowerShell 5.1, Node 20; tests deps in `tests/` with `package-lock.json` |

## 1. Product & content state

- Static offline-first PWA, no backend, no accounts, no telemetry. Kid-safe by design.
- Curriculum is data: `curriculum.js` (stages → topics → skills, types/levels/mastery) and `lessons.js` (bilingual lesson per lesson key).
- Engine: seeded generators, choice building, answer equivalence (fractions by value), mastery/adaptive selection, `explain()` worked solutions.
- UI: screen switching over `<section hidden>`, `innerHTML` rendering, hand-made paper/storybook CSS, dark chalkboard theme.
- Recent content depth: S4 discriminant + nature of roots, line equations, circle properties; S5 GP sums, IQR; S6 two-dice/complement probability, general binomial; university calculus (derivative value/integral), 2×2 matrices, expectation/binomial.
- Assessment: 10-item skill quiz (≥80% = 2 stars = mastered), 20-item stage exam (≥90% unlocks next stage), adaptive difficulty rises after 3 consecutive correct.

### Fixed in this cycle (do not re-report)

1. Equivalent fractions accepted by value; computed fraction answers reduced; no two equivalent options.
2. Probability distractors constrained to the sample space.
3. Mode-aware `SOLVERS` for previously wrong/crashing worked solutions (GP sums, sector area, discriminant, line equations, dice/complement probability, place value, identities, prism volume, matrices, calculus, expectation, circle properties, IQR, percent modes, fraction addition, bag probability, general binomial).
4. Canonical `mathSig` (stable stringify of `math`), no allowlist drift; registry derived from `GENERATORS`.
5. CI green; versioned progress schema with migration and validated import.
6. 90% stage gate; `passed` stored, old `perfect` saves compatible.
7. Accessibility: dialog semantics/focus trap/Esc/restore, keyboard answering (1–4, arrows, Enter/Space), progressbar semantics, live regions, `<html lang>` sync, skip link, focus-to-heading on navigation.
8. PWA safety: non-navigation misses never fall back to HTML; navigation timeout; fonts precached; no auto-reload mid-session.
9. New modes: indices division/power-of-product, negative-coefficient inequalities with sign flip, general 2×2 simultaneous by elimination, log product law, even median, nature of roots, fractional .5 medians, unsorted stats prompts.

### Landed in this cycle: Phase 1 — routing & resume (do not re-report)

10. Hash routes (`#/home`, `#/stage/:stageId`, `#/lesson|practice|quiz/:skillId`, `#/exam/:stageId`, `#/parent|settings|outline|formulas`) parsed by pure `parseHash`/`serializeRoute`, validated by `resolveRoute` against `Curriculum` + unlock rules; unknown/locked links are replaced with the nearest valid ancestor. Back/Forward works via `hashchange` + `popstate` (deduped by `lastHash`); `pushState` only on a real screen change, re-renders replace.
11. `show()` is the single navigation choke point: hash sync + topbar + focus-to-heading + `#announcer`. Duplicated `back()` and language-toggle screen switches removed (`back()` = `parentOf(currentRoute())`, language toggle re-renders via route).
12. In-flight session resume: `sessionStorage['mathpath.session.v1']` for practice/quiz/exam `{v, route, mode, stageId, skillId, problems, index, correct, results, quizStart, savedAt}`; 24 h TTL; every problem re-validated with `MathCore.checkAnswer(p, p.answer)` and the route re-checked against unlocks; written on start/advance/restore, cleared on finish/reset/import. Reload mid-quiz restores question/index/results when the URL targets the same route; the home screen otherwise shows a Continue card. Progress schema untouched.
13. Route error boundary (`renderRouteSafely`) renders a recoverable card that offers **Export progress** before returning home.

## 2. Architecture map

```
index.html  (7 ordered <script> globals + KaTeX vendor)
  ├─ math-core.js   pure engine: GENERATORS, choices, checking, mastery, explain/SOLVERS, progress sanitizer
  ├─ curriculum.js  content graph (stages/topics/skills)
  ├─ lessons.js     lesson text keyed by lesson id
  ├─ i18n.js        UI strings (zh/en)
  ├─ formulas.js, curriculum-outline.js   reference data
  ├─ vendor/katex   math rendering
  └─ app.js         state, screens, rendering, storage, dialogs, keyboard, SW registration
sw.js               cache + offline
tests/              core.test.js, ui.test.js (jsdom), generators.test.js, serve.js
```

**Contracts (informal but load-bearing):**
- `Problem { type, prompt{zh,en}, visual, answer, choices, math, hint, sig, solution? }`.
- Five consumers of `math`: choice builder, `mathSig`, `explain/SOLVERS`, `renderVisual`, and the test oracle (`tests/core.test.js computeAnswer`). Any new mode must satisfy all five.
- Progress: `{version:2, lang, sound, theme, stars, streak, badges, skills, stageExams}`; `MathCore.sanitizeProgress()` is the only writer path.
- Navigation: pure `parseHash(hash)`/`serializeRoute(route)` + `parentOf(route)`/`currentRoute()`; `resolveRoute()` validates against `Curriculum` and unlock rules (unknown → home, locked → nearest ancestor). `show(screen)` toggles `hidden`, syncs the hash (replace on re-render / push on screen change), moves focus to the heading and announces via `#announcer`. `hashchange`/`popstate` re-render from the URL; all click entries go through `navigate(route)` so the error boundary in `renderRouteSafely()` applies. Hash routes only — path routes would 404 on Pages reload and break `file://`.
- In-flight session: `sessionStorage['mathpath.session.v1']` for practice/quiz/exam; `readSession()/saveSession()/clearSession()/restoreSession()`; home Continue card. It is never written to the progress schema.

**Verification commands**

```powershell
cd C:\Users\Carlos\Documents\deepseek-harness\math
node tests/core.test.js        # engine + math oracle
node tests/ui.test.js          # jsdom UI behaviour
node tests/generators.test.js  # generator/explain/content contracts
node --check app.js; node --check math-core.js
```

CI additionally does `npm ci --prefix tests` then the three suites.

## 3. Known open debt (not fixed)

### Mathematics / content (P2 unless stated)
- `hs.s4.trig` sits at S4 while the app's own EDB outline puts trigonometry at KS3; decide and align.
- `genQuadsolve` roots are always distinct positive; discriminant mode only D≥0 (nature mode now covers D<0 conceptually). Add negative/mixed roots later.
- `genMatrix` determinant is always positive; the “swap if ≤0” is a no-op (bc = cb). Singular/negative determinants untested.
- Indices lack zero/negative exponents; prompts use caret text (`4^3`) outside KaTeX; outline claims integer index laws.
- Dispersion always uses 7 distinct integers; only IQR, no SD/variance/quartiles beyond Q1/Q3.
- Trig choices may show unreduced fractions for non-primitive triples; bag probability keeps one `good/(total−1)` distractor by design.
- Formula sheet: median entry is just `\tilde{x}`; GP sum lacks `r ≠ 1`; AP sum missing though taught; binomial `T_{r+1}` uses a different `r` convention than the lesson; log laws omit base/domain.
- `hs.s6.derivative` goal says “differentiate xⁿ” but items ask leading coefficient / degree only.
- University archetypes are shallow (2 each): limits/series, eigenvalues, normal distribution not covered.
- Small documented pools remain (see `KNOWN_SMALL_POOLS` in `tests/generators.test.js`).

### Architecture (P1/P2)
- **Routing remainder:** finished quiz/exam results have no dedicated route (coming Back to the same quiz route re-shows the last result card; a reload at that URL starts a fresh run). Topbar back navigates to `parentOf()` and therefore pushes a history entry instead of calling `history.back()`.
- **No build:** 7 globals, script-order coupling, no minification/tree-shaking, unhashed assets; file:// double-click is a supported path.
- **SW lifecycle:** manual `CACHE` version, no user-visible update prompt (auto-reload removed), `skipWaiting` still immediate.
- **i18n split:** UI strings in `i18n.js`, item/lesson strings hardcoded `{zh,en}` in generators/lessons; ARIA strings inline in `app.js`.
- **Test oracle duplication:** `tests/core.test.js computeAnswer` re-implements generator math (kept in sync manually).
- **Error boundary/observability:** route renders are wrapped (`renderRouteSafely`) but a failure inside a direct event handler still surfaces via the console; no global `window.onerror` handler or telemetry.
- **A11y remainder:** informative SVG visuals have no text alternative; background not `inert` when dialog open; targets are 42 px (WCAG suggests 44); no `tests/a11y.test.js`/axe subset.
- **Content/spec drift:** formula sheet is standalone, not tagged to skills; no parity test.
- **Repo metadata:** GitHub description still says “Pre-K to Primary 6”.

## 4. The plan

### Phase 1 — Routing & resume — ✅ landed (`6c20635` feat, `56890f1` ui/pwa, `c4018db` tests)

Implemented as sketched:
1. Pure `parseHash(hash)` / `serializeRoute(route)` (+ `parentOf`, `currentRoute`), exposed on `window.__mathApp` for the jsdom suite; `resolveRoute()` validates against `Curriculum` + unlock rules. Routes: `#/home`, `#/stage/:stageId`, `#/lesson/:skillId`, `#/practice/:skillId`, `#/quiz/:skillId`, `#/exam/:stageId`, `#/parent|settings|outline|formulas`.
2. `show()` is the single choke point: syncs the hash once (replace on re-render, push only when the screen actually changes), updates the topbar, focuses the screen heading and announces via `#announcer`.
3. `hashchange`/`popstate` re-render from the URL (deduped through `lastHash` because browsers fire both); unknown/locked routes are `replaceState`d to the nearest valid ancestor (home/stage).
4. `sessionStorage['mathpath.session.v1']` for practice/quiz/exam, written on start/advance/restore, cleared on finish/reset/import; 24 h TTL; problems re-checked with `MathCore.checkAnswer(p, p.answer)` and the route re-validated against unlocks; auto-restore only when the URL already targets the same route, otherwise the home Continue card offers it.
5. Duplicated `back()` switch and language-toggle screen switch deleted — both are route-driven (`back()` = `navigate(parentOf(currentRoute()))`; language toggle re-renders `currentRoute()`).
6. `navigate()` → `renderRouteSafely()` error boundary renders a recoverable card that offers **Export progress** before home.

Decisions / deviations from the original sketch:
- Topbar back pushes `parentOf(currentRoute())` instead of calling `history.back()`; a finished-run route re-shows the existing result card until refresh.
- `pushState`/`replaceState` are wrapped: on `file://` or restricted contexts they fall back to assigning `location.hash` (deduped by `lastHash`).
- Session restore refreshes `savedAt` (24 h window restarts on Continue).

**Acceptance met:** Back/Forward works home→stage→lesson; reload mid-quiz restores same question/index/results; invalid or locked links redirect; all three suites green; no route state added to progress schema. Covered by ui assertions 19–27.

**Do not:** add a router library; use `history.pushState` path routes (Pages 404s on reload, file:// breaks); put quiz problems in progress; auto-resume stale sessions; push history on every re-render.

### Phase 2 — Contract tests (cheap, high leverage)
1. **MATH_SPEC:** one table `type(+mode) → answerFromMath` owned beside `GENERATORS`; use it in a dev self-check and in `core.test.js`; delete the duplicated `computeAnswer`.
2. **Schema fuzz:** random JSON through `sanitizeProgress` (never throws; caps hold: 500 skills / 60 typeAcc / 20 lastProblems / 100 stageExams); export→import→export idempotent; 1 MB guard.
3. **Asset manifest:** every `src`/`href` in `index.html`, manifest icon, and SW precache entry exists on disk and is relative.
4. **i18n parity:** every `t('…')` literal has zh+en; every playable skill has zh/en name+goal and an existing lesson; en item text has no CJK.
5. **Solver coverage:** every type/mode reachable by the lesson “step-by-step” button returns steps (no null) and the last step contains the rendered answer.
6. **Content parity:** tag formula items with skill ids and assert coverage; extend `curriculum types ⊆ GENERATOR_TYPES` to `SOLVERS`.

**Acceptance:** CI ≤ 10 s; deleting `computeAnswer` loses no coverage.

### Phase 3 — Build + SW lifecycle
1. **esbuild, not Vite** (preserve static/file:// model). Stage A: bundle the existing seven files in order into one IIFE `dist/app.<hash>.js` with zero source edits; `dist/index.html` keeps vendor KaTeX as a classic script. Stage B: generate `sw.js` precache list + cache version from the build manifest. Then C–E: convert data modules to ESM behind the unchanged `window.*` API, split `math-core.js` into `core/` modules, split `app.js` (router/screens/dialog/visual/a11y), drop globals.
2. SW: hashed assets cache-first (immutable); navigation network-first with timeout → cached shell; fonts cache-first; non-navigation miss → `Response.error()`; `Promise.allSettled` install; cache name `math-garden-<buildHash>`.
3. Update UX: no auto-reload; detect `reg.waiting`, show a localized “New version” chip; user accepts → `SKIP_WAITING` → reload. Keep the existing force-update action.
4. `play-math.bat` points at the built `index.html`; Pages publishes `dist/`.

**Acceptance:** cold offline start works; `git diff --exit-code dist` in CI; no manual asset list/cache version; update banner verified; bundle gzip ≤ 120 KB (advisory).

### Phase 4 — Accessibility remainder
- One `tests/a11y.test.js` boot: every screen has exactly one `h1`; every button/switch has an accessible name; no duplicate ids after `innerHTML`; navigation moves focus to heading; dialog trap/restore; live-region text changes; decorative SVG hidden; `lang` attr.
- Add `axe-core` restricted to jsdom-supported rules (`aria-*`, `name-role-value`, `duplicate-id`, `label`); exclude contrast/layout. Target 0 serious violations on 8 screens.
- Move ARIA strings into `i18n.js` (`a11y.*`), re-apply on language change; make topbar title a heading; add `aria-labelledby` to screens; set background `inert`/`aria-hidden` while a dialog is open; enlarge icon buttons to 44 px; text alternatives or a documented “text mode” for assessment visuals; keep `prefers-reduced-motion` handling (already in confetti).

### Phase 5 — Modularization, performance, docs
- Split engine/content/UI into modules; keep the public API; one PR per module.
- Perf budgets: `generateSet(20)` p95, jsdom render time, bundle gzip, precache ≤ 1.2 MB; Lighthouse a11y ≥ 0.95 on deploy.
- `docs/architecture.md` + ADRs; move the Windows ACL script/tooling into `tools/`; update repo description.

### 30 / 60 / 90-day shape
| Window | Ship |
|---|---|
| 0–30 d | **Phase 1 routing & resume (landed)**; SW font precache + safe fallback (done); Phase 2 contract tests; land a11y tests; formula/skill parity lint |
| 31–60 d | esbuild phases A–B, generated SW, hashed assets, update banner; result routes / history polish for finished runs |
| 61–90 d | Phases C–E modular split, text alternatives, perf/Lighthouse gates, content/spec parity report, docs/ADRs |

## 5. Agent playbook (proven in this repo)

Use **three parallel specialists** when the task spans math, architecture and UI; give each a disjoint write scope and freeze shared files for readers.

- **Mathematician (read-only):** audit `math-core.js` generators, `curriculum.js`, `lessons.js`, `formulas.js`, `curriculum-outline.js`. Method: seeded generation, independent recomputation from `math`, choice/explain invariants, HK/DSE conventions. Report P0/P1/P2 with file:line and concrete fix; state what was verified correct.
- **Architect (read-only):** inspect `app.js`, `sw.js`, `index.html`, tests, CI. Deliver decision-oriented memo: concrete state/routing model, build strategy (esbuild single IIFE), SW lifecycle, a11y architecture, contract tests, 30/60/90 plan. Say what NOT to do.
- **Coder (sole writer):** scope e.g. `app.js, index.html, style.css, tests/ui.test.js`. Implement, add jsdom tests, run all three suites 5×, report files/tests/counts, leave uncommitted for the lead to review/commit.

Coordination rules:
1. Declare write scopes in the prompt; readers must not edit.
2. Freeze math/content files while the mathematician audits; freeze UI files while the coder works.
3. Lead reviews diffs, runs suites, commits by scope (math, a11y, PWA, CI) and pushes once.
4. No agent commits; no parallel writes to the same file.

## 6. Release checklist

```powershell
cd C:\Users\Carlos\Documents\deepseek-harness\math
node --check app.js
node --check math-core.js
node tests/core.test.js
node tests/ui.test.js
node tests/generators.test.js
git status --short            # expect only intended files
git add -A; git commit -m "…"
git push origin main          # needs credential store; run outside sandbox if needed
```

Then: wait for the `tests` workflow (GitHub Actions) to go green, confirm Pages deployed, hard-refresh the live site. Bump the SW cache whenever shipped assets change (currently `math-garden-v10`); if the build pipeline lands, this becomes generated.

## 7. Bootstrap prompt for the new session

> Read `docs/PLAN.md` in `C:\Users\Carlos\Documents\deepseek-harness\math` first; it is the authoritative handoff. Phase 1 (routing & resume) is landed — do not redo it. Then continue with **Phase 2 — Contract tests**: add the MATH_SPEC `type(+mode) → answerFromMath` table and delete the duplicated `computeAnswer`; add the `sanitizeProgress` schema fuzz, the asset manifest check, i18n parity, solver-coverage and content-parity tests. Keep all three suites green (and CI ≤ 10 s), add tests for every new contract, then commit by scope and push. Keep the existing innerHTML renderer and file:// support.

## 8. Key references

- Engine: `math-core.js` — `GENERATORS`, `SOLVERS`, `generateProblem`, `generateSet`, `explain`, `sanitizeProgress`, `mathSig`.
- UI/state: `app.js` — `state`, `show()`, `navigate()`, `parseHash/serializeRoute/resolveRoute/parentOf/currentRoute`, `readSession/saveSession/restoreSession`, `renderQuestion`, `startPractice/Quiz`, `finishExam`, `showModal/closeModal`, `registerSW`, `applyLang`.
- Content: `curriculum.js` (skills/types/levels), `lessons.js` (teaching text), `i18n.js` (UI strings), `formulas.js`, `curriculum-outline.js`.
- Tests: `tests/core.test.js` (oracle + invariants), `tests/generators.test.js` (contracts, pool floors, explain), `tests/ui.test.js` (jsdom flows, router/Back-Forward, session resume, a11y, keyboard).
- CI: `.github/workflows/tests.yml`; test deps: `tests/package.json` + `tests/package-lock.json`.
