# pi/

Version-controlled config for the [pi coding agent](https://github.com/earendil-works/pi).
Mirrors the on-disk layout of `~/.pi/` for the subset of files that are
source-of-truth config (as opposed to runtime state).

## Layout

```
pi/
├── agent/
│   ├── AGENTS.md          # global agent context, auto-loaded every session
│   ├── settings.json      # global pi settings
│   ├── prompts/           # /name prompt templates
│   ├── skills/            # /skill:name on-demand capabilities
│   ├── chains/            # multi-step prompt chains
│   ├── extensions/        # TypeScript pi extensions
│   └── templates/         # project bootstrap templates used by pi-init
└── bin/
    └── pi-init            # project bootstrap script
```

## Not tracked here (intentional)

These live as real files under `~/.pi/` on each machine:

| Path | Why |
|---|---|
| `~/.pi/agent/auth.json` | OAuth secret |
| `~/.pi/agent/sessions/` | Local chat history, machine-specific |
| `~/.pi/agent/bin/rg` | Bundled ripgrep, installed by the pi npm package |
| `~/.pi/context-mode`, `~/.pi/plan.md` | Per-machine runtime state |
| `~/.pi/agent/keybindings.json` | (If/when created) per-machine preference |

`.gitignore` defensively excludes these under `pi/` too, so a stray copy can't
sneak in.

## Install

From a fresh checkout:

```sh
bash ~/dotfiles/install.sh           # refuses to clobber existing files
bash ~/dotfiles/install.sh --backup  # moves conflicts to ~/.dotfiles-backup-<ts>/
```

`install.sh` symlinks each entry above into `~/.pi/agent/` (and
`pi-init` into `~/.pi/bin/`). It also wires up the shell rc files, git, and
vim — see the top-level repo README.

## Migration from a pre-existing `~/.pi/`

One-time, on a machine where pi is already set up with real files at `~/.pi/`:

```sh
bash ~/dotfiles/scripts/migrate-pi-into-dotfiles.sh
```

Tarballs `~/.pi/` to `~/pi-backup-<ts>.tgz`, moves tracked entries into this
repo, then runs `install.sh` to symlink them back.

## PATH

`shell/env.sh` (sourced by `bash/.bashrc` and `zsh/.zshrc`) prepends
`~/dotfiles/pi/bin` to `$PATH`, so `pi-init` is invokable anywhere.
