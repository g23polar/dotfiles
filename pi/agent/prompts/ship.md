---
description: Plan → Implement → Review end-to-end
argument-hint: "<feature or change>"
---

Run the full plan → implement → review workflow for: $ARGUMENTS

**Phase 1 — Plan**
Survey the relevant codebase, then write `plan.md` with Goal, Context, Approach, file-level Changes, Risks, and a Checklist.

Show the plan and **wait for user approval** before continuing. Do not bypass this gate.

**Phase 2 — Implement**
Work through the `plan.md` checklist. Tick items as they complete. If reality diverges from the plan, stop, update it, and tell the user.

**Phase 3 — Review**
Review the full diff against the plan. Flag bugs, security issues, plan divergence, missing tests, and doc gaps. Group by severity (🔴/🟡/🟢). Fix any 🔴 items.

**Phase 4 — Wrap up**
Update `UML.md` if the project has one. Summarize what was done.
