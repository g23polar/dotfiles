---
name: existing-project-resume
description: Resume work in an existing project. Reads the latest handoff (if any), then UML.md, and gives the user a fast on-ramp. Also handles quick catch-ups ("what was I doing?").
---

# Existing Project Resume

Use this when the project already has a `UML.md` or `handoffs/` directory, or
when the user asks "where did I leave off?" or "what was I doing?".

## Steps

1. **Check for a handoff.** If `handoffs/` exists, list files, take the last
   one lexicographically, read **only that file**. It's the primary source of
   "what's happening now". Do not read older handoff files.

2. **Read `UML.md`** end-to-end. Treat it as the architectural source of truth.
   If it looks stale (timestamps weeks old, references missing files), say so.

3. **Read any files** listed in the handoff's "Reading list" (if a handoff was found).

4. **Produce a resume brief:**
   - What the project is (one line)
   - Architecture style and top modules (one line)
   - Last completed work (one line, from handoff or UML.md Last activity)
   - Currently in progress (one line, from handoff), or "nothing in progress"
   - Recommended next step (one line)

5. **Ask the user** what they want to do: follow the suggested next step,
   continue an in-progress feature, or start something new.

6. Only then start touching code.

## Quick catch-up mode

If the user just wants a status check (e.g. "what was I doing?", "catch me up"),
do steps 1–4 only. Don't ask what to do next unless they want to keep working.

## When work is finished

Before declaring a task done, update `UML.md`:
- Refresh the diagram if classes/modules/relationships changed
- Update the "Last updated" line
- Prepend a new entry to "Last activity" (trim to 10 entries)

If `UML.md` contradicts the code, fix it in the same turn.
