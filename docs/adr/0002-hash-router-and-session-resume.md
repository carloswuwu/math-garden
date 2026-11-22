# ADR-0002: Hash router with validated routes and session resume

- **Status:** Accepted (Phase 1)
- **Context:** Static hosting cannot rewrite deep links; users need shareable/back-forward-safe URLs and reload resume for long practice/quiz/exam runs.
- **Decision:** Routes are pure hash strings (`#/home`, `#/stage/:id`, `#/lesson|practice|quiz/:skillId`, `#/exam/:stageId`, `#/parent|settings|outline|formulas`). `parseHash`/`serializeRoute` are pure; `resolveRoute` validates against curriculum + unlock rules. `show(screen)` is the single focus/announce choke point. In-flight assessments are saved to sessionStorage for 24 h; resume is only offered for routes that still pass validation. `state.run {mode,key}` is the authoritative identity of an active run.
- **Consequences:** Back/Forward and reload work on static hosting. Invalid/stale routes fall back safely; leaving an assessment ends the in-memory run (session can still be resumed from the home Continue card/reload).
