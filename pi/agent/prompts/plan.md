---
description: Create or update plan.md for the requested work (planning-first workflow)
argument-hint: "<what to plan>"
---

Apply the `planning-first` skill to: $ARGUMENTS

1. If `plan.md` already exists at repo root, read it and decide whether to extend or replace.
2. Use the `scout` subagent first to map relevant files if the area is unfamiliar.
3. Then invoke the `planner` subagent with the gathered context to draft `plan.md`.
4. Show the plan to the user. Do NOT start implementing until the user approves with "go", "ship it", or `/implement`.
