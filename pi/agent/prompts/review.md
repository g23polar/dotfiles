---
description: Review staged/unstaged changes against plan.md using the reviewer subagent
---

Run a structured review of the current changeset.

1. Collect the diff: prefer `git diff --cached` if anything is staged, else `git diff`.
2. Read `plan.md` (if present) to know what was supposed to change.
3. Invoke the `reviewer` subagent with the diff + plan, asking it to flag:
   - Plan divergence (changes not in the plan, or planned items missing)
   - Bugs / logic errors
   - Security issues
   - Missing tests
   - Documentation gaps (CONTEXT.md, ADRs)
4. Report findings to the user, grouped by severity. Offer to apply fixes for any "must-fix" items.
