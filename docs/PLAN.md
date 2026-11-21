# Math Garden — handoff plan (for a fresh session)

> **Purpose.** This file is the single source of truth for continuing work on the Math Garden PWA in a new conversation. It records the current state, the architecture, what was just fixed, the open debt, and the executable plan (with acceptance criteria and agent prompts). Read this first; do not re-derive the architecture from scratch.

## 0. Snapshot

| Item | Value |
|---|---|
| Repo | `C:\Users\Carlos\Documents\deepseek-harness\math` |
| Branch / HEAD | `main` @ `6422371` (Phase 3 A–B, assessment-depth tranche and Phase 4 a11y landed; docs commit on top) |
| Live | https://carloswuwu.github.io/math-garden/ — legacy branch deploy (repo root) is live; `.github/workflows/pages.yml` publishes `dist/` once Settings → Pages → Source is switched to “GitHub Actions” (one-time manual step) |
| CI | `.github/workflows/tests.yml` — build, stale-`dist` check, then five node suites on every push/PR |
| Content | 14 stages, **111 skills**, 102 lessons, 127 type entries, **85 generator types**, `word` now has 20 modes (10 basic + 10 multi-step); Pre-K → university |
| Code size | `math-core.js` 4,728 lines · `app.js` 2,378 · `curriculum.js` 1,086 · `lessons.js` 597 · `style.css` 746 · `formulas.js` 91 · `i18n.js` 269 |
| Build | `tools/build.js` (177) + `tools/sw-template.js` (104), esbuild 0.28.2 → `dist/app.19c1f12f4a1f.js` **308.7 KB raw / 93.5 KB gzip**, generated `dist/sw.js`; `dist/` is committed and CI fails on drift |
| Tests | core **575,422** assertions · ui **206** · generators **130,693** · contract **10,725** · a11y **172** (111 skills; five suites ≈30 s locally incl. axe) |
| A11y | one h1 per screen + `aria-labelledby`, focus-to-heading + live-region announcements, accessible names on all controls, modal background `inert`/`aria-hidden`, generated `role="img"` text alternatives for question visuals, 44 px icon targets, ARIA strings in `i18n.js`, axe-core 4.10.2 jsdom subset (0 violations on 10 screens) |
| Persistence | progress schema **v2** (`mathpath.progress`), legacy v1 key migrated, sanitized import |
| In-flight session | `sessionStorage['mathpath.session.v1']` (24 h TTL, practice/quiz/exam only, never in progress) |
| Offline | `dist/sw.js` generated cache `math-garden-<buildHash>`: 30 precache entries incl. 20 KaTeX woff2, nav network-first → cached shell, immutable assets cache-first, user-confirmed “new version” chip (root legacy `sw.js` stays v12 until the Pages switch) |
| Local preview | `$env:PORT=8080; node tests/serve.js` → http://localhost:8080 (dev entry) and http://localhost:8080/dist/ (built app) |
| Dev env | Windows, PowerShell 5.1, Node 20; build deps at repo root, test deps in `tests/` (both with lockfiles) |

## 1. Product & content state

- Static offline-first PWA, no backend, no accounts, no telemetry. Kid-safe by design.
- Ship shape: source stays seven ordered classic scripts for dev/file://; `tools/build.js` bundles them (esbuild, minified IIFE) into `dist/app.<buildHash>.js` with a generated `dist/index.html` + `dist/sw.js`. `dist/` is committed and CI-verified for drift.
- Curriculum is data: `curriculum.js` (stages → topics → skills, types/levels/mastery) and `lessons.js` (bilingual lesson per lesson key).
- Engine: seeded generators, choice building, answer equivalence (fractions by value), mastery/adaptive selection, `explain()` worked solutions.
- UI: screen switching over `<section hidden>`, `innerHTML` rendering, hand-made paper/storybook CSS, dark chalkboard theme.
- Recent content depth: S4 discriminant + nature of roots, line equations, circle properties; S5 GP sums, IQR; S6 two-dice/complement probability, general binomial; university calculus (derivative value/integral), 2×2 matrices, expectation/binomial.
- Assessment: 10-item skill quiz (≥80% = 2 stars = mastered), 20-item stage exam (≥90% unlocks next stage), adaptive difficulty rises after 3 consecutive correct. Composition now guarantees full length with no identical repeats, caps template reuse and mixes difficulty levels (see Phase 3.5).
- Word problems: 20 `word` modes — 10 basic/one-step and 10 multi-step cross-topic archetypes (unit price, change with two items, reverse discount, batch profit, ratio difference, rate scaling, flooring cost, missing test score, price-list change, reverse equation), 8 names × 10 item contexts and several prompt templates; stage-level op tables from g3 to hs6.

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

### Landed in this cycle: Phase 3 A–B — build + SW lifecycle (do not re-report)

20. `tools/build.js`: deterministic build (all text inputs LF-normalized, esbuild version folded into the content hash) that pulls the seven scripts in load order through `esbuild.transformSync` into one minified IIFE `dist/app.<hash>.js`; `dist/index.html` keeps KaTeX as a classic script and only references the bundle; vendor copy is limited to `katex.min.js`, `katex.min.css` and the 20 woff2 fonts. Committed `dist/`; CI runs the build and fails when `git status --porcelain -- dist` is dirty. Bundle 281 KB raw / 85.6 KB gzip (advisory limit 120 KB).
21. `tools/sw-template.js` + build: generated `dist/sw.js` with cache name `math-garden-<buildHash>` and a precache list derived from the build manifest (30 entries; no manual list or version). Strategy: navigation network-first with timeout → cached shell; versioned app bundle and KaTeX fonts cache-first; other same-origin network-first with `Response.error()` on miss; install uses `Promise.allSettled` and does **not** auto-`skipWaiting`.
22. Update UX: app receives `SKIP_WAITING`-aware waiting workers, shows a localized “新版本 · 重新載入” chip (`#updateChip`), posts `{type:'SKIP_WAITING'}` on confirm and reloads on `controllerchange`; the settings force-update action is kept. Covered by jsdom tests (chip + postMessage) and the generated-SW contract checks.
23. `.github/workflows/pages.yml` builds and deploys `dist/` when the repo Pages source is “GitHub Actions”; it detects the legacy branch source and warns/skips instead of failing. `play-math.bat` prefers `dist/index.html`. Root dev entry, root `index.html` and legacy root `sw.js` (v12) remain for the current branch deployment and `file://` development.
24. `tests/ui.test.js` dist smoke test loads the built bundle in jsdom (KaTeX + bundle only, all globals, home render, routing, chip element); `tests/contract.test.js` validates dist self-consistency (build meta/filename, relative refs, generated SW cache/precache/update protocol, gzip budget).

### Landed in this cycle: assessment depth & word problems (mathematician audit)

25. A read-only professional-mathematician audit (`docs/PLAN.md` request) quantified the complaint: 101/111 skills had a single level (adaptive difficulty dead from g4 up); `buildQuiz`'s 3-item exact-`sig` window allowed exact repeats from item 5 and silently returned **3** items for the `congruent`/`approx` pools; 10-item quizzes had up to 10 items on one template for `g3.multable`, `hs.s4.quadsolve`, `hs.s5.ap`, `ms.s3.prob`; exams repeated heavily (college up to 86%).
26. Engine: `templateSig`/`contextSig` (numbers blanked, mode/context kept) + `composeSet`/`composeExam` — a quiz/exam always returns the full 10/20 items, never repeats an identical item, caps template/context reuse and per-skill exam share, and prefers varied templates; `generateSet` stays exact-unique. `levelFor` forwards **all** level options (modes/nMax/sign/…) instead of a whitelist; practice `nextProblem` avoids the current session's templates.
27. Difficulty: quiz starts at difficulty step ≥1 for multi-level skills; exams use the top level for ~2/3 of items and the learner's step for the rest; new 3-level ladders for percentages (reverse/change), ratio (share/three-part), arithmetic sequences (sum/find-n) and statistics (mean); word skills g3–hs6 gained stage-appropriate two-level op tables.
28. Word problems: 10 new multi-step cross-topic archetypes (unit price, two-item change, reverse discount, batch profit, ratio difference, rate scaling, flooring cost, missing test score, price-list change, reverse equation), all with integer answers, MATH_SPEC + explain last-step answer + plausible distractors; 8 names × 10 item contexts and several prompt templates for add/sub/mul/div (and multiplication/division drills) so drills no longer read as the same sentence with different numbers.
29. Measured impact (20 seeded quiz sets per skill): every skill now yields 10/10 unique items; word quizzes reach 10/10 distinct math templates (was 3–6.6); arithmetic drill prompts reach ~3.8 distinct wordings; every one of the 14 stages builds a 20-item exam with 20 unique items. Bundle grew to 91.8 KB gzip (still under 120 KB advisory).
30. Suites: core **575,422** (+template/composition invariants), generators **130,693** (new modes + ladders), contract **10,725** (typeIndex sampling now covers duplicate type specs, deep ops reachable through curriculum, stage-exam uniqueness), ui **206** (fixed-seed quiz/exam composition).
31. Audit remainder (P1/P2, not done): the other ~89 single-level skills' ladders; remaining word archetypes (percentage-chain, box/remainder, unit conversion, 3-part modelling); `mastery.quizPass` is dead config and 2-star gate is hard-coded 0.8; practice credits a correct answer after a wrong click; tiny pools (`congruent`/`approx`/`direction`) still repeat structurally; college exam has only 3 skills; per-mode `typeAcc`.

### Landed in this cycle: Phase 4 — accessibility remainder

32. Heading structure: every screen has exactly one `h1` (practice/quiz/exam titles are `h1`, result cards use `h1`; topbar title is an `h2`), each screen `<section>` gets `aria-labelledby` pointing at its heading, and `show()` focuses that heading and announces it via `#announcer`.
33. ARIA strings in `i18n.js` (`a11y.*`: skip link, back/settings/stars labels, choice template) and re-applied on language change; skip link has an id; language switch keeps `<html lang>` and labels in sync.
34. Modal dialogs set `#main`, `#topbar`, `#updateChip` and `#skipLink` to `inert` + `aria-hidden` while open and restore them on close (focus trap/restore/Esc unchanged); icon buttons are 44×44; prefer-reduced-motion untouched.
35. Every `renderVisual` diagram exposes a generated localized `role="img"` + `aria-label` text alternative (`visualAlt`, all 31 kinds, counts/values included); unlabelled kinds fall back to `aria-hidden`.
36. New `tests/a11y.test.js` (172 assertions, 11 screen states) plus axe-core 4.10.2 restricted to jsdom-supported rules (aria-*, button-name, duplicate-id, label/link-name, role-img-alt, page-has-heading-one): 0 violations over 10 navigated screens. Wired into `npm test` and CI (five suites, ≈30 s local including axe).

## 2. Architecture map

```
SOURCE (dev, file://, tests load these directly)
index.html  (7 ordered <script> globals + KaTeX vendor)  ← dev entry
  ├─ math-core.js   pure engine: GENERATORS, MATH_SPEC, choices, checking, mastery, explain/SOLVERS
  ├─ curriculum.js  content graph (stages/topics/skills)
  ├─ lessons.js     lesson text keyed by lesson id
  ├─ i18n.js        UI strings (zh/en)
  ├─ formulas.js, curriculum-outline.js   reference data
  ├─ vendor/katex   math rendering (JS/CSS/woff2)
  └─ app.js         state, screens, rendering, storage, dialogs, keyboard, SW registration/update chip
sw.js               legacy branch-deploy SW (v12); superseded by generated dist/sw.js

BUILD (tools/build.js, esbuild)
dist/index.html     generated: KaTeX classic script + single app.<buildHash>.js
dist/app.<hash>.js  minified IIFE of the seven scripts in order
dist/sw.js          generated from tools/sw-template.js (cache/precache from build manifest)
dist/style.css, manifest, icons, vendor/katex (woff2 only), .nojekyll
package.json/lock   esbuild; tools/  build scripts
tests/              core, ui (jsdom), generators, contract, serve.js
```

**Contracts (informal but load-bearing):**
- `Problem { type, prompt{zh,en}, visual, answer, choices, math, hint, sig, solution? }`.
- Consumers of `math`: choice builder, `mathSig`, `explain/SOLVERS`, `renderVisual`, `MathCore.answerFromMath` (MATH_SPEC), and the test suites. Any new mode must satisfy all of them.
- `MATH_SPEC` (beside `GENERATORS`): `math.op → answerFromMath(math)` with per-mode branches; it re-derives the expected answer from `p.math` **only** (never reads `p.answer`) and is the single oracle. `generateProblem({selfCheck:true})` throws on a mismatch, `tests/core.test.js` uses it instead of its old `computeAnswer`, and `tests/contract.test.js` checks every curriculum type/mode.
- Progress: `{version:2, lang, sound, theme, stars, streak, badges, skills, stageExams}`; `MathCore.sanitizeProgress()` is the only writer path (fuzzed: never throws, caps 500/60/20/100, JSON round-trip idempotent, 1 MB payload safe).
- Navigation: pure `parseHash(hash)`/`serializeRoute(route)` + `parentOf(route)`/`currentRoute()`; `resolveRoute()` validates against `Curriculum` and unlock rules (unknown → home, locked → nearest ancestor). `show(screen)` toggles `hidden`, syncs the hash (replace on re-render / push on screen change), moves focus to the heading and announces via `#announcer`. `hashchange`/`popstate` re-render from the URL; all click entries go through `navigate(route)` so the error boundary in `renderRouteSafely()` applies. Hash routes only — path routes would 404 on Pages reload and break `file://`.
- In-flight session: `sessionStorage['mathpath.session.v1']` for practice/quiz/exam; `readSession()/saveSession()/clearSession()/restoreSession()`; home Continue card. It is never written to the progress schema.
- Content parity: every `formulas.js` item carries `skills` (real playable skill ids); `FORMULA_SKILL_TYPES` in `tests/contract.test.js` lists the types the sheet promises, and every skill using one of those types must be tagged.
- Build: `dist/` is generated and committed; CI rebuilds and requires a clean tree under `dist/`. `dist/sw.js` cache name/precache must match the build hash and the actual dist file list. The SW is the only file allowed to bypass the manifest — update UX depends on no auto-`skipWaiting`.
- Assessment composition: `MathCore.templateSig(problem)` (math shape with numerals blanked) / `contextSig` (prompt shape) are the diversity keys; `composeSet(skill, count, opts)` and `composeExam(skills, count, opts)` guarantee the requested length with no identical repeats, cap template/context reuse and exam per-skill share. `levelFor` forwards **every** level option (not a whitelist); app quiz uses step ≥1 for multi-level skills and exams use top level for ~2/3 of items. `word` has 20 modes; every new mode needs MATH_SPEC + explain + distractor handling + contract coverage (`tests/contract.test.js` asserts all deep ops are reachable through curriculum `ops`).
- Accessibility: exactly one `h1` per screen and `aria-labelledby` on the screen section; `show()` focuses/announces the heading; all controls have accessible names; dialog background is `inert` + `aria-hidden`; question diagrams are `role="img"` with generated `aria-label` text alternatives; ARIA strings live in `i18n.js` (`a11y.*`); `tests/a11y.test.js` runs the jsdom/axe subset.

**Verification commands**

```powershell
cd C:\Users\Carlos\Documents\deepseek-harness\math
npm ci                              # build deps (esbuild)
npm run build                       # regenerate dist/
git status --porcelain -- dist      # must be empty before committing
node tests/core.test.js             # engine, MATH_SPEC oracle, schema fuzz
node tests/ui.test.js               # jsdom UI behaviour, router/resume, dist smoke
node tests/generators.test.js       # generator/explain/content contracts
node tests/contract.test.js         # MATH_SPEC, assets, i18n, solvers, formulas, dist/SW
node tests/a11y.test.js             # headings/labels/focus/inert/lang/visual alt + axe subset
node --check app.js; node --check math-core.js
```

CI additionally does `npm ci`, the build, the stale-`dist` check, `npm ci --prefix tests`, then the five suites (~30 s local total, dominated by axe).

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
- **Build remainder:** Stage A–B are done (deterministic single-IIFE bundle, generated SW/precache, hashed asset, committed dist, Actions Pages workflow). The source modules are still 7 order-dependent globals (no ESM/tree-shaking; KaTeX stays unpinned in-tree) — Stages C–E (ESM modules, split core/app, drop globals) remain as Phase 5.
- **Pages switch:** the repo’s Pages source is still “Deploy from a branch”, so the legacy root deployment is what is live; `pages.yml` only publishes `dist/` after a one-time Settings → Pages → Source = “GitHub Actions” change. Until then the root `sw.js` (v12, manual list) remains the legacy SW.
- **SW lifecycle remainder:** generated dist SW is user-confirmed but has no periodic update poll beyond registration/`reg.update()` on load; the legacy root SW still auto-`skipWaiting`.
- **Difficulty/word-problem remainder (P1/P2, from the mathematician audit):** ~89 skills still have a single difficulty level; remaining word archetypes (percentage chains, unit conversion, remainder/box problems, 3-part modelling); `mastery.quizPass` is dead config (2-star gate hard-coded 0.8); practice still credits a correct answer after a wrong click; tiny pools (`congruent`/`approx`/`direction`) remain structurally repetitive; college exam spans only 3 skills; `typeAcc` is per type rather than per mode.
- **i18n split:** UI strings in `i18n.js`, item/lesson strings hardcoded `{zh,en}` in generators/lessons; ARIA strings inline in `app.js`.
- **Error boundary/observability:** route renders are wrapped (`renderRouteSafely`) but a failure inside a direct event handler still surfaces via the console; no global `window.onerror` handler or telemetry.
- **A11y remainder (P2):** generated diagram text alternatives are informative but not a full description (a documented “text mode” is still not offered); no real-browser axe/Lighthouse pass (the suite uses jsdom + a restricted axe rule set); contrast/layout and heading-order are not gated; the skip link is not re-labelled when a dialog is open (dialog focus trap covers it).
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

### Phase 3 — Build + SW lifecycle — ✅ A–B landed (`3f3b2a8` build/pwa, `a488c02` tests; C–E folded into Phase 5)

Implemented:
1. **esbuild, not Vite:** `tools/build.js` bundles the seven ordered scripts into one minified IIFE `dist/app.<buildHash>.js` with zero source edits (concatenation order preserved; KaTeX stays a separate classic script in `dist/index.html`). Deterministic: LF-normalized text inputs + esbuild version in the hash; committed dist; CI rebuilds and rejects drift. Vendor copy limited to KaTeX JS/CSS + 20 woff2. Bundle 281 KB raw / **85.6 KB gzip**.
2. **Generated SW:** `tools/sw-template.js` + build emit `dist/sw.js` with `CACHE = math-garden-<buildHash>` and a precache list derived from the build manifest (30 entries, sorted, relative). Navigation network-first → cached shell; versioned bundle + KaTeX fonts cache-first; other same-origin network-first; miss → `Response.error()`; install uses `Promise.allSettled` and does **not** auto-`skipWaiting`.
3. **Update UX:** `#updateChip` appears localized when a waiting worker exists, posts `{type:'SKIP_WAITING'}`, then reloads on `controllerchange`; Settings force-update kept. jsdom tests cover chip visibility/message; contract tests cover the SW protocol.
4. **Deploy:** `play-math.bat` prefers `dist/index.html`; `.github/workflows/pages.yml` builds + uploads dist and deploys only when the Pages source is “GitHub Actions”, otherwise warns/skips (legacy branch deployment stays live). Root dev entry and legacy root `sw.js` (bumped to v12 for the current branch deployment) remain.

Decisions / deviations:
- “Pages publishes dist/” is wired but requires a one-time repo Settings switch (not expressible in git); until then the root branch deployment remains and is updated by the network-first root SW.
- “Cold offline start works” is covered by construction/contracts (complete precache incl. shell, navigation fallback, cache-first immutable assets, dist smoke in jsdom) rather than a real browser SW test — a manual offline/Lighthouse check is still listed below.
- Stages C–E (ESM conversion, module split, dropping globals) move to Phase 5 by design; Stage A–B deliberately keeps zero source edits.

**Acceptance:** stale-dist check + four suites in CI (≈5 s local); no manual precache list/cache version in the shipped artifact; update chip verified in jsdom; bundle gzip under the 120 KB advisory. Remaining manual checks: switch Pages source to Actions then confirm the deployed `dist/` and a cold offline start in a real browser.

### Phase 3.5 — Assessment depth & word problems — ✅ landed (mathematician audit; `9e0508d` engine/content, `be24636` tests, `56bdd85` dist)

Driven by a read-only professional-mathematician audit of difficulty, duplication and word-problem depth (see items 25–31 above for findings/impact). Shipped:
1. **Composition:** `templateSig`/`contextSig` + `composeSet`/`composeExam`; full 10/20-item sets, no identical repeats, template/context caps, exam per-skill cap; narrow pools now repeat instead of silently under-filling.
2. **Difficulty:** all level options forwarded by `levelFor`; quiz/exam step policy raised; 3-level ladders for percent/ratio/AP/stats; two-level word tables for g3–hs6.
3. **Word problems:** 10 new multi-step integer-answer archetypes with MATH_SPEC/explain/distractors; 8×10 contexts; prompt variants for basic arithmetic/multiplication/division.
4. **Verification:** composition/diversity/word-depth contracts in core, generators and contract suites plus fixed-seed ui composition tests; dist rebuilt (91.8 KB gzip).

Remaining P1/P2 from the audit (items 31, 89 single-level skills, remaining archetypes, mastery.quizPass dead config, practice credit, tiny pools, college exam width) are queued behind the a11y phase unless reprioritised.

### Phase 4 — Accessibility remainder — ✅ landed (`1a9c312` feature, `a45d6af` tests/CI, `6422371` dist)

Implemented:
1. **Structure:** exactly one `h1` per screen (practice/quiz/exam title, result cards and error card use `h1`; topbar title is an `h2`), `aria-labelledby` set by `show()` on the active `<section>`, focus moved to that heading and the title announced via `#announcer`.
2. **Names & strings:** every visible button/switch has an accessible name; choice names/static labels/skip link moved to `i18n.js` (`a11y.*`) and re-applied on language change (`applyLang`).
3. **Dialogs:** `showModal` sets `#main`/`#topbar`/`#updateChip`/`#skipLink` `inert` + `aria-hidden`; `closeModal` restores them; focus trap/Esc/restore unchanged.
4. **Visuals:** `renderVisual` gives every diagram a localized `role="img"` + `aria-label` text alternative (all 31 kinds, counts/values included); unlabelled kinds fall back to `aria-hidden`. 44×44 icon targets.
5. **Tests:** `tests/a11y.test.js` (172 assertions, 11 screen states) plus axe-core 4.10.2 restricted to jsdom-supported rules — 0 violations over 10 screens; wired into `npm test` and CI (five suites).

Decisions / deviations:
- “Background inert” is applied to `main`/`topbar`/update chip/skip link rather than the whole `.app`, because the modal itself lives inside `.app`.
- Informative SVG diagrams get generated text alternatives from their `visual` data (a true “text mode” alternative remains P2).
- axe is limited to jsdom-supported rules and 10 rather than all possible routes; contrast/layout and a real-browser Lighthouse pass remain manual.
- Suites now take ≈30 s locally (axe dominates); CI still far under the 10-minute job budget.

**Acceptance met:** every screen has exactly one h1, every control is named, no duplicate ids or axe violations, focus/announcement on navigation, dialog background inert/restored, language switch keeps ARIA/`lang` in sync, diagrams have text alternatives, 44 px icon targets.

### Phase 5 — Modularization, performance, docs
- Split engine/content/UI into modules; keep the public API; one PR per module.
- Perf budgets: `generateSet(20)` p95, jsdom render time, bundle gzip, precache ≤ 1.2 MB; Lighthouse a11y ≥ 0.95 on deploy.
- `docs/architecture.md` + ADRs; move the Windows ACL script/tooling into `tools/`; update repo description.

### 30 / 60 / 90-day shape
| Window | Ship |
|---|---|
| 0–30 d | **Phase 1 routing & resume (landed)**; **Phase 2 contract tests (landed)**; **Phase 3 A–B build/SW/update chip (landed)**; **Phase 3.5 assessment depth & word problems (landed)**; **Phase 4 accessibility remainder (landed)** |
| 31–60 d | audit P1 content follow-ups (single-level ladders, remaining word archetypes, mastery.quizPass, practice credit, tiny pools, exam width); switch Pages source to Actions and verify dist deploy + cold offline; real-browser axe/Lighthouse pass |
| 61–90 d | Phase 5 Stages C–E modular split, perf/Lighthouse gates, formula depth fixes, docs/ADRs |

## 5. Agent playbook (proven in this repo)

Use **three parallel specialists** when the task spans math, architecture and UI; give each a disjoint write scope and freeze shared files for readers.

- **Mathematician (read-only):** audit `math-core.js` generators, `curriculum.js`, `lessons.js`, `formulas.js`, `curriculum-outline.js`. Method: seeded generation, independent recomputation from `math`, choice/explain invariants, HK/DSE conventions. Report P0/P1/P2 with file:line and concrete fix; state what was verified correct.
- **Architect (read-only):** inspect `app.js`, `sw.js`, `index.html`, tests, CI. Deliver decision-oriented memo: concrete state/routing model, build strategy (esbuild single IIFE), SW lifecycle, a11y architecture, contract tests, 30/60/90 plan. Say what NOT to do.
- **Coder (sole writer):** scope e.g. `app.js, index.html, style.css, tests/ui.test.js`. Implement, add jsdom tests, run all five suites 5×, report files/tests/counts, leave uncommitted for the lead to review/commit.

Coordination rules:
1. Declare write scopes in the prompt; readers must not edit.
2. Freeze math/content files while the mathematician audits; freeze UI files while the coder works.
3. Lead reviews diffs, runs suites, commits by scope (math, a11y, PWA, CI) and pushes once.
4. No agent commits; no parallel writes to the same file.

## 6. Release checklist

```powershell
cd C:\Users\Carlos\Documents\deepseek-harness\math
npm ci
npm run build
git status --porcelain -- dist        # must be empty (dist committed & current)
node --check app.js
node --check math-core.js
node tests/core.test.js
node tests/ui.test.js
node tests/generators.test.js
node tests/contract.test.js
node tests/a11y.test.js
git status --short                    # expect only intended files
git add -A; git commit -m "…"
git push origin main                  # needs credential store; run outside sandbox if needed
```

Then: wait for the `tests` workflow (GitHub Actions) to go green; if Pages source is “GitHub Actions”, confirm the `pages` workflow deployed `dist/`, then hard-refresh the live site and do a cold offline check. If it is still “Deploy from a branch”, the root deployment updates online without a manual SW bump; the generated `dist/sw.js` cache name comes from the build hash. `play-math.bat` runs the built app locally.

## 7. Bootstrap prompt for the new session

> Read `docs/PLAN.md` in `C:\Users\Carlos\Documents\deepseek-harness\math` first; it is the authoritative handoff. Phases 1 (routing & resume), 2 (contract tests), 3 A–B (esbuild bundle, generated SW, update chip), 3.5 (assessment depth & multi-step word problems from the mathematician audit) and 4 (accessibility remainder) are landed — do not redo them. Then continue with **Phase 5 — Modularization, performance, docs**: convert the data modules to ESM behind the unchanged `window.*` API, split `math-core.js` into `core/` modules and `app.js` into router/screens/dialog/visual/a11y modules, remove the seven-global script-order coupling while keeping the `file://` classic-script build working, add the perf budgets (`generateSet(20)` p95, jsdom render time, bundle gzip, precache ≤ 1.2 MB) and a real-browser Lighthouse/a11y check, then write `docs/architecture.md` + ADRs and update the repo description/metadata. If the user prioritises content instead, the mathematician audit's P1 list (item 31/§3: ~89 single-level skills, remaining word archetypes, `mastery.quizPass`, first-attempt practice credit, tiny pools, exam width) is the queue, and the one-time Pages source switch to “GitHub Actions” is still pending to actually publish `dist/`. Keep all five suites green, run `npm run build` and commit `dist/` whenever shipped sources change, commit by scope, push and confirm CI.

## 8. Key references

- Engine: `math-core.js` — `GENERATORS`, `MATH_SPEC`, `answerFromMath`, `SOLVERS`, `generateProblem` (`{selfCheck}`), `generateSet`, `templateSig`/`contextSig`, `composeSet`/`composeExam`, `nextProblem` (`{avoid}`), `explain`, `sanitizeProgress`, `mathSig`; `word` modes (10 basic + 10 deep: `wunit/wmoney2/wreverse/wprofit2/wratio2/wrate2/wgeo2/wdata2/wtable/wequation`).
- UI/state: `app.js` — `state`, `show()` (heading focus + `aria-labelledby` + announcer), `navigate()`, `parseHash/serializeRoute/resolveRoute/parentOf/currentRoute`, `readSession/saveSession/restoreSession`, `renderQuestion`, `renderVisual`/`visualAlt`, `startPractice/Quiz` (`composeSet`), `buildGradeExam` (`composeExam`), `finishExam`, `showModal/closeModal`/`setBackgroundInert`, `registerSW`/`showUpdateChip`/`acceptUpdate`, `applyLang`.
- Content: `curriculum.js` (skills/types/levels incl. word ops tables and percent/ratio/AP/stats ladders), `lessons.js` (teaching text), `i18n.js` (UI strings incl. `a11y.*` and visual alt templates), `formulas.js` (items tagged with `skills`), `curriculum-outline.js`.
- Build: `tools/build.js` (deterministic bundle + dist + SW generation), `tools/sw-template.js` (SW strategy/update protocol), `package.json` (esbuild), `dist/` (committed artifact; `dist/sw.js` generated).
- Tests: `tests/core.test.js` (MATH_SPEC oracle, invariants, schema fuzz, composition/diversity), `tests/generators.test.js` (contracts, pool floors, explain across all modes), `tests/ui.test.js` (jsdom flows, router/Back-Forward, session resume, keyboard, import, update chip, fixed-seed quiz/exam composition, dist smoke), `tests/contract.test.js` (MATH_SPEC self-check by typeIndex, assets, i18n, solver coverage, deep word ops, formula parity, stage-exam uniqueness, dist/SW consistency), `tests/a11y.test.js` (headings/labels/focus/inert/lang/visual alt + axe-core jsdom subset).
- CI/deploy: `.github/workflows/tests.yml` (build + stale-dist check + five suites), `.github/workflows/pages.yml` (dist deploy when Pages source is GitHub Actions); test deps: `tests/package.json` + `tests/package-lock.json` (jsdom, axe-core).
