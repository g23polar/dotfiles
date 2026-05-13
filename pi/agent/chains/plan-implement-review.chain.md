---
name: plan-implement-review
description: Planning-first chain — scout the code, draft a plan, implement, then review the diff.
---

## scout
output: context.md

Map the parts of the repo relevant to: {task}

List the key files, current behavior, and any constraints the planner needs to know. Note prior ADRs in `docs/adr/` if relevant.

## planner
reads: context.md
output: plan.md
thinking: high

Using the context in `context.md`, draft a concrete implementation plan for: {task}

Follow the planning-first format: Goal, Approach, file-level Changes, Risks/Open Questions, and a numbered Checklist. Name exact files. Surface ambiguity instead of guessing.

## worker
reads: plan.md
progress: true

Implement `plan.md` end-to-end. Tick checklist items as you go. If reality contradicts the plan, stop and update the plan before continuing.

## reviewer

Review the resulting changes against `plan.md`. Flag:
- Plan divergence (changes not in plan, or planned items missing)
- Bugs and logic errors
- Security issues
- Missing tests
- Doc gaps (CONTEXT.md, ADRs)

Group findings by severity. Propose fixes for must-fix items.
