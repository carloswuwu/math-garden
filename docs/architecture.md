# Architecture

Math Garden is a **static, offline-first, bilingual (繁中／English) math PWA**. There is no backend and no runtime network dependency after the first load: the whole app, content and KaTeX assets are precached by a service worker and can run from `file://` via the committed `dist/` build.

This document is the current-state map; decision records live in [`docs/adr/`](adr/). The authoritative project handoff/backlog remains [`docs/PLAN.md`](PLAN.md).

---

## 1. Runtime topology

```
src/data/*.js ── ESM content source of truth ────────────────┐
src/core/{index,rng,values}.js ── ESM engine source of truth ┘
                                                             │
                              tools/build.js step 0 (esbuild)
                                                             ▼
index.html ── classic root wrappers (generated) ──────────────┐
  ├─ vendor/katex/katex.min.js        (math typesetting)      │
  ├─ math-core.js      engine (generated UMD wrapper)         │
  ├─ i18n.js / curriculum.js / curriculum-outline.js          │
  ├─ formulas.js / lessons.js   (generated wrappers)          │
  └─ app.js            router + screens + state               │
                                                               ▼
                                              tools/build.js (esbuild)
                                                               │
                             dist/app.<hash>.js  single classic IIFE
                             dist/index.html + style.css + vendors
                             dist/sw.js (generated precache + update protocol)
                                                               │
                                                    GitHub Pages / file://
```

- **Source of truth** is now mixed: content modules live in `src/data/*.js` (ESM); engine helpers live in `src/core/{index,rng,values}.js` (ESM). `tools/build.js` step 0 bundles them into generated classic wrappers at the repo root (content assigns `window.*`; engine is a **UMD** wrapper for `window.MathCore` + Node `require`). `app.js` is still a classic script, so script order still matters (§4).
- **Deployable artifact** is `dist/`, committed to the repo. `npm run build` is deterministic: generated wrappers are LF-normalised, the esbuild version participates in the hash, and CI fails if committed `dist/` **or any generated wrapper** differs from a fresh build.
- **No bundler in dev**: opening root `index.html` from `file://` executes the classic scripts directly; opening `dist/index.html` runs the production IIFE. `play-math.bat` prefers `dist/`.

## 2. Source inventory

| File | Responsibility | Public surface |
| --- | --- | --- |
| `src/data/i18n.js` | UI strings for `zh`/`en`, ARIA labels, visual alt templates (ESM source) | `I18N` export → generated `i18n.js` global |
| `src/data/curriculum.js` | 15 stages (pre-K→S6 + 🏆 Challenge), 117 skills, type lists, difficulty levels, word-op tables, unlock metadata (ESM source) | `Curriculum` export → generated `curriculum.js` global |
| `src/data/curriculum-outline.js` | Parent-facing syllabus outline (ESM source) | `CurriculumOutline` export → generated `curriculum-outline.js` |
| `src/data/formulas.js` | Formula reference items tagged with skills (ESM source) | `Formulas` export → generated `formulas.js` |
| `src/data/lessons.js` | 108 bilingual lessons (ESM source) | `Lessons` export → generated `lessons.js` |
| `src/core/index.js` | Engine ESM entry: generators, explain, composition, grading composition (imports the split modules) | `MathCore` export → generated `math-core.js` UMD |
| `src/core/rng.js` | Seeded RNG: `seedRandom`, `randInt`, `pick`, `shuffle` | ESM imports |
| `src/core/values.js` | Value/fraction helpers: `isFraction`, `gcdInt`, `reduceFraction`, `valueKey`, `renderValue`, `valuesEqual`, `normalizeInput` | ESM imports |
| `src/core/facts.js` | Shared factorial helper (`factInt`) | ESM imports |
| `src/core/display.js` | Shared display helpers: `fmtDecimal`, `fmtNum`, equation explanation sentences | ESM imports |
| `src/core/generators.js` | All `gen*` generators, support constants, `GENERATORS` catalogue (107 generator fns) | ESM imports |
| `src/core/math-spec.js` | `MATH_SPEC` answer oracle + `answerFromMath` | ESM imports |
| `src/core/progress.js` | `defaultSkillProgress`, `sanitizeProgress`, stars/mastery, `applyResult`, `applyQuizResult`, `gradeQuiz` | ESM imports |
| `math-core.js` | **Generated UMD wrapper** of `src/core/index.js` (browser `window.MathCore`, Node `require`) | `window.MathCore` / `module.exports` |
| `app.js` | Router, screens, state, progress, session, dialogs, SW update chip, language, a11y (still classic source) | `window.__mathApp` (test/debug API) |
| `tools/build.js` / `tools/sw-template.js` | Deterministic bundle, dist assembly, SW generation | build script |
| `tests/*.test.js` | Six suites: engine, UI (jsdom), generators, cross-layer contract, a11y (axe), performance budgets | `npm test` |

## 3. Data flow

1. **Curriculum** declares a stage → skills → ordered `types` and `levels` (option bags).
2. **Engine** `generateProblem(skill, {type, difficultyStep, rng})` calls a generator, then:
   - normalises display math (`formatMathText`), builds distractors (or strips `choices` for typed-answer levels),
   - validates against `MATH_SPEC` when `selfCheck` is on,
   - attaches a stable `sig` for duplicate avoidance.
3. **Assessment composition** uses `composeSet` (10-item quiz) / `composeExam` (20-item stage exam) with duplicate, template and difficulty-diversity constraints.
4. **UI** renders a problem (`renderQuestion`), grades via `checkAnswer` and records progress with `applyResult` / `applyQuizResult`.
5. **Progress** (localStorage schema v2) stores per-skill attempts/correct/streak/difficulty/type accuracy/quiz stars + stage exam results. **In-flight session** (sessionStorage) stores mode, route, problems, index, results for 24 h reload resume.

### Engine contracts (enforced by suites)

- Single answer oracle: `MATH_SPEC[op](math)` must equal the generator answer (`selfCheck`).
- Every problem has bilingual prompt/hint, unique choices (unless typed), and `explain()` steps whose last step contains the displayed answer.
- `checkAnswer` is the only grader: it accepts equivalent fractions/decimals and typed input.
- No raw caret expressions outside `$...$` in prompts, hints, explanations, or lesson fields.

## 4. Global/script-order coupling (known debt)

`index.html` loads scripts in this exact order:

```
katex → math-core → i18n → curriculum → curriculum-outline → formulas → lessons → app
```

The content modules (`src/data/*`) and engine helpers (`src/core/*`) are ESM sources; build step 0 generates the classic wrappers. But they still assign `window.*` globals at load time and `app.js` remains a classic script. `app.js` reads globals at call time (not load time), so most cross-references are late-bound, but data/engine wrappers must exist before app handlers run. Remaining Phase 5 modularization target: finish splitting the engine (`generators`, `math-spec`, `explain`, `compose`, `progress`) and the UI (`ui/*`).

## 5. Routing and state machine

Hash routes are pure strings; `parseHash`/`serializeRoute`/`resolveRoute` validate against curriculum and unlock rules.

| Route | Screen | Notes |
| --- | --- | --- |
| `#/home` | home | stage grid + 🏆 challenge card + Continue card |
| `#/stage/:stageId` | stage | skill cards, stage exam |
| `#/lesson/:skillId` | lesson | intro/steps/example/tip/mistake, worked example |
| `#/practice/:skillId` | practice | MC or typed answer, retry = no mastery credit |
| `#/quiz/:skillId` | practice (quiz) | 10 items, pass mark `mastery.quizPass` (default 0.8) |
| `#/exam/:stageId` | practice (exam) | 20 unique items, ≥90% unlocks next stage |
| `#/parent` `#/settings` `#/outline` `#/formulas` | respective | public screens |

`show(screen)` is the **single choke point** for heading focus, `aria-labelledby`, live-region announcements, background `inert`, and clearing `state.run` when leaving an assessment. `state.run {mode,key}` is the only identity of an in-progress assessment; never infer it from `state.skillId` (lesson rendering rewrites it).

## 6. Assessment modes and fairness

- **Multiple choice**: practice + primary quizzes/exams. Four unique choices (comparegroup: 2).
- **Typed answer**: level option `input:true`; engine removes `choices`; UI renders labelled field + submit/Enter; all challenge skills typed; from `ms1` up every 3rd numeric quiz/exam item is typed.
- **Fairness**: only a first-attempt correct practice answer earns mastery/streak/difficulty credit; retry-correct gives feedback but no credit. Quiz stars/mastery honour each skill's `mastery.quizPass`.

## 7. Build and deploy

1. **Step 0 — generated modules:** `tools/build.js` bundles each `src/data/*.js` into a classic wrapper and `src/core/index.js` into a UMD `math-core.js` (browser + Node), keeping the public globals unchanged.
2. `node tools/build.js` reads the classic sources in fixed order, normalises line endings, bundles with esbuild (IIFE), hashes content → `dist/app.<hash>.js`, copies HTML/CSS/icons/vendors, writes hashed SW cache name and precache list.
3. `dist/` and all generated wrappers are committed; `.github/workflows/tests.yml` rebuilds and **fails on drift** in either, then runs six suites.
4. `.github/workflows/pages.yml` deploys `dist/` **only when the Pages source is GitHub Actions**; until the one-time settings switch the live site is the legacy root deploy.
5. SW: install precaches, activate waits for user confirmation (`#updateChip`), navigation is network-first with 3 s timeout + cache fallback; generated SW never auto-`skipWaiting`.

## 8. Testing strategy

| Suite | Environment | Protects |
| --- | --- | --- |
| `core.test.js` | node | engine invariants, grading, progress, composition/diversity, schema fuzz |
| `ui.test.js` | jsdom | routing/history, resume, keyboard, typed/MC flows, challenge, quit-run fix, KaTeX, bug regressions |
| `generators.test.js` | node | per-type contracts, pools, explain coverage, typed-input invariants |
| `contract.test.js` | node + vm | MATH_SPEC by typeIndex, assets/i18n, solver coverage, formulas, exam uniqueness, dist/SW consistency, formatting |
| `a11y.test.js` | jsdom + axe-core | headings/labels/focus/inert/lang/visual alt, axe subset on 13 screens |
| `perf.test.js` | node + jsdom | engine p95, route render p95, bundle gzip, precache ≤ 1.2 MB |

## 9. Performance budgets

Measured on the current build (local, warm JIT); budgets in parentheses are the CI gates.

| Budget | Current | Gate |
| --- | --- | --- |
| `generateProblem` p95 | ~0.05 ms | < 30 ms |
| `generateSet(20)` p95 | ~11 ms | < 200 ms |
| `composeExam(20)` p95 | ~0.4 ms | < 400 ms |
| jsdom boot p95 | ~64 ms | < 5000 ms |
| jsdom route render p95 | ~500 ms | < 2000 ms |
| bundle gzip | 128.6 KB | ≤ 140 KB |
| SW precache payload | 0.99 MB | ≤ 1.2 MB |

Budgets are deliberately 3–8× local measurements to absorb CI variance. They guard against structural regressions (accidental O(n²), content bloat), not micro-benchmarks.

## 10. Accessibility architecture

- One `<h1>` per screen, focus moved to it on navigation, live-region announcements.
- Every interactive control has an accessible name; typed-answer fields are labelled and described.
- Modal dialog traps focus, marks background `inert` + `aria-hidden`; Esc closes; 44 px icon targets.
- Generated question visuals include localized `role="img"` text alternatives (`visualAlt`).
- axe-core subset runs over 13 screen states in CI; real-browser Lighthouse/axe remains a manual Phase 5 item.

## 11. Phase 5 modularization target

Current source is order-coupled classic scripts; Phase 5 converts to ESM **while keeping the public API and the file:// classic build**:

1. **Foundation** (done): architecture map, ADRs, performance budgets in CI.
2. **Content modules** (done): `i18n`, `curriculum`, `curriculum-outline`, `formulas`, `lessons` now live in `src/data/*.js` as ESM; build step 0 generates the classic root wrappers with the unchanged `window.*` API; CI verifies wrappers are in sync.
3. **Engine modules** (in progress): `src/core/index.js` is now the ESM engine entry; extracted so far: `rng`, `values`, `facts`, `display`, `generators` (all `gen*` + `GENERATORS`), `math-spec` (oracle), `progress` (mastery/grading). `math-core.js` is a generated UMD wrapper. Remaining extracts: `explain` (SOLVERS + explain) and `compose` behind the unchanged `window.MathCore` API.
4. **UI modules**: split `app.js` into `ui/router`, `ui/state`, `ui/screens/*`, `ui/dialog`, `ui/visual`, `ui/a11y`, `ui/sw`; `app/index` keeps `window.__mathApp`.
5. **Tooling/tests**: tests load the built IIFE (contract/UI/a11y/perf) instead of eval'ing root wrappers; keep file:// by committing the classic bundle as today.

Guardrails for every slice: one module/commit, all six suites green, `dist/` rebuilt and committed, public APIs unchanged, no change to stored progress/session schemas.

## 12. Decision records

| ADR | Decision |
| --- | --- |
| [0001](adr/0001-static-classic-scripts-and-esbuild-iife.md) | Static classic scripts in dev; deterministic esbuild IIFE + generated SW for ship |
| [0002](adr/0002-hash-router-and-session-resume.md) | Hash routing with validated routes and sessionStorage resume |
| [0003](adr/0003-math-spec-single-oracle.md) | `MATH_SPEC` is the single answer oracle; generators self-check |
| [0004](adr/0004-generated-service-worker-update-chip.md) | User-confirmed SW updates via update chip; never auto-skipWaiting |
| [0005](adr/0005-typed-answer-mode.md) | Typed-answer mode removes choices for challenge and secondary assessments |
| [0006](adr/0006-challenge-stage-outside-unlock-chain.md) | Challenge stage is always open and outside progression |
| [0007](adr/0007-assessment-fairness.md) | First-attempt-only practice credit; configurable quiz pass mark |
| [0008](adr/0008-performance-budgets.md) | CI-enforced performance and size budgets |
