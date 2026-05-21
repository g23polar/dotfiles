---
description: Review staged/unstaged changes against plan.md
---

Review the current changeset.

1. Collect the diff: prefer `git diff --cached` if anything is staged, else `git diff`. If both are empty, use `git diff HEAD~1`.
2. Read `plan.md` (if present) to know what was supposed to change.
3. Review the diff and flag:
   - **Plan divergence** — changes not in the plan, or planned items missing
   - **Bugs / logic errors** — off-by-one, null handling, race conditions
   - **Security issues** — hardcoded secrets, injection, auth gaps
   - **Missing tests** — untested happy paths or error paths
   - **Doc gaps** — stale README, missing ADRs for architectural decisions
4. Group findings by severity:
   - 🔴 **Must fix** — bugs, security, missing critical pieces
   - 🟡 **Should fix** — pattern deviations, missing docs
   - 🟢 **Nice to have** — style, optional improvements
5. Offer to apply fixes for any 🔴 items.
