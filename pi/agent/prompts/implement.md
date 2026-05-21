---
description: Implement the approved plan.md
argument-hint: "[focus area or checklist item]"
---

Implement from the approved `plan.md`.

Focus (optional): $ARGUMENTS

1. Read `plan.md`. If it does not exist, stop and tell the user to run `/plan` first.
2. If a focus arg was given, only execute the matching checklist item(s); otherwise work through unchecked items in order.
3. Tick checklist items in `plan.md` as they complete.
4. If the implementation diverges from the plan, **stop**, update `plan.md`, and surface the divergence to the user before continuing.
5. When all items are checked, run a self-review of the changes and report a summary.
