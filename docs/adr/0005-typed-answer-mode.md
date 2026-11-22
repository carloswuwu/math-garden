# ADR-0005: Typed-answer mode without choices

- **Status:** Accepted
- **Context:** Multiple choice makes challenge and assessment items guessable.
- **Decision:** A skill level can set `input:true`; `generateProblem` then sets `p.input='text'` and removes `choices`. `checkAnswer` remains the single grader, accepting integers, decimals, and equivalent fractions. All challenge skills are typed; from `ms1` up every third numeric quiz/exam item is typed. Practice and primary grades remain multiple choice.
- **Consequences:** Guessing is eliminated for typed items; input must stay accessible (label, hint, Enter) and sessions must validate/restore input problems. The mode is data-driven, so more levels can opt in with one flag.
