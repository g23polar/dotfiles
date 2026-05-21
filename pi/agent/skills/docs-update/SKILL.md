---
name: docs-update
description: Update project documentation — README.md, user guide, and UML.md. Evaluates whether the project is a coding project or a non-code workspace and adapts accordingly. Load when asked to update docs, refresh documentation, or after significant changes.
---

# Docs Update

Update a project's documentation to reflect its current state. Works for both
coding projects and non-code workspaces (research, interview prep, writing, etc.).

---

## Step 1 — Classify the project

Survey the repo to determine its type:

```bash
# Check for code signals
ls package.json Cargo.toml go.mod pyproject.toml Makefile *.sln pom.xml build.gradle Gemfile 2>/dev/null
find . -maxdepth 3 -type f \( -name "*.ts" -o -name "*.py" -o -name "*.go" -o -name "*.rs" -o -name "*.java" -o -name "*.rb" -o -name "*.cs" \) | head -5
```

Classify as:

| Type | Signals |
|---|---|
| **coding** | Has a build config, source files, package manager, `src/` or `lib/` directory |
| **non-code** | Mostly `.md`, `.docx`, `.xlsx`, images, research notes, no build system |
| **mixed** | Has some scripts/config but primary purpose is documentation or planning |

State your classification before proceeding. This affects Steps 2–4.

---

## Step 2 — Update README.md

Read the existing `README.md` (if any). Then update or create it following these
rules based on project type:

### Coding project README

Must include (add missing sections, update stale ones, leave accurate ones alone):

1. **Title + one-line description**
2. **Overview** — what it does, who it's for (2–4 sentences)
3. **Quick start** — install + run commands (copy-pasteable)
4. **Usage** — key commands, API surface, or CLI flags
5. **Project structure** — top-level directory map
6. **Development** — how to build, test, lint
7. **Configuration** — env vars, config files
8. **Contributing** — (if open source or team project)
9. **License** — (if applicable)

### Non-code project README

Must include:

1. **Title + one-line description**
2. **What this is** — purpose, context, audience (2–4 sentences)
3. **Contents** — file/directory map explaining what each piece is
4. **Status** — what's done, what's in progress, what's next
5. **Key references** — links or pointers to source-of-truth documents

### Rules
- Don't invent information — only document what exists.
- Preserve any hand-written sections the user clearly customized.
- Keep it concise. README is a landing page, not a manual.
- If a `CLAUDE.md` or `AGENTS.md` exists at project level, read it for context
  but do NOT duplicate its content into README.

---

## Step 3 — User guide (if applicable)

Check for an existing user guide (`docs/user-guide.md`, `docs/guide.md`,
`USER_GUIDE.md`, `GUIDE.md`, or similar).

- **If one exists:** read it, check for staleness against current code/files,
  and update as needed.
- **If none exists and the project is a coding project with end users:** ask the
  user if they want one created. Don't auto-create.
- **If non-code project:** skip this step (the README covers it).

---

## Step 4 — UML.md maintenance

### Coding or mixed project
Load and run the `uml-maintenance` skill:
- If `UML.md` exists → read it, update diagrams/module map/activity log.
- If `UML.md` doesn't exist → generate it from a repo survey.
- Always keep `UML.html` in sync.

### Non-code project
Still run `uml-maintenance` but adapt the diagram style:
- Use `flowchart` (not `classDiagram`) to show document/artifact relationships.
- Module map becomes a file/directory map.
- Skip class-level detail — focus on what feeds into what.
- If `UML.md` already exists and is accurate, just update the activity log.

---

## Step 5 — Summary

Print a short summary of what was changed:

```
## Docs updated
- README.md — [created | updated sections: X, Y, Z | no changes needed]
- User guide — [updated | created | skipped (non-code project) | skipped (not requested)]
- UML.md + UML.html — [created | updated | no changes needed]
```

---

## When NOT to use this skill
- For updating a single file the user specifically named — just edit it directly.
- For writing new documentation from scratch with custom structure — that's a
  planning task, not a docs-update.
