---
name: planning-first
description: Enforce a planning-first workflow. Before non-trivial implementation, write or update plan.md with goals, approach, file-level changes, risks, and a checklist. Use when the user asks to build a feature, refactor, fix a non-obvious bug, or whenever scope is unclear. Skip only for one-line tweaks or pure questions.
---

# Planning-First Workflow

For any non-trivial change, write or update `plan.md` at the repo root **before** editing code.

## Triggers

Use this skill when the user asks to:
- Build a feature
- Refactor a module
- Fix a bug whose root cause is not obvious
- Migrate / upgrade dependencies
- Anything spanning more than ~2 files

Skip for: typos, one-line tweaks, pure Q&A, log inspection.

## Plan Structure

```markdown
# Plan: <short title>

## Goal
One paragraph. What does done look like?

## Context
Relevant files, prior decisions (link ADRs), constraints.

## Approach
The chosen direction in 3–8 bullets. Note alternatives considered and why rejected.

## Changes
- `path/to/file.ext` — what changes and why
- `path/to/other.ext` — ...

## Risks / Open Questions
- ...

## Checklist
- [ ] Step 1
- [ ] Step 2
- [ ] Tests
- [ ] Update CONTEXT.md if domain language changed
- [ ] ADR if architectural decision made
```

## Loop

1. Draft plan → show user → get approval (or explicit "go ahead").
2. Implement following the checklist, ticking items as you go.
3. If reality contradicts the plan, **stop and update the plan** before continuing.
4. On completion, summarize what changed vs. what was planned.

## Escalation

If a decision in the plan has long-term architectural consequences, create an ADR in `docs/adr/` (use `/adr` if available) rather than burying it in `plan.md`.
