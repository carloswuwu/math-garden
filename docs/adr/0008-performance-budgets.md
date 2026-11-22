# ADR-0008: CI-enforced performance and size budgets

- **Status:** Accepted (Phase 5)
- **Context:** Content has grown substantially (all 108 lessons deepened, KaTeX, challenge arena); structural regressions could make the offline app slow or heavy without anyone noticing.
- **Decision:** Add `tests/perf.test.js` as a sixth CI suite with generous p95 gates: `generateProblem` < 30 ms, `generateSet(20)` < 200 ms, `composeExam(20)` < 400 ms, jsdom boot < 5 s, route render p95 < 2 s, bundle gzip ≤ 140 KB, precache ≤ 1.2 MB. Budgets are 3–8× local measurements to absorb CI variance; they guard structure, not micro-benchmarks.
- **Consequences:** Accidental O(n²) or unbounded content growth fails CI. Budgets need occasional review when intentional content grows; raise them in the same commit with a measured rationale.
