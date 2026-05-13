---
description: Implement the approved plan.md using the worker subagent
argument-hint: "[focus area or checklist item]"
---

Implement from the approved `plan.md`.

Focus (optional): $ARGUMENTS

1. Read `plan.md`. If it does not exist, stop and tell the user to run `/plan` first.
2. If a focus arg was given, only execute the matching checklist item(s); otherwise work through unchecked items in order.
3. Use the `worker` subagent for the actual edits. Keep it single-writer.
4. Tick checklist items in `plan.md` as they complete.
5. If the implementation diverges from the plan, stop, update `plan.md`, and surface the divergence to the user before continuing.
6. When all items are checked, run `/review` automatically.
