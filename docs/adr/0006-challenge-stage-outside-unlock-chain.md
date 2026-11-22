# ADR-0006: Challenge stage is always open and outside the unlock chain

- **Status:** Accepted
- **Context:** Olympiad-style extension content should be reachable at any time and must not gate or be gated by grade progression.
- **Decision:** The `challenge` stage is excluded from `realStageList()`; `stageUnlocked('challenge')` is true, its skills are never locked, and the home page renders a separate gold challenge card. Challenge exams reuse the normal `composeExam`.
- **Consequences:** Learners can explore hard content early; progression maths (grade unlock, stats) ignore the challenge stage. All normal composition/assessment contracts still apply.
