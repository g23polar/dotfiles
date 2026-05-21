---
description: Refactor code with safety checks
argument-hint: "<what to refactor and why>"
---

Refactor: $ARGUMENTS

1. **Understand** — read the target code and its callers/dependents. Map what depends on it.
2. **Plan** — describe the refactoring in 3–5 bullets: what changes, what stays the same, what the end state looks like. Show to the user and wait for approval.
3. **Safety net** — before editing, check if tests exist for the affected code. If yes, run them first to establish a green baseline. If no tests exist, flag this risk.
4. **Refactor** — apply the changes. Preserve external behavior. Update callers if signatures changed.
5. **Verify** — run tests again (if they exist). Confirm the refactoring didn't break anything.
6. **Report** — summarize what changed and what was intentionally left alone.

Do NOT change behavior during a refactor. If a bug is found, note it separately and fix in a follow-up.
