---
name: plan-implement-review
description: Planning-first chain — survey the code, draft a plan, implement, then review the diff.
---

## scout
output: context.md

Map the parts of the repo relevant to: {task}

List the key files, current behavior, and any constraints needed for planning. Note prior ADRs in `docs/adr/` if relevant.

## planner
reads: context.md
output: plan.md
thinking: high

Using the context in `context.md`, draft a concrete implementation plan for: {task}

Follow this format: Goal, Context, Approach (3–8 bullets, name exact files), Changes (file-level), Risks/Open Questions, and a numbered Checklist. Surface ambiguity instead of guessing.

**Show the plan to the user and wait for approval before continuing.**

## worker
reads: plan.md

Implement `plan.md` end-to-end. Tick checklist items as you go. If reality contradicts the plan, stop, update the plan, and tell the user before continuing.

## reviewer

Review the resulting changes against `plan.md`. Flag:
- Plan divergence (changes not in plan, or planned items missing)
- Bugs and logic errors
- Security issues
- Missing tests
- Doc gaps

Group findings by severity (🔴 must fix / 🟡 should fix / 🟢 nice to have). Fix 🔴 items.
