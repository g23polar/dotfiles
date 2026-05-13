# CONTEXT

> Living document. Update whenever the domain language or system shape changes.
> AI agents read this first to orient. Keep it skimmable.

## Purpose

Personal dotfiles repo. Versions shell rc files (bash, zsh, tcsh), git, vim, and — as of ADR 0001 — pi agent config (skills, prompts, chains, extensions, templates, `AGENTS.md`, `settings.json`, `pi-init`). A single `install.sh` at the repo root symlinks everything into `$HOME` and `~/.pi/` on a fresh machine.

## Domain Glossary

<!-- Project-specific terms. Pull from real conversations and code. -->

| Term | Meaning |
|------|---------|
|      |         |

## System Shape

- `bash/`, `zsh/`, `tcsh/` — shell rc files. bash and zsh source `shell/env.sh` (env vars / PATH) and `shell/aliases.sh` (cross-shell aliases).
- `shell/env.sh` — prepends `~/dotfiles/pi/bin` to `$PATH` so `pi-init` is on PATH.
- `git/.gitconfig`, `vim/.vim/` — tool configs, symlinked into `$HOME`.
- `pi/agent/` + `pi/bin/pi-init` — pi coding agent config. Symlinked into `~/.pi/` per-entry, so machine-local state (`auth.json`, `sessions/`, bundled `rg`) stays outside the repo.
- `install.sh` — idempotent symlinker. `--backup` moves conflicting real files to `~/.dotfiles-backup-<ts>/`.
- `scripts/migrate-pi-into-dotfiles.sh` — one-time per existing machine; tarballs `~/.pi/`, moves tracked entries into the repo, runs `install.sh`.

## Key Decisions

<!-- Link to docs/adr/ entries here as they're created. -->

- [0000 Record architecture decisions](docs/adr/0000-record-architecture-decisions.md)
- [0001 Track pi agent config in dotfiles](docs/adr/0001-pi-config-in-dotfiles.md)

## Conventions

- Files in each top-level directory are intended to be symlinked into `$HOME` (or, for `pi/`, into `~/.pi/`).
- Cross-shell environment variables / PATH entries go in `shell/env.sh`. Cross-shell aliases go in `shell/aliases.sh`. Shell-specific behavior stays in `bash/`, `zsh/`, `tcsh/`.
- New ADRs in `docs/adr/`. Plans-before-implementation in `plans/`.
- `install.sh` is idempotent. Re-running it must be a no-op.

## Out of Scope

- OAuth tokens, chat history, bundled binaries (`~/.pi/agent/auth.json`, `sessions/`, `bin/rg`) — never tracked.
- A general-purpose dotfiles manager. `install.sh` is hand-rolled bash; no `stow`/`chezmoi` dependency.
- Per-machine overrides. If a divergence appears, decide between (a) splitting into a per-host dir, or (b) keeping the divergent file out of the repo.
