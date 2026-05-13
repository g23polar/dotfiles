---
name: existing-project-resume
description: Resume work in an existing project by reading the latest handoff file (if present), then UML.md, summarizing the codebase, and surfacing the last recorded activity. Load this when pi opens in a directory that already has a UML.md, or when the user asks "where did I leave off".
---

# Existing Project Resume

Use this whenever the current project already has a `UML.md` at the repo root.
The goal is to ground yourself in the current operational state and architecture
without re-reading every file, and to give the user a fast on-ramp back into work.

## Steps

1. **Check for a handoff first.** If `handoffs/` exists, load the `handoff` skill
   and follow its reading protocol: list files, take the last one
   lexicographically, read **only that file**. The handoff is the primary source
   of "what's happening now". Do not read any other file in `handoffs/`.

2. **Read `UML.md` end-to-end.** Treat it as the architectural source of truth.
   If it looks stale (timestamps weeks old, references files that no longer
   exist), say so explicitly.

3. **Read any files listed in the handoff's "Reading list"** (if a handoff was
   found in step 1).

4. **Produce a resume brief** in your reply:
   - One line on what the project is.
   - One line on the architecture style and top modules.
   - One line on the last completed work (from handoff or UML.md Last activity).
   - One line on what's currently in progress (from handoff), or "nothing in progress" if none.
   - One line on the recommended next step (from handoff Next steps, or derived from UML.md).

5. **Ask the user** what they want to do: follow the suggested next step,
   continue an in-progress feature, start something new, or revise the architecture.

6. **Only then** start touching code. Use the Module map to jump to the
   relevant module rather than reading files at random.

## When the user finishes a unit of work

Before declaring the task done, update `UML.md` per the `uml-maintenance` skill:
- Refresh the diagram if classes/modules/relationships changed.
- Update the "Last updated" line.
- Prepend a new entry to "Last activity" with date, one-line summary, and the
  files touched. Trim the list to 10 entries.

## If UML.md looks wrong

If during work you discover UML.md contradicts the code, fix UML.md in the same
turn — do not let drift accumulate. Mention the correction in the activity entry.
