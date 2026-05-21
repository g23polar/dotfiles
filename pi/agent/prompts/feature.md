---
description: Add a new feature — defaults to plan-first workflow, use /feature big for the full 5-phase process
argument-hint: "<feature description>"
---

Add a feature: $ARGUMENTS

If the first word of the arguments is "big" (e.g. `/feature big broadway lottery integration`), load and follow the `feature-addition` skill for the full 5-phase structured workflow with `features/<slug>/` directory.

Otherwise, use the standard plan-first workflow:

1. **Clarify** — if any requirements are ambiguous (trigger, inputs, outputs, external services), ask up to 5 focused questions before proceeding.
2. **Survey** — read `UML.md` and scan the codebase for existing patterns relevant to this feature.
3. **Plan** — write `plan.md` with Goal, Context, Approach, Changes, Risks, Checklist. Show and wait for approval.
4. **Implement** — work the checklist. Tick items as you go. Stop and update the plan if reality diverges.
5. **Review** — review the diff. Flag 🔴/🟡/🟢 issues. Fix must-fix items.
6. **Update UML.md** if the project has one.
