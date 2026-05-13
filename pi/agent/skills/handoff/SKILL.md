---
name: handoff
description: Manages the handoffs/ directory — a chronological log of session-ending state snapshots. Write a handoff when finishing a session or completing a feature. Read the latest handoff when resuming a project. The next agent reads ONLY the most recent handoff file; older files are the user's version history and must not be read by the agent. Load this skill when asked to hand off, wrap up, or when resuming a project that has a handoffs/ directory.
---

# Handoff Protocol

`handoffs/` is a chronological log of project state. Each file is a complete,
self-contained snapshot of where the project stands. The latest file is the
**only** file the next agent reads. Older files are version history for the
human — the agent must not read them.

---

## File naming

```
handoffs/YYYY-MM-DDTHHMM.md
```

Examples:
```
handoffs/2026-05-13T1430.md
handoffs/2026-05-13T1645.md   ← supersedes the one above
handoffs/2026-05-14T0900.md   ← this becomes the new latest
```

Use the current UTC time when writing. The lexicographic sort order of the
filenames is their chronological order — the last file alphabetically is always
the latest.

---

## Writing a handoff

Write a new handoff file whenever:
- A feature reaches `Complete` status (after Phase 5 review)
- A session ends mid-feature (partial progress, stopping for now)
- The user explicitly asks for a handoff (`/handoff`)

**Every handoff must be fully self-contained.** Do not reference or say "see
previous handoff". The agent reading it will not look at any other file unless
the handoff explicitly tells it to.

Use this template:

```markdown
# Handoff — YYYY-MM-DD HH:MM UTC

## Project state

<One paragraph. What is this project, what is its current overall status, and
what is the highest-priority thing the next session should focus on?>

## Completed this session

<What was finished. Link to features/<slug>/ dirs for completed features.
If nothing was completed, write "Nothing completed this session.">

- [<feature name>](../features/<slug>/README.md) — <one-line summary of what was done>

## In progress

<Features or tasks that were started but not finished. Be specific about
exactly how far along each one is and what remains.>

- [<feature name>](../features/<slug>/README.md) — <current phase, what's done, what's next>

If none: "Nothing in progress."

## Next steps

Ordered list of what the next agent or developer should do first:

1. <Most important next action — be specific enough that someone can act on it immediately>
2. <Second action>
3. ...

## Context and gotchas

Things the next agent needs to know that are not obvious from the code:

- <gotcha / environment note / known issue / external dependency status>
- ...

If none: "No special context."

## Reading list

Files the next agent should read (beyond this handoff and UML.md):

- `<path>` — <why it's relevant>
- ...

If none: "No additional files needed."
```

---

## Reading a handoff

When resuming a project that has a `handoffs/` directory:

1. List all files in `handoffs/`.
2. Sort them lexicographically — the **last** file is the latest.
3. Read **only that file**. Do not read any other file in `handoffs/`.
4. Follow any "Reading list" entries the handoff specifies.
5. Treat the handoff as the primary source of "what's happening now".
   UML.md is the architectural reference; the handoff is the operational state.

---

## Relation to other files

| File | Role |
|---|---|
| `handoffs/<latest>.md` | Operational state — what's happening right now, what to do next |
| `UML.md` | Architectural reference — module map, diagrams, long-term structure |
| `features/<slug>/README.md` | Per-feature spec and status |
| `features/<slug>/plan.md` | Technical plan for a specific feature |
| `features/<slug>/changes.md` | What was actually built |
| `features/<slug>/review.md` | Review findings |

The handoff links to features; features link to code. This chain means the next
agent can navigate from "what to do" → "what was planned" → "what exists" without
reading every source file.
