---
description: Investigate an issue systematically
argument-hint: "<symptom or error>"
---

Debug: $ARGUMENTS

Follow a systematic investigation:

1. **Reproduce** — understand the exact symptom. Ask the user for error messages, logs, or steps to reproduce if not provided.
2. **Hypothesize** — list 2–4 likely causes ranked by probability. State your reasoning.
3. **Narrow** — for each hypothesis, identify the specific file and line range to check. Read them. Eliminate hypotheses that don't match the code.
4. **Root cause** — identify the actual cause. Explain it clearly.
5. **Fix** — propose the minimal fix. Show the change but **ask before applying** unless the user already said to fix it.
6. **Verify** — if possible, run the relevant test or build step to confirm.

If the issue is environmental (wrong version, missing dependency, config), say so and give the exact command to fix it rather than editing code.
