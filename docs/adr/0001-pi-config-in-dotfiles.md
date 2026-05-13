# 0001. Track pi agent config in the dotfiles repo

- **Status:** Accepted
- **Date:** 2026-05-13

## Context

The [pi coding agent](https://github.com/earendil-works/pi) keeps user config and runtime state mixed together under `~/.pi/`:

- **Config (source of truth, worth versioning):** `AGENTS.md`, `settings.json`, `prompts/`, `skills/`, `chains/`, `extensions/`, `templates/`, `bin/pi-init`.
- **Runtime state (machine-local, must not be versioned):** `auth.json` (OAuth secret), `sessions/` (chat history), `bin/rg` (bundled binary), `context-mode`, `plan.md`, future caches.

I want my pi setup to be reproducible across machines and diff-able in git, but I don't want OAuth tokens or gigabytes of chat history in the repo.

## Decision

Track the config subset in this dotfiles repo at `~/dotfiles/pi/`, and use **per-entry symlinks** to surface them at the paths pi expects under `~/.pi/`. Runtime state stays as real files under `~/.pi/` and is not touched.

Two scripts manage this:

- `scripts/migrate-pi-into-dotfiles.sh` — one-time per machine. Backs up `~/.pi/` to a tarball, moves tracked entries into the repo, then invokes `install.sh`.
- `install.sh` — repeatable. Creates the symlinks. Idempotent; refuses to clobber existing files unless `--backup` is passed (which moves conflicts to `~/.dotfiles-backup-<ts>/`).

Per-entry symlinks (not a single `~/.pi/agent → ~/dotfiles/pi/agent` symlink) so that `~/.pi/agent/sessions/`, `auth.json`, and `bin/rg` can remain as real local files without requiring pi to support a relocated state directory.

## Consequences

- Adding a new skill / prompt / extension is `git add` in the dotfiles repo. No special workflow.
- A new machine: clone dotfiles → `bash install.sh` → log into pi for `auth.json` → done.
- The `pi-reference` extension regenerates the auto-managed section of `AGENTS.md` on every session start, producing frequent diffs in that bounded section. Acceptable; that's the price of versioning the file.
- `auth.json` lives in a non-symlinked location, so even a careless `git add pi/` won't catch it. `.gitignore` also lists it defensively.
- The `pi-init` script is added to `$PATH` via `shell/env.sh`, making `pi-init` invokable from any directory without typing its full path.

## Alternatives considered

- **Single `~/.pi/agent → ~/dotfiles/pi/agent` symlink.** Simpler but would force `sessions/` and `auth.json` to either live in the repo or move to a custom location pi may not honor. Rejected.
- **`chezmoi` or `stow`.** Overkill for current scale, adds a runtime dependency. The hand-rolled `install.sh` is ~80 lines and fits in one file.
- **Bare-repo-with-`$HOME`-as-worktree pattern** (à la "the best way to store your dotfiles"). Clever, but incompatible with this repo's existing per-tool directory layout, and harder to reason about.
- **Don't track at all; just back up `~/.pi/` periodically.** No diff history, no cross-machine sync. Rejected.
