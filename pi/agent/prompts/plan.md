---
description: Create or update plan.md for the requested work
argument-hint: "<what to plan>"
---

Create a plan for: $ARGUMENTS

1. If `plan.md` already exists at repo root, read it and decide whether to extend or replace.
2. Survey the relevant parts of the codebase first — identify key files, current behavior, constraints, and any ADRs in `docs/adr/`.
3. Draft `plan.md` following this structure:

```markdown
# Plan: <short title>

## Goal
One paragraph. What does done look like?

## Context
Relevant files, prior decisions (link ADRs), constraints.

## Approach
3–8 bullets. Note alternatives considered and why rejected.

## Changes
- `path/to/file.ext` — what changes and why

## Risks / Open Questions
- ...

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] ...
```

4. Show the plan to the user. **Do NOT start implementing** until the user approves with "go", "ship it", "looks good", or `/implement`.
