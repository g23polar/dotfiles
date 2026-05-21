# dotfiles

Personal dotfiles for Gautam Nair (g23polar). Versions shell rc files, git, vim,
and [pi](https://github.com/earendil-works/pi) coding-agent config. A single
`install.sh` symlinks everything into `$HOME` and `~/.pi/` on any new machine.

## Quick start

```bash
git clone <repo> ~/dotfiles
bash ~/dotfiles/install.sh            # refuses to clobber existing files
bash ~/dotfiles/install.sh --backup   # moves conflicts to ~/.dotfiles-backup-<ts>/
```

Migrating a machine that already has `~/.pi/` set up:

```bash
bash ~/dotfiles/scripts/migrate-pi-into-dotfiles.sh
```

## What's managed

| Directory | What it does |
|---|---|
| `bash/` | `.bash_profile`, `.bashrc`, `.profile` |
| `zsh/` | `.zshrc`, `.zshenv`, `.zprofile` |
| `tcsh/` | `.tcshrc` |
| `shell/` | Shared `env.sh` (PATH, env vars), `aliases.sh`, `functions.sh` — sourced by bash and zsh |
| `git/` | `.gitconfig` |
| `vim/` | `.vim/` runtime directory |
| `pi/` | Pi agent config: `AGENTS.md`, `settings.json`, prompts, skills, chains, extensions, templates, `pi-init` script ([details](pi/README.md)) |
| `install.sh` | Idempotent symlink installer |
| `scripts/` | One-time migration helpers |
| `docs/adr/` | Architecture decision records |

## Project structure

```
dotfiles/
├── bash/                  # bash rc files → $HOME
├── zsh/                   # zsh rc files → $HOME
├── tcsh/                  # tcsh rc → $HOME
├── shell/                 # shared env.sh, aliases.sh, functions.sh
├── git/                   # .gitconfig → $HOME
├── vim/                   # .vim/ → $HOME
├── pi/
│   ├── agent/             # pi config → ~/.pi/agent/ (per-entry symlinks)
│   └── bin/pi-init        # bootstrap script → ~/.pi/bin/
├── install.sh             # idempotent symlinker
├── scripts/               # migrate-pi-into-dotfiles.sh
├── docs/adr/              # architecture decision records
├── CONTEXT.md             # domain language + system shape reference
├── UML.md                 # architectural memory (Mermaid diagrams)
└── migration-plan.md      # standalone recovery doc for pi migration
```

## Conventions

- **One directory per tool.** Files inside are symlinked into `$HOME` by `install.sh`.
- **Per-entry symlinks** for `~/.pi/agent/` — machine-local state (`auth.json`, `sessions/`, bundled `rg`) stays outside the repo.
- **Cross-shell config** goes in `shell/` — `env.sh` for env vars/PATH, `aliases.sh` for aliases, `functions.sh` for functions. Shell-specific behavior stays in its own directory.
- **`install.sh` is idempotent.** Re-running is always a no-op.
- **Sensitive files are never tracked** — `.gitignore` defensively excludes them even under `pi/`.

## Key decisions

- [ADR 0000 — Record architecture decisions](docs/adr/0000-record-architecture-decisions.md)
- [ADR 0001 — Track pi agent config in dotfiles](docs/adr/0001-pi-config-in-dotfiles.md)

## Documentation

- [CONTEXT.md](CONTEXT.md) — domain language, system shape, conventions
- [pi/README.md](pi/README.md) — pi config layout and what's not tracked
- [migration-plan.md](migration-plan.md) — standalone recovery doc for the pi migration
