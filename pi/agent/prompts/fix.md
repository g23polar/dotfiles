---
description: Quick targeted fix — skip planning overhead for small changes
argument-hint: "<what to fix>"
---

Fix: $ARGUMENTS

This is a quick-fix workflow. Skip formal planning for small, well-scoped changes.

1. **Locate** — find the relevant file(s) and understand the current behavior.
2. **Fix** — make the minimal change that addresses the issue. Prefer surgical edits over rewrites.
3. **Verify** — if there's a test suite or build step, run it. If not, read the changed code once more to sanity-check.
4. **Report** — tell the user what you changed and why. One paragraph max.

If the fix turns out to be non-trivial (touching 3+ files, unclear root cause, architectural implications), **stop and suggest `/plan` instead**.
