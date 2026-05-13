---
name: existing-project-resume
description: Resume work in an existing project by reading UML.md, summarizing the codebase from it, and surfacing the last recorded activity. Load this when pi opens in a directory that already has a UML.md, or when the user asks "where did I leave off".
---

# Existing Project Resume

Use this whenever the current project already has a `UML.md` at the repo root.
The goal is to ground yourself in the architecture without re-reading every file,
and to give the user a fast on-ramp back into the work.

## Steps

1. **Read `UML.md` end-to-end.** Treat it as the source of truth for the
   architecture. If it looks stale (timestamps weeks old, references files
   that no longer exist), say so explicitly later.
2. **Produce a 5-bullet brief** in your reply:
   - One line on what the project is (from Overview).
   - Two lines on the architecture (style + top modules from Module map).
   - One line summarizing the most recent "Last activity" entry, with date.
   - One line proposing the next logical step, derived from the last activity
     and any TODOs visible in UML.md.
3. **Ask the user** what they want to do: continue the last thread, start
   something new, or revise the architecture.
4. **Only then** start touching code. Before reading source files at random,
   use the Module map to jump straight to the relevant module.

## When the user finishes a unit of work

Before declaring the task done, update `UML.md` per the `uml-maintenance` skill:
- Refresh the diagram if classes/modules/relationships changed.
- Update the "Last updated" line.
- Prepend a new entry to "Last activity" with date, one-line summary, and the
  files touched. Trim the list to 10 entries.

## If UML.md looks wrong

If during work you discover UML.md contradicts the code, fix UML.md in the same
turn — do not let drift accumulate. Mention the correction in the activity entry.
