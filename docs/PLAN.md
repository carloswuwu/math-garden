# Math Garden — handoff plan (for a fresh session)

> **Purpose.** This file is the single source of truth for continuing work on the Math Garden PWA in a new conversation. It records the current state, the architecture, what was just fixed, the open debt, and the executable plan (with acceptance criteria and agent prompts). Read this first; do not re-derive the architecture from scratch.

## 0. Snapshot

| Item | Value |
|---|---|
| Repo | `C:\Users\Carlos\Documents\deepseek-harness\math` |
| Branch / HEAD | `main` @ `efb2c3e` (Phase 2 landed; docs commit on top) |
| Live | https://carloswuwu.github.io/math-garden/ (GitHub Pages, deploy from `main` root) |
| CI | `.github/workflows/tests.yml` — four node suites on every push/PR |
| Content | 14 stages, **111 skills**, 102 lessons, 127 type entries, **85 generator types**; Pre-K → university |
| Code size | `math-core.js` 4,062 lines · `app.js` 2,274 · `curriculum.js` 1,086 · `lessons.js` 597 · `style.css` 729 · `formulas.js` 91 |
| Tests | core **574,377** assertions · ui **189** · generators **116,818** · contract **9,649** (111 skills) |
| Persistence | progress schema **v2** (`mathpath.progress`), legacy v1 key migrated, sanitized import |
| In-flight session | `sessionStorage['mathpath.session.v1']` (24 h TTL, practice/quiz/exam only, never in progress) |
| Offline | SW cache `math-garden-v11`, 20 KaTeX woff2 precached, nav-only shell fallback |
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

### Landed in this cycle: Phase 2 — contract tests (do not re-report)

14. `MATH_SPEC` beside `GENERATORS`: `math.op → answerFromMath(math)` with mode branches, deriving the answer from `p.math` only. `MathCore.answerFromMath` + `generateProblem({selfCheck:true})`; the duplicated `computeAnswer` is deleted from `tests/core.test.js` (oracle now single-owner).
15. `sanitizeProgress` fuzz (400 random payloads): never throws, extraction caps hold (500 skills / 60 typeAcc / 20 lastProblems / 100 stageExams), JSON round-trip → re-sanitize is idempotent, 1 MB payload handled; the UI import path rejects >1 MB with a localized message and a valid import still works.
16. New `tests/contract.test.js` (no jsdom, ~10k assertions): MATH_SPEC self-check over every curriculum type/mode, asset manifest (HTML refs / manifest icons / SW precache relative + present), i18n parity (`t()` literals zh+en, every skill name/goal/lesson, no CJK in en prompts/hints), solver coverage (no null steps; last step states the displayed answer), formula/skill parity.
17. `explain()` extended to cover count, compare, comparegroup, fraction, missing and the add/sub/mul/two-step word modes — every type reachable from “看一步步示範” now returns steps ending in the displayed answer.
18. `formulas.js` items now carry the supported skill ids; a `FORMULA_SKILL_TYPES` contract ensures every skill whose type is promised by the sheet is tagged, and tags resolve to playable skills.
19. CI runs four suites (local total ≈5 s); `npm test --prefix tests` matches CI.

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
tests/              core.test.js, ui.test.js (jsdom), generators.test.js, contract.test.js, serve.js
```

**Contracts (informal but load-bearing):**
- `Problem { type, prompt{zh,en}, visual, answer, choices, math, hint, sig, solution? }`.
- Consumers of `math`: choice builder, `mathSig`, `explain/SOLVERS`, `renderVisual`, `MathCore.answerFromMath` (MATH_SPEC), and the test suites. Any new mode must satisfy all of them.
- `MATH_SPEC` (beside `GENERATORS`): `math.op → answerFromMath(math)` with per-mode branches; it re-derives the expected answer from `p.math` **only** (never reads `p.answer`) and is the single oracle. `generateProblem({selfCheck:true})` throws on a mismatch, `tests/core.test.js` uses it instead of its old `computeAnswer`, and `tests/contract.test.js` checks every curriculum type/mode.
- Progress: `{version:2, lang, sound, theme, stars, streak, badges, skills, stageExams}`; `MathCore.sanitizeProgress()` is the only writer path (fuzzed: never throws, caps 500/60/20/100, JSON round-trip idempotent, 1 MB payload safe).
- Navigation: pure `parseHash(hash)`/`serializeRoute(route)` + `parentOf(route)`/`currentRoute()`; `resolveRoute()` validates against `Curriculum` and unlock rules (unknown → home, locked → nearest ancestor). `show(screen)` toggles `hidden`, syncs the hash (replace on re-render / push on screen change), moves focus to the heading and announces via `#announcer`. `hashchange`/`popstate` re-render from the URL; all click entries go through `navigate(route)` so the error boundary in `renderRouteSafely()` applies. Hash routes only — path routes would 404 on Pages reload and break `file://`.
- In-flight session: `sessionStorage['mathpath.session.v1']` for practice/quiz/exam; `readSession()/saveSession()/clearSession()/restoreSession()`; home Continue card. It is never written to the progress schema.
- Content parity: every `formulas.js` item carries `skills` (real playable skill ids); `FORMULA_SKILL_TYPES` in `tests/contract.test.js` lists the types the sheet promises, and every skill using one of those types must be tagged.

**Verification commands**

```powershell
cd C:\Users\Carlos\Documents\deepseek-harness\math
node tests/core.test.js        # engine, MATH_SPEC oracle, schema fuzz
node tests/ui.test.js          # jsdom UI behaviour, router/resume
node tests/generators.test.js  # generator/explain/content contracts
node tests/contract.test.js    # MATH_SPEC, assets, i18n, solver coverage, formulas
node --check app.js; node --check math-core.js
```

CI additionally does `npm ci --prefix tests` then the four suites (~5 s local total).

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
- **Error boundary/observability:** route renders are wrapped (`renderRouteSafely`) but a failure inside a direct event handler still surfaces via the console; no global `window.onerror` handler or telemetry.
- **A11y remainder:** informative SVG visuals have no text alternative; background not `inert` when dialog open; targets are 42 px (WCAG suggests 44); no `tests/a11y.test.js`/axe subset.
- **Formula content depth:** the sheet is tagged and parity-tested now, but the omissions in the Mathematics list (median, GP `r ≠ 1`, AP sum, log base/domain, binomial `r` convention) are still open; only the declared `FORMULA_SKILL_TYPES` are promised covered, and skill tags are hand-curated.
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

**Acceptance met:** Back/Forward works home→stage→lesson; reload mid-quiz restores same question/index/results; invalid or locked links redirect; all suites green; no route state added to progress schema. Covered by ui assertions 19–27.

**Do not:** add a router library; use `history.pushState` path routes (Pages 404s on reload, file:// breaks); put quiz problems in progress; auto-resume stale sessions; push history on every re-render.

### Phase 2 — Contract tests — ✅ landed (`a96a5a2` engine/tests, `efb2c3e` contract/formulas)

Implemented as sketched:
1. **MATH_SPEC:** one table beside `GENERATORS` mapping `math.op` (+ mode branches inside each function) to the derived answer; `answerFromMath(problem)` is the single oracle. `generateProblem({selfCheck:true})` uses it as a dev self-check, `tests/core.test.js` imports it, and the old `computeAnswer`/`applyOp` duplicate is gone.
2. **Schema fuzz:** in `tests/core.test.js` — 400 seeded random JSON payloads through `sanitizeProgress` (never throws, JSON round-trip cleaning idempotent, caps asserted), over-cap truncation asserted, and a >1 MB payload handled. UI import rejects >1 MB; valid import covered.
3. **Asset manifest:** `tests/contract.test.js` checks every relative `src`/`href` in `index.html`, every manifest icon, and every `sw.js` precache entry exists on disk and is relative, with no SW duplicates and no HTML/manifest reference missing from precache.
4. **i18n parity:** every `t('…')` literal (prefix forms like `t('colors.' + c)` included) resolves in zh+en; every playable skill has zh/en name+goal and a lesson with intro/example/tip; generated en prompts/hints contain no CJK. Fixed the one dangling key (`parent.importedTooLarge`).
5. **Solver coverage:** every curriculum type/mode returns zh+en steps with no empty string; the last step states the displayed answer (localized labels for direction/centre/colour answers; case-insensitive for English labels). Added solvers for count, compare, comparegroup, fraction, missing and word add/sub/mul/two-step.
6. **Content parity:** every formula item carries `skills`; tags must be playable skills, and every skill whose type is listed in `FORMULA_SKILL_TYPES` must be tagged somewhere. “Curriculum types ⊆ explainable” is enforced through the solver-coverage loop (SOLVERS + `explain()` fallback together).

Decisions / deviations from the sketch:
- The table is keyed by `math.op` (type + mode collapses to the op a generator emits) rather than by literal type name; completeness is enforced over all 85 `GENERATOR_TYPES` instead.
- The “types ⊆ SOLVERS” check is expressed as full `explain()` coverage, because many types are intentionally handled by the fallback switch rather than a dedicated `SOLVERS` entry.
- Formula coverage is a declared type list (`FORMULA_SKILL_TYPES`, 26 types), not every skill: the sheet does not document e.g. counting, place value or fraction arithmetic; the residual formula depth debt is listed in §3.

**Acceptance met:** no duplicated `computeAnswer` remains and coverage grew (core 571,764 → 574,377 assertions; ui 183 → 189; generators 111,680 → 116,818; contract 9,649 new). Four suites total ≈5 s locally, so CI stays well under 10 s.

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
| 0–30 d | **Phase 1 routing & resume (landed)**; **Phase 2 contract tests (landed)**; SW font precache + safe fallback (done); Phase 4 a11y test boot + ARIA string centralization |
| 31–60 d | Phase 3 esbuild A–B, generated SW, hashed assets, update banner; result routes / history polish for finished runs |
| 61–90 d | Phases C–E modular split, text alternatives, perf/Lighthouse gates, formula depth fixes, docs/ADRs |

## 5. Agent playbook (proven in this repo)

Use **three parallel specialists** when the task spans math, architecture and UI; give each a disjoint write scope and freeze shared files for readers.

- **Mathematician (read-only):** audit `math-core.js` generators, `curriculum.js`, `lessons.js`, `formulas.js`, `curriculum-outline.js`. Method: seeded generation, independent recomputation from `math`, choice/explain invariants, HK/DSE conventions. Report P0/P1/P2 with file:line and concrete fix; state what was verified correct.
- **Architect (read-only):** inspect `app.js`, `sw.js`, `index.html`, tests, CI. Deliver decision-oriented memo: concrete state/routing model, build strategy (esbuild single IIFE), SW lifecycle, a11y architecture, contract tests, 30/60/90 plan. Say what NOT to do.
- **Coder (sole writer):** scope e.g. `app.js, index.html, style.css, tests/ui.test.js`. Implement, add jsdom tests, run all four suites 5×, report files/tests/counts, leave uncommitted for the lead to review/commit.

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
node tests/contract.test.js
git status --short            # expect only intended files
git add -A; git commit -m "…"
git push origin main          # needs credential store; run outside sandbox if needed
```

Then: wait for the `tests` workflow (GitHub Actions) to go green, confirm Pages deployed, hard-refresh the live site. Bump the SW cache whenever shipped assets change (currently `math-garden-v11`); if the build pipeline lands, this becomes generated.

## 7. Bootstrap prompt for the new session

> Read `docs/PLAN.md` in `C:\Users\Carlos\Documents\deepseek-harness\math` first; it is the authoritative handoff. Phases 1 (routing & resume) and 2 (contract tests) are landed — do not redo them. Then continue with **Phase 3 — Build + SW lifecycle**: use esbuild (not Vite) to bundle the existing seven scripts in load order into one hashed IIFE `dist/app.<hash>.js` with zero source edits while keeping vendor KaTeX as a classic script and preserving file:// support; generate `sw.js` precache + cache name from the build manifest; add the “new version” chip (no auto-reload) and point `play-math.bat`/Pages at `dist/`. Keep all four suites green (CI ≤ 10 s), commit by scope and push, then confirm CI and Pages. Do not introduce path-based routes or a module-only build that breaks double-click.

## 8. Key references

- Engine: `math-core.js` — `GENERATORS`, `MATH_SPEC`, `answerFromMath`, `SOLVERS`, `generateProblem` (`{selfCheck}`), `generateSet`, `explain`, `sanitizeProgress`, `mathSig`.
- UI/state: `app.js` — `state`, `show()`, `navigate()`, `parseHash/serializeRoute/resolveRoute/parentOf/currentRoute`, `readSession/saveSession/restoreSession`, `renderQuestion`, `startPractice/Quiz`, `finishExam`, `showModal/closeModal`, `registerSW`, `applyLang`.
- Content: `curriculum.js` (skills/types/levels), `lessons.js` (teaching text), `i18n.js` (UI strings), `formulas.js` (items tagged with `skills`), `curriculum-outline.js`.
- Tests: `tests/core.test.js` (MATH_SPEC oracle + invariants + schema fuzz), `tests/generators.test.js` (contracts, pool floors, explain), `tests/ui.test.js` (jsdom flows, router/Back-Forward, session resume, a11y, keyboard, import), `tests/contract.test.js` (MATH_SPEC self-check, assets, i18n, solver coverage, formulas).
- CI: `.github/workflows/tests.yml`; test deps: `tests/package.json` + `tests/package-lock.json`.
