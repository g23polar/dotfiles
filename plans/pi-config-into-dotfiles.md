# Plan: Move pi agent config into ~/dotfiles

## Goal

Make my pi setup (skills, prompts, chains, extensions, templates, `AGENTS.md`, `settings.json`, `pi-init`) versioned in this dotfiles repo and reproducible on a new machine via a single `install.sh`. The same `install.sh` also wires up the existing shell/git/vim dotfiles into `$HOME` and puts `pi-init` on `$PATH` via a new `shell/env.sh`. Local runtime state (`sessions/`, `auth.json`, bundled `rg`, caches) stays outside the repo. After install on a fresh box, running `pi` should pick up all my custom workflows and `pi-init` should be invokable from any directory.

## Context

- Current location: `~/.pi/` and `~/.pi/agent/` contain a mix of source-of-truth config and machine-local state.
- Tracked candidates under `~/.pi/agent/`: `AGENTS.md`, `settings.json`, `prompts/`, `skills/`, `chains/`, `extensions/`, `templates/`.
- Tracked under `~/.pi/`: `bin/pi-init`.
- Untracked (machine-local): `~/.pi/agent/auth.json` (OAuth secret), `~/.pi/agent/sessions/` (chat history, large), `~/.pi/agent/bin/rg` (bundled ripgrep binary, ~4.4 MB, installed by the pi npm package), `~/.pi/context-mode`, `~/.pi/plan.md`, any `cache/`/`tmp/`, future `keybindings.json` if per-machine.
- Existing dotfiles in this repo that should be symlinked into `$HOME`: `bash/{.bash_profile,.bashrc,.profile}`, `zsh/{.zshrc,.zshenv,.zprofile}`, `tcsh/.tcshrc`, `git/.gitconfig`, `vim/.vim/`.
- `secret-scan` of `~/.pi/agent` is clean today, so initial commit is safe.
- The `pi-reference` extension rewrites the auto block of `AGENTS.md` on every `session_start`. With `AGENTS.md` symlinked into the repo, expect frequent diffs in that section — acceptable, and it's the whole point of versioning it.
- Existing dotfiles convention here: one directory per tool (`bash/`, `zsh/`, `git/`, `vim/`, `tcsh/`, `shell/`). No install script yet — this plan introduces one.

## Approach

1. **Per-file symlinks, not one big directory swap.** Keep `~/.pi/agent/` as a real directory and symlink only the tracked entries from `~/dotfiles/pi/agent/` into it. This keeps `sessions/`, `auth.json`, and any future local state as real files under `~/.pi/agent/` without needing pi to support relocating them.
2. **Move, don't copy.** `git mv`-style move of the live files into the repo, then create symlinks back. Avoids the "two divergent copies" failure mode. A pre-flight backup tarball mitigates the one-shot risk.
3. **Idempotent `install.sh`.** Re-runnable; if a target is already the correct symlink, no-op. If a target exists as a real file/dir and differs, refuse and tell the user (don't clobber).
4. **One ADR** capturing the "track config, symlink in place, keep state local" decision so future-me knows why.
5. **No `stow`/`chezmoi` dependency.** Keep it plain bash + `ln -s`. Tools can come later if the repo grows.
6. **Alternatives considered & rejected:**
   - *Symlink the whole `~/.pi/agent` → `~/dotfiles/pi/agent`*: would force `sessions/` and `auth.json` into the repo or into a custom path pi may not honor. Rejected.
   - *Use `chezmoi`*: overkill for current scale, adds a runtime dep.
   - *Bare git repo with `$HOME` as worktree*: clever, but conflicts with the existing per-tool-directory layout of this repo.

## Changes

### pi config (moved from `~/.pi/`)
- `pi/agent/AGENTS.md` — moved from `~/.pi/agent/AGENTS.md`.
- `pi/agent/settings.json` — moved.
- `pi/agent/prompts/` — moved.
- `pi/agent/skills/` — moved.
- `pi/agent/chains/` — moved.
- `pi/agent/extensions/` — moved (no `node_modules/` today; gitignore defensively).
- `pi/agent/templates/` — moved.
- `pi/bin/pi-init` — moved from `~/.pi/bin/pi-init`.
- `pi/README.md` — new. What lives here and how `install.sh` wires it up.

### Shell PATH wiring
- `shell/env.sh` — new. POSIX-shell env file. Currently: prepends `$HOME/dotfiles/pi/bin` to `$PATH`. Future env vars land here.
- `bash/.bashrc` — edit: source `$HOME/dotfiles/shell/env.sh` (before or alongside the existing aliases.sh source).
- `zsh/.zshrc` — edit: source `$HOME/dotfiles/shell/env.sh`.
- `tcsh/.tcshrc` — edit: append `set path = ($HOME/dotfiles/pi/bin $path)` (tcsh doesn't share sh syntax; in-line rather than a separate file for now).

### Installer
- `install.sh` (repo root) — new. Idempotent. Does:
  1. Symlinks tracked entries from `pi/agent/*` into `~/.pi/agent/*`.
  2. Symlinks `pi/bin/pi-init` into `~/.pi/bin/pi-init`.
  3. Symlinks shell rc files into `$HOME` (bash, zsh, tcsh).
  4. Symlinks `git/.gitconfig` into `~/.gitconfig`.
  5. Symlinks `vim/.vim` into `~/.vim`.
  - For each target: if already the correct symlink → no-op. If missing → create. If a different real file/symlink exists → refuse and print what would conflict. Support `--backup` flag to move conflicting targets to `~/.dotfiles-backup-<timestamp>/` before linking.
  - Prints a summary at the end (created / skipped / conflicts).

### Repo hygiene
- `.gitignore` — add: `pi/agent/extensions/**/node_modules/`, `pi/agent/sessions/`, `pi/agent/auth.json`, `pi/agent/bin/rg`, `pi/agent/cache/`, `pi/agent/tmp/`, `pi/agent/keybindings.json`.
- `docs/adr/0001-pi-config-in-dotfiles.md` — new ADR.
- `UML.md` — update structure diagram + Last activity.
- `CONTEXT.md` — note that this dotfiles repo also hosts pi agent config and is wired via `install.sh`.

## Risks / Open Questions

- **Risk: breaking pi mid-migration.** Mitigation: tarball backup of `~/.pi/` before any move; run move + symlinks in a single bash block, then `/reload` to confirm. Tarball is the rollback.
- **Risk: `pi-reference` rewrites `AGENTS.md` and creates noisy diffs.** Acceptable; that section is bounded by markers.
- **Risk: `auth.json` accidentally committed in the future.** Mitigation: gitignore entry; file stays as a real local file in `~/.pi/agent/` (only specific entries are symlinked into the repo).
- **Risk: existing files in `$HOME` (`.zshrc`, `.gitconfig`, etc.) may already exist as real files and not symlinks.** The user is currently sourcing `$HOME/dotfiles/shell/aliases.sh` from somewhere, so at least one rc is live. `install.sh --backup` will move conflicts aside safely; without the flag it refuses to clobber.
- **Risk: tcsh edit unused.** If tcsh is rarely or never used, the in-line PATH edit there is harmless dead code. Acceptable.
- **Risk: `~/.vim` may contain machine-local artifacts** (e.g. `.netrwhist` is already in the repo, which is mildly weird — netrwhist is local history). Won't fix in this plan; flagged for follow-up.
- **Open: should `~/.pi/agent/bin/` be left as the bundled rg location, or also relocated?** Leaving as-is: it's npm-managed install state.
- **Open: keybindings.json doesn't exist yet.** Not in scope; pre-gitignored just in case.

## Checklist

### Pre-flight
- [ ] Backup: `tar czf ~/pi-backup-$(date +%Y%m%d-%H%M%S).tgz -C ~ .pi`.
- [ ] Re-scan secrets in `~/.pi/agent` (already clean, recheck).
- [ ] Snapshot the current state of `$HOME` rc files we'll touch: list whether each is a real file, a symlink, or missing.

### Move pi config into repo
- [ ] `mkdir -p ~/dotfiles/pi/agent ~/dotfiles/pi/bin`.
- [ ] Move: `AGENTS.md`, `settings.json`, `prompts/`, `skills/`, `chains/`, `extensions/`, `templates/` from `~/.pi/agent/` → `~/dotfiles/pi/agent/`.
- [ ] Move: `~/.pi/bin/pi-init` → `~/dotfiles/pi/bin/pi-init`.
- [ ] Symlink each back into place.
- [ ] Verify `~/.pi/agent/{auth.json,sessions,bin/rg}` untouched.

### Write installer + shell wiring
- [ ] `install.sh` at repo root (idempotent, `--backup` flag, exits non-zero on unresolved conflicts).
- [ ] `shell/env.sh` exporting `PATH="$HOME/dotfiles/pi/bin:$PATH"`.
- [ ] Edit `bash/.bashrc` and `zsh/.zshrc` to source `shell/env.sh`.
- [ ] Edit `tcsh/.tcshrc` to prepend `$HOME/dotfiles/pi/bin` to path.

### Repo hygiene
- [ ] Update `.gitignore` with defensive entries.
- [ ] Write `pi/README.md`.
- [ ] Create `docs/adr/0001-pi-config-in-dotfiles.md`.
- [ ] Update `CONTEXT.md`.
- [ ] Update `UML.md` (structure + Last activity).

### Verify
- [ ] Run `install.sh` — should set up `$HOME` symlinks (or list conflicts if `~/.zshrc` etc. are real files).
- [ ] Re-run `install.sh` — must be a clean no-op.
- [ ] `/reload` inside this pi session — confirm prompts/skills/extensions still listed.
- [ ] `which pi-init` after sourcing a new shell — should resolve to the symlink in `~/dotfiles/pi/bin/`.
- [ ] User stages and commits manually.

## Stretch (not this plan)

- Pre-commit hook scanning for `auth.json` content patterns or other secrets.
- Move `vim/.vim/.netrwhist` out of the repo (it's local state).
- A `make uninstall` / `install.sh --uninstall` that restores from `~/.dotfiles-backup-<ts>/`.
