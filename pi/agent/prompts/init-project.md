---
description: Bootstrap a new project with .pi/, CONTEXT.md, docs/adr/, README, .gitignore
argument-hint: "[project-name]"
---

Bootstrap the current working directory as a new project using the planning-first harness.

Project name (optional): $ARGUMENTS

## Steps

1. Run `~/.pi/bin/pi-init` in the current working directory. It will:
   - Create `.pi/`, `docs/adr/`, `plans/` directories if missing
   - Copy `CONTEXT.md`, `README.md`, and the ADR seed from `~/.pi/agent/templates/` (only if those files do not already exist)
   - Append harness entries to `.gitignore` (idempotent — checks before appending)
   - Initialise git if not already a repo
2. After the script finishes, show the user:
   - The list of files created or skipped (from the script's output)
   - A short next-steps prompt: "Edit CONTEXT.md to describe the domain, then `/plan <feature>` to start."
3. Do NOT auto-commit. Leave staging to the user.

If `~/.pi/bin/pi-init` is missing, fall back to creating the scaffold directly from `~/.pi/agent/templates/`.
