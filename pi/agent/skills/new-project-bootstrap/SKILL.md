---
name: new-project-bootstrap
description: Comprehensive bootstrap flow for a brand-new project. Begins with a deep-dive architectural conversation, then runs a plan → implement → review chain, and finally writes the initial UML.md. Load this when the user starts pi in an empty or near-empty directory, or when explicitly asked to bootstrap a new project.
---

# New Project Bootstrap

Use this when the current working directory is a fresh project (no `UML.md`,
little or no source code). Drive the user through four phases in order. Do not
skip phases. Do not start writing code before phase 3.

## Phase 1 — Architectural deep dive (conversation)

Before any planning, hold a short structured conversation with the user. Ask
the questions below **one batch at a time**, wait for answers, then move on.
Stop early if the user says "just start".

Batch A — Product:
1. What does this project do, in one sentence?
2. Who uses it and how (CLI, library, web service, daemon, ...)?
3. What is explicitly out of scope?

Batch B — Constraints:
4. Language / runtime / minimum versions?
5. Deployment target (local, container, edge, embedded, ...)?
6. Hard non-functional constraints (latency, offline, privacy, size)?

Batch C — Shape:
7. Expected lifetime: throwaway, prototype, long-lived/?
8. Solo or team? Open source?
9. Any existing systems it must integrate with?

Batch D — Architecture preferences:
10. Preferred architectural style (monolith, modular monolith, plugin, services)?
11. State / persistence needs?
12. Testing posture (unit-heavy, e2e-heavy, "I'll add tests later")?

Reflect back a 3–5 bullet summary of what you heard and ask the user to confirm
before moving to phase 2.

## Phase 2 — Plan

Write `plan.md` at the repo root following the `planning-first` skill's format
if it is available; otherwise use this structure:

```markdown
# Plan: <project name>
## Goal
## Architecture
  - chosen style + 1-paragraph rationale
  - top-level module list
## Tech choices
  - language, framework, key libs, build tool, test runner
## Milestone 1 — walking skeleton
## Milestone 2+ — features
## Risks
## Checklist
```

Show the plan to the user. Get explicit approval before phase 3.

## Phase 3 — Implement (walking skeleton first)

Build Milestone 1 only: the smallest end-to-end thing that runs. Tick checklist
items as you go. If reality contradicts the plan, stop and update the plan
before continuing.

## Phase 4 — Review and seal

When Milestone 1 runs:
1. Self-review the diff: read every file you created, look for dead code,
   inconsistencies, missing error handling, missing tests for the happy path.
2. Run the project (build + smoke test) and report results.
3. Generate `UML.md` per the `uml-maintenance` skill. Use the architecture
   from phase 1 as the source of truth, not just what currently exists in code.
4. Tell the user what is done, what is intentionally deferred, and what should
   happen next.

## Guardrails

- Do not invent product requirements the user did not state.
- Do not pick exotic dependencies without flagging the choice.
- Never skip phase 1 unless the user explicitly says "skip questions".
