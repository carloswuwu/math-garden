# Math Garden — handoff plan (for a fresh session)

> **Purpose.** This file is the single source of truth for continuing work on the Math Garden PWA in a new conversation. It records the current state, the architecture, what was just fixed, the open debt, and the executable plan (with acceptance criteria and agent prompts). Read this first; do not re-derive the architecture from scratch.

## 0. Snapshot

| Item | Value |
|---|---|
| Repo | `C:\Users\Carlos\Documents\deepseek-harness\math` |
| Branch / HEAD | `main` @ `db4ab98` (Phases 1–5 complete + post-roadmap batch: Pages Actions switch, P1 content tranche, offline check/glossary; docs commit on top) |
| Live | https://carloswuwu.github.io/math-garden/ — **Pages source is now “GitHub Actions”**; `pages.yml` deploys the built `dist/` on every main push |
| CI | `.github/workflows/tests.yml` — build, stale-`dist`/wrapper check, six node suites, real-Chrome Lighthouse a11y gate, cold-offline check |
| Content | **15 stages**, **148 skills**, **139 lessons — all deepened, 40 with glossaries**, **135 generator types**; `word` has **24 modes**; challenge arena **20 olympiad-style types across 6 topics with 3 difficulty tiers**; **小五 15 skills** (異分母分數、分數乘除、分數比較/擴分約分、小數四則混合、面積二、體積一、旋轉對稱、近似值/估算、統計圖、代數符號、圓的認識) and **大學 8 skills** (微積分二、線代二、統計二、微分方程、數論); Pre-K → graduate school |
| Code size | ESM sources: `src/core/` 14 modules (~4.5k lines), `src/ui/` 22 modules (~2.5k lines), `src/data/` 5 modules; generated wrappers `math-core.js` (~4.2k) and `app.js` (~2.5k); `style.css` 794 · `formulas.js` 91 |
| Build | `tools/build.js` (190) + `tools/sw-template.js` (104), esbuild 0.28.2 → `dist/app.ce7a35e17108.js` **540.1 KB raw / 169.4 KB gzip** (advisory 170 KB), generated `dist/sw.js`; content ESM in `src/data/`, engine ESM in `src/core/`, UI ESM in `src/ui/`, generated classic/UMD wrappers; `dist/` + wrappers committed and CI fails on drift |
| Tests | core **575,439** assertions · ui **283** · generators **193,159** · contract **18,707** · a11y **207** · perf **26** checks (+ Lighthouse a11y **1.000** + cold-offline check); UI/a11y/perf boot the built IIFE |
| A11y | one h1 per screen + `aria-labelledby`, focus-to-heading + live-region announcements, accessible names on all controls (incl. labelled typed-answer fields), modal background `inert`/`aria-hidden`, generated `role="img"` text alternatives for question visuals, 44 px icon targets, ARIA strings in `i18n.js`, axe-core 4.10.2 jsdom subset (0 violations on 13 screens) |
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
- Assessment: 10-item skill quiz (≥80% = 2 stars = mastered **by default; each skill's `mastery.quizPass` is now honoured**), 20-item stage exam (≥90% unlocks next stage), adaptive difficulty rises after 3 consecutive correct. Composition now guarantees full length with no identical repeats, caps template reuse and mixes difficulty levels (see Phase 3.5). Practice credits only a **first-attempt** correct answer; retry-correct gives feedback but no mastery credit.
- Challenge arena (🏆, always open, outside the grade unlock chain): 6 topics × extra-hard olympiad-style items — number theory (remainders of powers, last digit, HCF/LCM, simultaneous remainders), counting (grid paths, handshakes, arrangements, inclusion–exclusion, rectangles in a grid), geometry & time (clock-hand angles, trapezium area, polygon interior angles), logic & patterns (sequence riddles, pigeonhole), algebra & applied (work rate, mixture, train meet/catch-up), probability games (two dice sums, coin tosses, dice-sum inequality). **20 types, all typed (no options), 3 difficulty tiers**; entered from a dedicated home card; routes, lessons, practice, quiz, exam and session resume all reuse the normal engine.
- Answer modes: multiple choice remains for practice and primary grades; a level can set `input: true` to force typed entry. Challenge skills are all typed; secondary (`ms1`+) quizzes/exams convert every 3rd numeric-answer item to typed entry, so assessments cannot be passed by guessing alone. Fractions/decimals are accepted by value.
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

### Landed in this cycle: 🏆 Challenge arena (olympiad-style extra-hard problems)

37. New special stage `challenge` (15th stage, always unlocked, excluded from the grade progression chain): 6 topics/skills — Number Theory, Counting, Geometry & Time, Logic & Patterns, Algebra & Applied, Probability Games. A dedicated gold home card shows mastery progress; all normal routes/lessons/practice/quiz/exam/session-resume work; challenge skills are never sequentially locked.
38. 15 new generators inspired by competition archetypes (Math Kangaroo 5–6, AMC 8, HKIMO/EDB gifted papers — see §8 references): remainder of powers, HCF/LCM, simultaneous remainders, grid path counts, handshakes, multinomial arrangements, inclusion–exclusion, clock-hand angles, trapezium area, sequence riddles (triangular/Fibonacci/×2+1/square+1), pigeonhole guarantees, work rate, mixture concentration, two-dice sums, coin-toss binomial. Every type has integer/simplified-fraction answers, MATH_SPEC entries, `explain()` steps ending in the displayed answer, distractor bounds, bilingual prompts/hints and 2-level difficulty options.
39. Content: 6 bilingual challenge lessons, 6 challenge skills with stage-appropriate difficulty options, home entry card + gold styling; challenge exam (`#/exam/challenge`) mixes all six topics (20 unique items via `composeExam`).
40. Tests: generators 130,693 → **154,667** assertions (+15 types, 117 skills), contract 10,725 → **12,464**, ui 206 → **216** (challenge entry/deep-link/quiz), a11y 172 → **208** (13 screens incl. challenge + challenge quiz). All five suites green; dist rebuilt to 102.9 KB gzip.

### Landed in this cycle: typed answers (anti-guessing)

41. Engine answer modes: a level can set `input: true`; `generateProblem` then sets `p.input = 'text'` and removes `choices`, so the DOM contains no options to guess from. `checkAnswer` remains the single grader (equivalent fractions, decimals, large integers all accepted); session validation, generators contract and solve/explain contracts understand input problems. UI: labelled text field + Submit button + Enter, inline “type a number or fraction” hint, localized feedback, practice retries and quiz/exam reveal-then-advance.
42. Challenge arena is now **fully typed-answer** — every one of the 15 olympiad-style types (including fraction answers like 1/36 and counting answers in the thousands) requires the learner to compute and enter the answer; 240-sample contract plus UI flows (no `.choice` elements, submit wrong/right, retry, session reload) cover it.
43. Secondary assessment integrity: from `ms1` upward, every third numeric-answer quiz/exam item is converted to typed entry; primary grades and all practice stay multiple-choice so young learners are not penalised for input format. A seeded ms1 exam test asserts ≥4 typed numeric items while still mixing MC.
44. Tests: generators **149,389** (input branches replace the choice assertions for typed items; all MC invariants still enforced elsewhere), ui **235**, a11y **205**; dist rebuilt to 103.6 KB gzip. The typed mode is data-driven, so more levels (e.g. selected grade-6 exams or future curated sets) can opt in with one `input: true` flag.

### Fixed in this cycle: stale assessment after quitting (regression)

45. Bug: after starting a practice/quiz, leaving it, then starting another practice/quiz (same or different section), the old question list was reused and the new lesson title shown over the old item. Root cause: `renderAssessmentRoute` inferred an “active run” from `state.mode` + `state.skillId`, but `renderLesson` rewrites `state.skillId` (and `state.mode` survives in memory), so a route could look like a match while `problems` still belonged to the previous run. Fix: explicit `state.run {mode,key}` set only by `startPractice`/`startQuiz`/`renderGradeExam`/`restoreSession`; `show()` clears it for any non-practice screen; `renderAssessmentRoute` reuses a run only when `state.run` matches the route. Regression test covers practice→practice, practice→quiz and quiz→practice across sections (ui 235 → 248).

### Landed in this cycle: fairness fixes + challenge tier 2

46. **First-attempt-only practice credit:** `applyResult` accepts `{credit:false}`; a correct answer after a wrong attempt records the attempt (for `attempts`/`typeAcc`) but no longer increases `correct`, `consecCorrect`, difficulty or practice stars, and shows a dedicated retry hint. `state.attemptWrong` is reset per question for multiple-choice and typed practices; first-try answers are credited as before. This closes the audit's “practice credits a correct click after a wrong click” issue.
47. **Configurable quiz pass mark:** `quizStars(percent, pass)`, `gradeQuiz(results, pass)` and `applyQuizResult` now honour each skill's `mastery.quizPass` (previously dead config); default 0.8 keeps prior behaviour, and the 3-star threshold adjusts so custom pass marks remain sensible. `finishQuiz` uses the skill threshold; mastery gating follows.
48. **Challenge tier 2:** five new olympiad types across topics — last digit of powers (number theory), rectangles in a grid (counting), polygon interior angles (geometry), train meeting/catch-up (algebra applied), dice-sum probability (probability). The challenge arena now has **20 typed-answer types**, and every challenge skill gained a **third difficulty level** with harder options. New types have MATH_SPEC, explain steps ending in the answer, distractor bounds and bilingual prompts/hints; all challenge-type contracts pass.
49. Tests: core **575,437**, ui **254**, generators **168,511**, contract **14,307**, a11y **205** — all green; dist rebuilt to 105.7 KB gzip (under the 120 KB advisory).

### Landed in this cycle: teaching depth + formal math typesetting

50. **Lesson depth:** the renderer now supports optional bilingual `steps[]` (ordered strategy list) and `mistake` (common-error callout), plus i18n labels and styling; 15 abstract/high-value lessons (word problems, percent, ratio, linear equations, substitution, Pythagoras, simultaneous equations, indices, quadratics, logs, arithmetic sequences, median, derivative, calculus, probability) were deepened with richer intros, 4-step solution strategies and common mistakes. Lessons without the new fields are unchanged; contract enforces bilingual parity, ≥3 non-empty steps and a 15-lesson floor.
51. **Formal math formatting:** `MathCore.formatMathText` wraps plain caret expressions outside existing `$...$` into math mode (`4^3`, `x^(n−1)`, `(x+1)^n`), and `renderMath` applies it so every prompt, hint, explanation and lesson string goes through KaTeX. Playwright-style equation text was upgraded: linear/simultaneous equations wrapped in math mode, quadratics use `x^{2}`, polynomial prompts wrap the whole polynomial, and gp/binomial/calculus/lesson formulas were converted to LaTeX (no more raw `^` or `d/dx(ax^n)` plain text). `explain()` formats all steps through the same helper.
52. **Tests:** contract 14,307 → **14,719** (raw-caret prohibition across all generated/teaching content, formatter unit checks, richer lesson schema); ui 254 → **263** (seeded lesson shows 4 rendered steps + mistake box; KaTeX renders lesson and equation practice with no visible `$`/`^`); bundle 112.2 KB gzip (under the 120 KB advisory).

### Landed in this cycle: every lesson deepened

53. **All 108 lessons now have bilingual `steps[]` + `mistake`** (the first 15 plus 93 new): pre-K counting/compare/add/sub/number bonds; g1–g3 place value, money, tables, fractions, angles, 3D shapes; g4–g6 area/perimeter, decimals, equations, circles, volume; ms1 directed numbers/coordinates/like terms/parallel lines/square roots; ms2 identities, polygons, congruence, similarity, interest, approximation; ms3 inequalities, sectors/solids, statistics, triangle centres; hs1 functions, trig, straight lines, circle properties; hs2 GP/sums, variation, dispersion; hs3 roots/combinations/binomials/probability; college linear algebra/probability; and all six challenge topics. Contract now requires 100% coverage and bilingual step parity.
54. Bundle advisory raised 120 → **140 KB gzip** (current 128.6 KB) because the complete teaching content is shipped in the offline bundle; build warning threshold and contract updated together; all suites green (core 575,437 · ui 263 · generators 168,511 · contract 15,649 · a11y 205).

### Phase 5 started: performance + docs foundation

55. **Architecture documentation:** `docs/architecture.md` maps runtime topology (classic dev scripts → deterministic esbuild IIFE → generated SW), source inventory/public APIs, data flow, routing/state machine, assessment modes/fairness, build/deploy/SW, six-suite test strategy, a11y architecture, and the Phase 5 modularization target layout. Eight ADRs (`docs/adr/0001`–`0008`) record the long-lived decisions (static classic scripts + IIFE, hash router/resume, MATH_SPEC oracle, generated SW/update chip, typed answers, challenge-outside-chain, fairness, perf budgets).
56. **Performance budgets are now a sixth CI suite:** `tests/perf.test.js` gates engine p95 (`generateProblem` <30 ms, `generateSet(20)` <200 ms, `composeExam(20)` <400 ms), jsdom boot/route render (<5 s / <2 s p95), bundle gzip (≤140 KB) and precache payload (≤1.2 MB). Measured: generateProblem p95 ~0.05 ms, generateSet(20) ~11 ms, composeExam(20) ~0.4 ms, boot ~64 ms, route p95 ~500 ms, bundle 128.6 KB gzip, precache 0.99 MB. Wired into `tests.yml`, root/tests `npm test` scripts and the release checklist; architecture docs carry the budget table.
57. **Remaining Phase 5:** engine split (Stage D) and UI split (Stage E), tests loading the built IIFE, and a real-browser Lighthouse a11y gate. GitHub repo description was updated via the API to “Math Garden — bilingual offline-first math PWA: Pre-K to S6 + challenge arena, typed answers, KaTeX lessons, CI-tested”.

### Phase 5 Stage C landed: ESM content modules

58. **Content modules now have an ESM source of truth while the public API is unchanged.** `i18n`, `curriculum`, `curriculum-outline`, `formulas` and `lessons` moved to `src/data/*.js` exporting `I18N`, `Curriculum`, `CurriculumOutline`, `Formulas`, `Lessons`. Build step 0 bundles each into a generated classic root wrapper (same `window.*` globals, `file://`/legacy branch deploy unchanged); `.gitattributes` keeps source/generated text LF; CI now fails if either `dist/` **or** the generated wrappers drift; contract asserts the ESM sources exist/export and root files carry the generated header. All six suites green (contract 15,649 → **15,669**); bundle 406.9 KB raw / **128.6 KB gzip**; hash `80516090eabb`.
59. **Next:** Stage D engine split (`core/{rng,values,generators,math-spec,explain,compose,progress}`, `window.MathCore` unchanged) and Stage E UI split (`ui/{router,state,screens,dialog,visual,a11y,sw}`, `window.__mathApp` unchanged), then point tests at the built IIFE.

### Phase 5 Stage D started: engine ESM source + first split

60. **Engine is now ESM-sourced behind the unchanged API.** `src/core/index.js` contains the engine body and exports `MathCore`; extracted modules: `rng` (seeded RNG), `values` (fraction/value helpers), `facts` (factorial), `math-spec` (`MATH_SPEC` oracle + `answerFromMath`) and `progress` (mastery/stars/grading/sanitize). Build step 0 generates `math-core.js` as a **UMD wrapper** (browser `window.MathCore`, Node `module.exports`), so all existing tests (`require('../math-core.js')`) and `index.html` continue unchanged. CI stale check now covers `math-core.js`; contract checks all six ESM sources, the generated header and the UMD dual export; `.gitattributes` pins it to LF. Six suites green (contract 15,669 → **15,683**), bundle 407.4 KB raw / **128.9 KB gzip**, hash `a3a6fd586896`.
61. **Next:** extract `explain` (SOLVERS + explain) and `compose` from `src/core/index.js` (one module per commit), then Stage E UI split and point tests at the built IIFE.

### Phase 5 Stage D continued: generators extracted

62. **All 107 generator functions, support constants and the `GENERATORS` catalogue moved to `src/core/generators.js`;** shared display helpers (`fmtDecimal`, `fmtNum`, `explainEquationZh/En`) moved to `src/core/display.js` so `generators` and `explain` (still in index) can share them without a cycle. `src/core/index.js` shrank to 1,854 lines and now imports `GENERATORS`; generator runtime behaviour is unchanged (105 generator types, 117 skills). Contract checks all eight engine ESM modules; six suites green (contract 15,683 → **15,687**), bundle 407.4 KB raw / **129.5 KB gzip**, hash `1424feec80d1`.

### Phase 5 Stage D complete: full engine split

63. **The engine is now fully modular with the same public API.** Extracted modules: `format` (`formatMathText`), `signatures` (`mathSig/templateSig/contextSig`), `choices` (distractors), `explain` (`SOLVERS` + `explain`), `problem` (`levelFor/typeList/generateProblem/generateSet`) and `compose` (`composeSet/composeExam`). `src/core/index.js` is now a ~374-line assembly layer that imports all modules, keeps `GENERATOR_TYPES`, `checkAnswer`, `nextProblem` and exports the same `MathCore`; generated `math-core.js` remains a UMD wrapper (browser + Node). Contract checks all 14 engine ESM modules; six suites green (contract 15,687 → **15,699**), bundle 407.4 KB raw / **129.3 KB gzip**, hash `953881acc6e4`. **Stage E (UI split) is next.**

### Phase 5 Stage E started: UI ESM source + generated app wrapper

64. **The UI is now ESM-sourced.** `app.js` moved to `src/ui/index.js` (imports the window bridge `src/ui/globals.js`, `src/ui/format.js` for `esc`/`renderMath`, and `src/ui/router.js` for pure hash helpers). Build step 0 bundles it into the classic `app.js` IIFE that still initializes and exposes `window.__mathApp`, so `index.html`/`file://`/legacy deploy and all jsdom suites are unchanged. CI stale check now covers `app.js`; contract checks the four UI ESM sources plus the generated header/`__mathApp` hook; `.gitattributes` pins it to LF. Six suites green (contract 15,699 → **15,709**), bundle 407.4 KB raw / **129.4 KB gzip**, hash `110424b5e3bd`.
65. **Next:** extract UI state/screens/dialog/visual/a11y/SW modules from `src/ui/index.js`, then move jsdom/contract tests to the built IIFE and finish Phase 5 with a real-browser Lighthouse/axe pass.

### Phase 5 complete: full UI split, tests on the built IIFE, Lighthouse gate

66. **Stage E finished.** The UI is fully modular in `src/ui/`: `index` (init + `window.__mathApp` hooks, ~175 lines), `globals`, `format`, `router`, `state`, `i18n`, `selectors`, `visual`, `dom`, `a11y`, `context`, `screens`, `assessment`, `session`, `nav-state`, `modal-state`, `nav`, `chrome`, `dialog`, `sw-state`, `sw`, `keyboard`. Cross-module actions are injected on an `app` context object to avoid cycles; build step 0 generates the classic `app.js` IIFE so `index.html`/`file://`/legacy deploy are unchanged. Contract checks all 22 UI ESM modules + generated header/`__mathApp` hook; CI stale check covers `app.js`.
67. **Tests now exercise the shipped artifact.** `tests/ui.test.js`, `tests/a11y.test.js` and `tests/perf.test.js` boot the built `dist/app.<hash>.js` single IIFE (falling back to root wrappers only when dist is absent); contract still validates the source modules/contracts. Six suites green: core 575,437 · ui 263 · generators 168,511 · contract **15,745** · a11y 205 · perf 26 checks. Bundle `app.c17ec6c2d471.js` 408.5 KB raw / **129.6 KB gzip**.
68. **Real-browser accessibility gate.** Added `tools/lighthouse-check.js` + `npm run lighthouse`: serves `dist/`, runs Lighthouse accessibility on real headless Chrome, and fails below 0.95. Local score **1.000**; CI has a Lighthouse step. Also updated the GitHub repo description. Phase 5 is complete; remaining non-roadmap polish is the one-time Pages source switch to GitHub Actions, post-roadmap content P1 items, and an optional real-device cold-offline check.

## 1b. Post-roadmap batch (landed)

69. **Pages source switched to GitHub Actions** via the Pages API (`build_type=workflow`, verified GET) and the `pages` workflow was dispatched; every push now publishes the built `dist/` (workflow still validates source, builds, checks stale wrappers, then deploys).
70. **Content P1 tranche:** per-mode/progress tracking (`typeAcc` keyed by word op / form / mode; nextProblem aggregates mode keys), tiny-pool expansion (`congruent` computed side/angle variants, `approx` range mode, `direction` opposite/turn modes), four new deep word archetypes (unit conversion, packing/remainder, percent increase-then-decrease chain, three-part ratio sharing) wired through generators/MATH_SPEC/explain/curriculum, and college exam width (S6 skills added so 20 items cover more ground). New core/UI tests; contract samples widened for the larger word op set.
71. **Offline + teaching polish:** real-Chrome cold-offline check (`tools/offline-check.js` + `npm run offline-check`) loads dist, waits for SW control, closes the page, goes offline and verifies a fresh page renders from cache; CI runs it after Lighthouse. Lesson glossaries (bilingual term/definition lists) added for 9 key lessons with renderer/i18n/CSS/contract/UI coverage. Bundle 422.1 KB raw / **134.0 KB gzip**, tests core 575,439 · ui 268 · generators 168,485 · contract 15,873.

72. **小五課程審計（對照教育局《數學教育學習領域課程指引（小一至中六）2017》補充資料：https://www.edb.gov.hk/attachment/tc/curriculum-development/kla/ma/curr/pmc2017_tc.pdf ）：** 原本 g5 只有 4 個技能，對照 P5 學習單位後確認缺漏：異分母分數加減（5N2/5N3）、分數乘除（5N3/5N6）、面積（二）平行四邊形/三角形/梯形（5M1）、體積（一）（5M2）、旋轉對稱（5S-E1）。已新增 5 個技能（g5 由 4→**9**）、5 個 generator 類型/模式、雙語課堂與視覺化，並把 g5 topics 擴為數與運算、度量、數據處理、圖形與空間、解決問題。仍可選補：多位數近似/估計、複合棒形圖/折線圖、代數符號（一）、圓的認識。
73. **大學加深：** 新增 `col.calculus2`（冪函數定積分/導數值）、`col.linalg2`（2×2 行列式、矩陣乘法元素）、`col.stats2`（方差/標準差），大學由 3→**6** 個技能，全部有 MATH_SPEC、explain()、雙語課堂與詞彙表。
74. **更多視覺化/詞彙表：** 新增平行四邊形/梯形 SVG 與文字替代，面積、體積、旋轉對稱、分數乘除等新課堂都有視覺化；新課堂全部帶雙語詞彙表（全站 17 課有 glossary）。因 8 個新課堂令 bundle gzip 由 134.0→**141.7 KB**，advisory/perf gate 由 140 調整為 **145 KB**（仍遠低於 1.2 MB precache 預算）。

75. **小五第二輪補齊（對照 EDB P5 其餘學習單位）：** 新增近似值/估算（rounding）、統計圖（chartread：棒形圖與折線圖的相差/總和/變化）、代數符號（一）（exprsub 代入求值）、圓的認識（circleparts：半徑/直徑互算）；g5 由 9→**13** 個技能，topic 加入「代數」。新增動態棒形圖與折線圖 SVG、文字替代、雙語課堂與詞彙表。
76. **大學再加深：** 新增微分方程（歐拉法一步估計）與數論（歐拉 φ 函數、模乘法反元素），大學由 6→**8** 個技能。全站現有 **131 技能 / 122 課 / 23 個詞彙表課堂**，bundle 148.1 KB gzip，advisory/perf gate 上調至 **150 KB**（precache 1.05 MB，仍遠低於 1.2 MB）。

77. **小五最後補齊 + 更多視覺化：** 新增 `g5.fraccompare`（分數比較、擴分、約分）與 `g5.decimalmixed`（小數加減乘除混合），g5 由 13→**15** 個技能；另為 `g4.fractionadd`、`g4.decimal`、`g5.average`、`g6.equation`、`ms.s1.linear` 5 個既有課堂補上圖示。全站現為 **133 技能 / 124 課 / 25 個詞彙表課堂**，bundle 150.7 KB gzip，advisory/perf gate 上調至 **153 KB**（precache 1.06 MB）。

78. **新增研究院 🎓（Graduate School）階段：** 在大學之後加入 `grad` 階段，3 個深造技能——`grad.analysis` 實分析（數列極限、無窮等比級數）、`grad.algebra` 抽象代數（元素階、對稱群階、循環群生成元）、`grad.topology` 拓撲學（有限集合上離散／特定點拓撲的開集數）；每課有雙語步驟、常見錯誤與詞彙表。小階段只有 3 個技能，因此階段考試的 `maxPerSkill` 改為動態（`max(3, ceil(20/技能數))`）以維持 20 題；全站現為 **16 階段 / 136 技能 / 127 課 / 28 個詞彙表課堂**，bundle 154.9 KB gzip，advisory/perf gate 上調至 **157 KB**（precache 1.07 MB）。

79. **修正家長「一鍵解鎖全部」失效 + 研究院擴至 6 技能：** `confirmUnlockAll` 搬到 `dialog.js` 後漏了 `realStageList` 與 `focusScreen` import，點擊會拋 `ReferenceError`，所以只看見對話框、實際沒有解鎖。已補 import，並新增 UI 回歸測試（解鎖後所有階段考試通過、所有技能 quizStars≥2、可進入研究院 6 課、可開測度論課）。研究院由 3→**6** 個技能：新增測度論（勒貝格/計數測度）、微分幾何（圓曲率/球面高斯曲率）、範疇論入門（函數數/自同態數）；原有實分析、抽象代數、拓撲學三課亦補上視覺化。全站 **139 技能 / 130 課 / 31 個詞彙表課堂**，bundle 157.8 KB gzip，advisory/perf gate 162 KB。

80. **矩陣改用 KaTeX display math：** 線性代數題目由 inline `pmatrix` 改為 `\displaystyle\begin{bmatrix}`（行列式用 `vmatrix`），`renderMath` 新增 `$$...$$` display 模式；課堂加入矩陣視覺化（KaTeX 2×2 矩陣、可橫向滾動），`col.linalg`/`col.linalg2` 的 intro/example/steps 全部改為正式矩陣公式；UI 測試驗證矩陣視覺化與題目都有 `.katex`／`.katex-display`。全站 bundle 158.4 KB gzip，ui 測試 283。

81. **三角公式補齊：** 原本只有三角比與一條合併的正弦／餘弦定理，現新增 `hs.s4.identities`（平方關係、商數關係、二倍角）與 `hs.s5.sinerule`（正弦定理、餘弦定理、SAS 面積）、`hs.s5.triggraph`（振幅／週期）三個技能；公式表三角學一節由 2 條擴至 8 條，新增正弦曲線 SVG 視覺化與三課雙語詞彙表。全站 **142 技能 / 133 課 / 34 個詞彙表課堂**，bundle 162.4 KB gzip，advisory/perf gate 166 KB。

82. **三角學（二）進階：** 新增 `hs.s5.compound`（複角公式 sin/cos/tan）、`hs.s5.radian`（度↔弧度、弧長、單位圓特殊角）、`hs.s5.trigeq`（0°–360° 三角方程與解的對稱性）三個技能；公式表再加複角、正切複角、弧度／弧長／扇形面積、一般解，三角學累計 12 條公式；新增單位圓 SVG 視覺化與三課雙語詞彙表。全站 **145 技能 / 136 課 / 37 個詞彙表課堂**，bundle 166.3 KB gzip，advisory/perf gate 170 KB。

83. **三角學（三）再加深：** 新增 `hs.s6.invtrig`（反三角函數主值與三角複合）、`hs.s6.trigdouble`（二倍角應用）、`col.trigcalc`（sin/cos 導數與定積分），公式表再加反三角主值、三角導數、三角積分，三角學累計 **15 條**；新增單位圓／正弦波視覺化與三課詞彙表。全站 **148 技能 / 139 課 / 40 個詞彙表課堂**，bundle 169.4 KB gzip（≤170 KB）。

## 2. Architecture map

```
SOURCE (ESM)                            GENERATED CLASSIC/UMD WRAPPERS (committed)
src/data/i18n.js            ─────────▶  i18n.js            (window.I18N)
src/data/curriculum.js      ─────────▶  curriculum.js      (window.Curriculum)
src/data/curriculum-outline.js ──────▶  curriculum-outline.js
src/data/formulas.js        ─────────▶  formulas.js        (window.Formulas)
src/data/lessons.js         ─────────▶  lessons.js         (window.Lessons)
src/core/index.js + rng/values ──────▶  math-core.js       (UMD: window.MathCore / require)

SOURCE (classic scripts, file:// dev + tests load directly)
index.html  (katex vendor + generated wrappers + app, fixed order)
  ├─ math-core.js   generated engine wrapper (GENERATORS, MATH_SPEC, checking, mastery, explain/SOLVERS)
  ├─ i18n/curriculum/lessons/formulas/outline  generated classic globals (see above)
  ├─ vendor/katex   math rendering (JS/CSS/woff2)
  └─ app.js         state, screens, rendering, storage, dialogs, keyboard, SW registration/update chip
sw.js               legacy branch-deploy SW (v12); superseded by generated dist/sw.js

BUILD (tools/build.js, esbuild)
step 0              ESM src/data/* + src/core/* → classic/UMD wrappers at repo root
dist/index.html     generated: KaTeX classic script + single app.<buildHash>.js
dist/app.<hash>.js  minified IIFE of the scripts in order
dist/sw.js          generated from tools/sw-template.js (cache/precache from build manifest)
dist/style.css, manifest, icons, vendor/katex (woff2 only), .nojekyll
package.json/lock   esbuild; tools/  build scripts
tests/              core, ui (jsdom), generators, contract, a11y, perf, serve.js
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
- Challenge arena: `challenge` stage is hard-coded as always unlocked and excluded from `realStageList()` (so it never joins the grade unlock chain); `skillLockedInStage()` returns false for `skill.stage === 'challenge'`; `renderStage` forces all challenge cards unlocked; home renders a separate `#homeChallengeBtn` card. The challenge exam uses the normal `composeExam`, so all composition/diversity/answer contracts apply unchanged. 20 typed challenge types, each challenge skill has 3 difficulty levels.
- Answer modes: `p.input === 'text'` means typed answer with no choices (level `input: true`); `generateProblem` strips `choices`, `renderQuestion` renders the labelled answer field + submit/Enter, `gradeAnswered` is the shared grading path for MC and typed answers. All challenge skills are typed; `applyTypedAssessment` converts every 3rd numeric-answer quiz/exam item for `ms1`+ stages (primary and practice remain MC). Session validation accepts either choices or an input flag, and typed sessions restore the input field.
- Fairness: `applyResult(..., correct, {credit})` only credits first-attempt correct practice answers (`state.attemptWrong` tracked per question; retry-correct records the attempt but no `correct`/streak/difficulty); quiz stars/mastery use each skill's `mastery.quizPass` via `quizStars(percent, pass)`/`gradeQuiz(results, pass)`/`applyQuizResult` (default 0.8).
- Active assessment run: `state.run {mode,key}` is the single identity of an in-progress practice/quiz/exam; it is set only when a run starts or is restored and cleared by `show()` on any non-practice screen. `renderAssessmentRoute` reuses the run (re-render question / show result) only when `state.run` matches the target route; otherwise it starts a fresh run. Never infer run identity from `state.mode`/`state.skillId` alone — lesson rendering rewrites `skillId`.

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

### Phase 5 — Modularization, performance, docs — ✅ DONE
- ✅ **Stage C content modules:** `i18n`, `curriculum`, `curriculum-outline`, `formulas`, `lessons` live as ESM in `src/data/*.js`; build step 0 generates classic root wrappers; CI verifies wrappers are in sync.
- ✅ **Stage D engine split:** the engine is fully modular in `src/core/`: `rng`, `values`, `facts`, `display`, `format`, `signatures`, `choices`, `generators`, `math-spec`, `explain`, `progress`, `problem`, `compose`; `src/core/index.js` (~374 lines) only assembles `MathCore`; generated UMD `math-core.js` (browser + Node).
- ✅ **Stage E UI split:** `src/ui/` now holds `index` (init/hooks), `globals`, `format`, `router`, `state`, `i18n`, `selectors`, `visual`, `dom`, `a11y`, `context`, `screens`, `assessment`, `session`, `nav-state`, `modal-state`, `nav`, `chrome`, `dialog`, `sw-state`, `sw`, `keyboard`; `src/ui/index.js` is ~175 lines and build step 0 generates the classic `app.js` IIFE; `window.__mathApp` unchanged.
- ✅ **Performance/docs:** architecture map + 8 ADRs; CI performance budgets; UI/a11y/perf suites boot the built IIFE; **Lighthouse accessibility 1.000** via `npm run lighthouse` (real Chrome) and a CI Lighthouse step; repo description updated.
- Remaining non-Phase-5 polish: one-time Pages source switch to Actions (publishes dist), post-roadmap content P1 list, optional real-device offline check.

### 30 / 60 / 90-day shape
| Window | Ship |
|---|---|
| 0–30 d | **Phase 1 routing & resume (landed)**; **Phase 2 contract tests (landed)**; **Phase 3 A–B build/SW/update chip (landed)**; **Phase 3.5 assessment depth & word problems (landed)**; **Phase 4 accessibility remainder (landed)**; **🏆 challenge arena + tier 2 (landed)**; **typed-answer anti-guessing mode (landed)**; **assessment fairness fixes (landed)**; **lesson depth + KaTeX formatting (landed)** |
| 31–60 d | extend typed entry (curated challenge tiers, selected grade-5/6 assessments, optional two-part answers); expand the challenge arena (more olympiad archetypes, curated competition sets); audit P1 content follow-ups (single-level ladders, remaining word archetypes, tiny pools, exam width, per-mode typeAcc); deepen lesson delivery (visual worked examples, bilingual glossary, diagrams); switch Pages source to Actions and verify dist deploy + cold offline; real-browser axe/Lighthouse pass |
| 61–90 d | **Phase 5 complete** + post-roadmap batches: Pages Actions switch, P1 content, offline/glossary, **g5 4→15**, **college 3→8**, **研究院 🎓 6 skills**, **三角學（二）** and parent unlock-all fix. Optional next: audit P2, more visuals/glossary coverage, real-device check |

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
git status --porcelain -- dist i18n.js curriculum.js curriculum-outline.js formulas.js lessons.js math-core.js app.js   # must be empty (generated wrappers committed & current)
node --check app.js
node --check math-core.js
node tests/core.test.js
node tests/ui.test.js
node tests/generators.test.js
node tests/contract.test.js
node tests/a11y.test.js
node tests/perf.test.js
npm run lighthouse                    # real Chrome, a11y ≥ 0.95
git status --short                    # expect only intended files
git add -A; git commit -m "…"
git push origin main                  # needs credential store; run outside sandbox if needed
```

Then: wait for the `tests` workflow (GitHub Actions) to go green; if Pages source is “GitHub Actions”, confirm the `pages` workflow deployed `dist/`, then hard-refresh the live site and do a cold offline check. If it is still “Deploy from a branch”, the root deployment updates online without a manual SW bump; the generated `dist/sw.js` cache name comes from the build hash. `play-math.bat` runs the built app locally.

## 7. Bootstrap prompt for the new session

> Read `docs/PLAN.md` in `C:\Users\Carlos\Documents\deepseek-harness\math` first; it is the authoritative handoff. **Phases 1–5 are complete**, and the post-roadmap batches are landed: Pages source switched to GitHub Actions, per-mode typeAcc/tiny-pool/word-archetype content, cold-offline check, lesson glossaries, **小五 expanded 4→15 skills**, **大學 expanded 3→8 skills**, a **研究院 🎓 stage with 6 skills**, and **trigonometry deepened through identities, sine/cosine rules, graphs, compound angles, radians/unit circle, trig equations, inverse trig, double-angle applications and trig calculus**. Do not redo these. Remaining optional work: sum-to-product identities, more lesson visuals/glossary coverage, mathematician-audit P2, real-device spot check. Keep all six suites + `npm run lighthouse` + `npm run offline-check` green, rebuild `dist/` and generated wrappers whenever any `src/` or `style.css` changes, commit by scope, push and confirm CI **and** the Pages Actions deployment publishes the new hash.

## 8. Key references

- Engine: `math-core.js` — `GENERATORS`, `MATH_SPEC`, `answerFromMath`, `SOLVERS`, `generateProblem` (`{selfCheck}`, level `input:true` → typed answer with no choices), `generateSet`, `templateSig`/`contextSig`, `composeSet`/`composeExam`, `nextProblem` (`{avoid}`), `explain`, `sanitizeProgress`, `mathSig`; `word` modes (10 basic + 10 deep: `wunit/wmoney2/wreverse/wprofit2/wratio2/wrate2/wgeo2/wdata2/wtable/wequation`); challenge generators (`modpow/gcdlcm/remainderSystem/pathcount/handshake/arrange/inclusion/clockangle/trapezoid/seqnext/pigeon/workrate/mixture/diceprob/coinprob`).
- UI/state: `app.js` — `state` (incl. `state.run` active-run identity), `show()` (heading focus + `aria-labelledby` + announcer + clears `state.run` off-practice), `navigate()`, `parseHash/serializeRoute/resolveRoute/parentOf/currentRoute`, `realStageList`/`stageUnlocked`/`skillLockedInStage` (challenge special cases), `readSession/saveSession/restoreSession`, `renderQuestion` (MC or typed field), `gradeAnswered`/`handleAnswer`/`handleTypedAnswer`, `applyTypedAssessment`, `renderMath` (applies `MathCore.formatMathText` + KaTeX), `renderLesson` (steps/mistake sections), `renderVisual`/`visualAlt`, `startPractice/Quiz` (`composeSet`), `buildGradeExam` (`composeExam`), `finishExam`, `showModal/closeModal`/`setBackgroundInert`, `registerSW`/`showUpdateChip`/`acceptUpdate`, `applyLang`.
- Content: `curriculum.js` (15 stages incl. `challenge`; skills/types/levels incl. word ops tables, percent/ratio/AP/stats ladders and `input:true` challenge levels), `lessons.js` (teaching text: 6 challenge lessons plus **all 108 lessons with bilingual `steps`/`mistake`**), `i18n.js` (UI strings incl. `a11y.*`, `challenge.*`, typed-answer feedback, lesson step/mistake labels and visual alt templates), `formulas.js` (items tagged with `skills`), `curriculum-outline.js`.
- Build: `tools/build.js` (deterministic bundle + dist + SW generation), `tools/sw-template.js` (SW strategy/update protocol), `package.json` (esbuild), `dist/` (committed artifact; `dist/sw.js` generated).
- Tests: `tests/core.test.js` (MATH_SPEC oracle, invariants, schema fuzz, composition/diversity, first-attempt credit + quizPass), `tests/generators.test.js` (contracts, pool floors, explain across all modes, typed-input invariants for challenge), `tests/ui.test.js` (jsdom flows, router/Back-Forward, session resume, keyboard, import, update chip, challenge arena + typed answers, secondary exam mix, quit-run regression, KaTeX-rendered lessons/equations, fixed-seed quiz/exam composition, dist smoke), `tests/contract.test.js` (MATH_SPEC self-check by typeIndex, assets, i18n, solver coverage, deep word ops, formula parity, stage-exam uniqueness, dist/SW consistency, raw-caret-free formatting and lesson step/mistake schema), `tests/a11y.test.js` (headings/labels/focus/inert/lang/visual alt + axe-core jsdom subset), `tests/perf.test.js` (engine p95, jsdom boot/route render, bundle gzip, precache size budgets).
- Docs: `docs/architecture.md` (runtime topology, source inventory, routing/state, answer modes, build/SW, testing, perf budgets, accessibility, Phase 5 target) and `docs/adr/0001–0008` (decision records).
- CI/deploy: `.github/workflows/tests.yml` (build + stale-dist check + five suites), `.github/workflows/pages.yml` (dist deploy when Pages source is GitHub Actions); test deps: `tests/package.json` + `tests/package-lock.json` (jsdom, axe-core).
- Challenge content inspiration (archetypes only; all problem text/code here is original): Math Kangaroo 5–6 guides ([WuKong](https://www.wukongsch.com/blog/math-kangaroo-grade-5-6-guide-post-65853/), [My-Path](https://my-path.net/practice/math-kangaroo/grade-5-6/), [Homesweet](https://www.homesweetlearning.com/resources/math/math_kangaroo_grades_5_6/math_kangaroo_levels_5_6_practice_questions_2.html)), AMC 8 hubs ([Think Academy](https://www.thinkacademy.net/us/resources/amc8), [2018 AMC 8 analysis](https://www.thethinkacademy.com/blog/2018-amc-8-real-questions-and-analysis/)), HKIMO/EDB gifted papers ([HKIMO 2019 Heat G5](https://hongkonginternationalolympiad.org/downloads/hkimo/HKIMO%202019_Heat_Grade-5.pdf), [EDB CPS 2017/18 Primary Heat](https://www.edb.gov.hk/attachment/tc/curriculum-development/major-level-of-edu/gifted/resources_and_support/files/Maths/CPS1718_Primary_Heat_Q.pdf), [WIMO mock P5](https://www.slmathsolympiad.org/pdf/resources/wimo/WIMO-Final-2018_Mock_P5f.pdf)).
