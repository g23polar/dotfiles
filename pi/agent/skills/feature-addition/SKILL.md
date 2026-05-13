---
name: feature-addition
description: Structured workflow for adding any new feature to an existing project. Creates a features/<slug>/ directory containing a living spec (README.md), technical plan (plan.md), implementation log (changes.md), and review report (review.md). Covers requirements clarification, codebase pattern survey, plan approval gate, implementation, UML.md update, and diff review. Use whenever a user asks to add, build, or implement a new feature, integration, job, endpoint, or module.
---

# Feature Addition Workflow

Every feature produces a self-contained directory at `features/<slug>/` that
serves as the authoritative record of why it was built, how it was designed,
what was actually implemented, and what the review found.

See [references/templates.md](references/templates.md) for the exact content
template for each document.

---

## Phase 0 — Assess clarity + create feature directory (gate)

Before touching any code, decide if the feature is fully specified.

Ask yourself:
- Do I know the **trigger / entry point**? (schedule, event, HTTP request, CLI)
- Do I know the **inputs**? (env vars, credentials, user data, API keys)
- Do I know the **outputs / side-effects**? (email, SMS, DB write, file, webhook)
- Do I know which **external services or APIs** are involved?
- Do I know enough to name the exact files I will create or change?

If **any** answer is "no" or "maybe":
- Ask the user **up to 5 focused questions in a single message** (grouped by theme).
- Do NOT proceed until you have clear answers.

Once requirements are clear:

1. Derive a **slug**: lowercase, hyphen-separated, max 40 chars (e.g. `broadway-lottery-signup`).
2. Create `features/<slug>/README.md` using the **Feature README template** from `references/templates.md`.
   - Status: `Planning`
   - Populate: Summary, Goal, Requirements (from the conversation), Acceptance Criteria, External Dependencies, Environment Variables.
   - Leave Patterns Followed and Related Files blank for now.
3. If `features/README.md` does not exist, create it using the **Features Index template**.
   Otherwise, add a row for this feature to the index table.

---

## Phase 1 — Survey existing patterns

Read the project before writing the plan.

1. Read `UML.md` (if present) for the architecture overview.
2. Find **1–2 existing features most similar** to the new one and read their source files completely.
3. Record findings in `features/<slug>/README.md` under **Patterns Followed**:
   - **Layout / naming** — where do similar things live? what are files called?
   - **Dependency management** — vendored into folder, shared module, top-level requirements?
   - **Configuration** — env vars, constants, config objects, secrets manager?
   - **Error handling** — exceptions raised, logged, returned as status dicts?
   - **Output** — email (SES), SMS (SNS), HTTP response, log, etc.
   - **Registration** — how is the feature wired in? (CDK stack entry, route file, plugin manifest, etc.)

---

## Phase 2 — Plan (approval gate)

Write `features/<slug>/plan.md` using the **Plan template** from `references/templates.md`.

The plan must include:
- Goal (one paragraph — what does done look like?)
- Patterns observed (copy from README.md Phase 1 findings)
- Approach (3–8 bullets; note alternatives rejected)
- File-level Changes (exact paths and what changes)
- Risks / Open Questions
- Checklist (see template for required items)

Update `features/<slug>/README.md`:
- Fill in **Related Files**: link to `plan.md`.

Show the plan to the user. **Wait for explicit approval** ("go", "ship it", "looks good", `/implement`) before writing any code. If the user requests changes, update `plan.md` and show again.

---

## Phase 3 — Implement

1. Update `features/<slug>/README.md` status to `In Progress`.
2. Work through `plan.md` end-to-end:
   - Mirror Phase 1 patterns exactly (naming, structure, error handling, config).
   - Tick checklist items in `plan.md` as you go.
   - If reality diverges from the plan, **stop, update `plan.md`, and tell the user** before continuing.
   - Do not add scope beyond what is in the plan.
3. After all checklist items are ticked, write `features/<slug>/changes.md` using the **Changes template** from `references/templates.md`:
   - List every file created or modified with a one-line description of what changed.
   - Note any deviations from the plan and why.
   - Note any decisions made during implementation.
4. Update `features/<slug>/README.md`:
   - Add link to `changes.md` under **Related Files**.

---

## Phase 4 — Update UML.md

Load the `uml-maintenance` skill and update `UML.md`:
- Add the new feature to the architecture diagram(s).
- Update the module breakdown if new files were added.
- Add a new "Last activity" entry: `YYYY-MM-DD — Added <feature name>: <one-line summary>`.

---

## Phase 5 — Review

Run a final review of the diff against `plan.md`. Write `features/<slug>/review.md`
using the **Review template** from `references/templates.md`.

Check and document:
- All checklist items ticked?
- New code matches existing patterns?
- No hardcoded secrets, credentials, or tokens?
- Env var requirements documented in README?
- Registration / wiring step complete?
- UML.md updated?

Group findings by severity:
- 🔴 **Must fix** — bugs, missing registration, exposed secrets, broken error handling
- 🟡 **Should fix** — pattern deviations, missing docs, incomplete env var documentation
- 🟢 **Nice to have** — style, optional improvements, future considerations

Fix all 🔴 items before proceeding. For each fix, update `changes.md` with a note.

When all 🔴 items are resolved:
- Update `features/<slug>/README.md` status to `Complete`.
- Update `features/README.md` index row status to `Complete`.
- Add link to `review.md` under **Related Files** in the feature README.
- Load the `handoff` skill and write a new `handoffs/YYYY-MM-DDTHHMM.md` file
  capturing current project state, this completed feature, any other features
  still in progress, and the recommended next steps.

---

## Directory layout produced

```
features/
  README.md                        ← index of all features (created once)
  <slug>/
    README.md                      ← living spec: goal, requirements, status, patterns, links
    plan.md                        ← technical plan (written before coding, updated if needed)
    changes.md                     ← what was actually built (written post-implementation)
    review.md                      ← review findings (written post-review)
```
