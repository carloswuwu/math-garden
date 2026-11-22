# ADR-0003: MATH_SPEC is the single answer oracle

- **Status:** Accepted (Phase 2, extended Phase 3.5)
- **Context:** Generators compute answers ad hoc; duplicated reasoning risks drifting answers, and tests need independent recomputation.
- **Decision:** Every generator op registers a `MATH_SPEC[op](math)` function recomputing the answer from the problem's `math` payload. `generateProblem({selfCheck:true})` asserts agreement. Contract tests sample every type/level and check answers, choices, solvers and displayed last explanation steps.
- **Consequences:** One source of truth for grading and explanations; adding a type requires a spec entry (enforced by tests). Explain steps are also guaranteed to end in the displayed answer.
