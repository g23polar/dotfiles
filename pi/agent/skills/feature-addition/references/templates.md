# Feature Addition — Document Templates

These are the exact templates the agent populates at each phase.
All `<angle-bracket>` fields must be filled in. All `[square-bracket]` fields
are optional or filled in later.

---

## Features Index (`features/README.md`)

Created once. Add a row per feature, keep sorted newest-first.

```markdown
# Features

| Feature | Summary | Status | Added |
|---|---|---|---|
| [<slug>](./<slug>/README.md) | <one-line summary> | Planning | <YYYY-MM-DD> |
```

Status values: `Planning` → `In Progress` → `Complete` → `Abandoned`

---

## Feature README (`features/<slug>/README.md`)

The living spec. Updated at every phase.

```markdown
# <Feature Name>

**Status:** Planning
**Slug:** <slug>
**Created:** <YYYY-MM-DD>
**Last updated:** <YYYY-MM-DD>

---

## Summary

<One sentence: what this feature does and why it exists.>

---

## Goal

<One paragraph: what does "done" look like from the user's perspective?>

---

## Requirements

What was asked for (verbatim or lightly edited from the conversation):

- <requirement 1>
- <requirement 2>
- ...

---

## Acceptance Criteria

Specific, testable conditions that define completion:

- [ ] <criterion 1>
- [ ] <criterion 2>
- ...

---

## External Dependencies

| Dependency | Purpose | Auth method |
|---|---|---|
| <service / API / library> | <what it's used for> | <API key / OAuth / service account / none> |

---

## Environment Variables

Variables that must be configured before the feature can run:

| Variable | Description | Example / format |
|---|---|---|
| `<VAR_NAME>` | <what it holds> | <example value or format hint> |

---

## Patterns Followed

*(Filled in during Phase 1 — Pattern Survey)*

- **Layout / naming:** ...
- **Dependency management:** ...
- **Configuration:** ...
- **Error handling:** ...
- **Output:** ...
- **Registration:** ...

---

## Related Files

*(Links added as each phase completes)*

- [ ] [plan.md](./plan.md)
- [ ] [changes.md](./changes.md)
- [ ] [review.md](./review.md)
```

---

## Plan (`features/<slug>/plan.md`)

Written in Phase 2. Updated during implementation if reality diverges.

```markdown
# Plan: <Feature Name>

**Status:** Draft | Approved | Superseded
**Approved by:** <user> on <YYYY-MM-DD>

---

## Goal

<One paragraph. What does done look like?>

---

## Patterns Observed

From surveying existing features most similar to this one:

- **Layout:** <e.g. "Each job is a folder under jobs/ with a handler.py">
- **Config:** <e.g. "Env vars injected via CDK environment dict">
- **Error handling:** <e.g. "Return {'status': 'error', 'message': ...} dict">
- **Output:** <e.g. "SES for email, SNS for SMS">
- **Registration:** <e.g. "create_scheduled_lambda() call in cdk/cron_stack.py">

---

## Approach

<3–8 bullets describing the chosen direction. Note alternatives considered and why rejected.>

- ...
- ...

---

## Changes

Files to create or modify:

| File | Action | What changes and why |
|---|---|---|
| `<path/to/file>` | Create / Modify / Delete | <description> |

---

## Risks / Open Questions

- <risk or question>
- ...

---

## Checklist

- [ ] New feature files created following existing naming and layout
- [ ] Feature registered in main config / stack / router / manifest
- [ ] All required env vars listed in plan and project README
- [ ] Dependencies documented (vendored, requirements.txt, shared module, etc.)
- [ ] Error handling matches existing pattern
- [ ] `features/<slug>/changes.md` written
- [ ] `UML.md` updated
- [ ] Diff reviewed and `features/<slug>/review.md` written
```

---

## Changes (`features/<slug>/changes.md`)

Written after implementation in Phase 3.

```markdown
# Changes: <Feature Name>

**Implemented:** <YYYY-MM-DD>
**Plan:** [plan.md](./plan.md)

---

## Files Created

| File | Description |
|---|---|
| `<path>` | <what it contains and does> |

---

## Files Modified

| File | What changed | Why |
|---|---|---|
| `<path>` | <description of change> | <reason> |

---

## Deviations from Plan

<If none, write "None.">

| Item | Planned | Actual | Reason |
|---|---|---|---|
| <item> | <what the plan said> | <what was done> | <why it changed> |

---

## Implementation Decisions

Decisions made during implementation that weren't in the plan:

- <decision and rationale>
- ...

---

## Post-fix Updates

*(Appended after Phase 5 review fixes)*

| Fix | File | Description |
|---|---|---|
| 🔴 | `<path>` | <what was fixed> |
```

---

## Review (`features/<slug>/review.md`)

Written in Phase 5.

```markdown
# Review: <Feature Name>

**Reviewed:** <YYYY-MM-DD>
**Plan:** [plan.md](./plan.md)
**Changes:** [changes.md](./changes.md)

---

## Checklist Verification

| Item | Status | Notes |
|---|---|---|
| Feature files follow existing layout | ✅ / ❌ | |
| Registered in config / stack | ✅ / ❌ | |
| Env vars documented | ✅ / ❌ | |
| Dependencies documented | ✅ / ❌ | |
| Error handling matches pattern | ✅ / ❌ | |
| No hardcoded secrets | ✅ / ❌ | |
| `changes.md` written | ✅ / ❌ | |
| `UML.md` updated | ✅ / ❌ | |

---

## Findings

### 🔴 Must Fix

<If none, write "None.">

- **[file:line]** — <description of issue and proposed fix>

### 🟡 Should Fix

<If none, write "None.">

- **[file:line]** — <description of issue and proposed fix>

### 🟢 Nice to Have

<If none, write "None.">

- <suggestion>

---

## Verdict

`Approved` | `Approved with fixes` | `Changes required`

<One paragraph summary of the overall quality and any outstanding notes.>
```
