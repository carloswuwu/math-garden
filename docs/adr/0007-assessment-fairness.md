# ADR-0007: First-attempt-only practice credit and configurable pass marks

- **Status:** Accepted
- **Context:** Practice allowed retrying until correct, and each correct click counted toward mastery; `mastery.quizPass` was declared but ignored.
- **Decision:** `applyResult(..., {credit})` only credits a first-attempt correct answer (retry-correct records the attempt but no correct/streak/difficulty). `quizStars(percent, pass)`, `gradeQuiz(results, pass)` and `applyQuizResult` honour each skill's `mastery.quizPass` (default 0.8).
- **Consequences:** Mastery reflects unaided performance and per-skill pass marks are usable. Saved progress stays compatible; retry-correct shows explanatory feedback.
