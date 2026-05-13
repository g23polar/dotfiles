---
description: Plan → Implement → Review chain end-to-end
argument-hint: "<feature or change>"
---

Run the full planning-first chain for: $ARGUMENTS

Use the saved `plan-implement-review` chain:

```
subagent({ chainName: "plan-implement-review", task: "$ARGUMENTS" })
```

Pause for user approval between Plan and Implement steps. Do not bypass approval.
