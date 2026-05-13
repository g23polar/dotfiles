# Migration Plan: pi config → dotfiles repo

> Standalone recovery doc. If something breaks mid-migration, open a new pi
> session anywhere, read this file, and you can resume from the failure point.
> Companion: `plans/pi-config-into-dotfiles.md` (full design rationale).

## Target end-state

- `~/dotfiles/pi/agent/` contains the tracked pi config: `AGENTS.md`, `settings.json`, `prompts/`, `skills/`, `chains/`, `extensions/`, `templates/`.
- `~/dotfiles/pi/bin/pi-init` lives in the repo.
- `~/.pi/agent/<each of those entries>` is a **symlink** into `~/dotfiles/pi/agent/`.
- `~/.pi/bin/pi-init` is a **symlink** into `~/dotfiles/pi/bin/pi-init`.
- `~/.pi/agent/auth.json`, `~/.pi/agent/sessions/`, `~/.pi/agent/bin/rg` remain **real local files** (never tracked).
- `~/dotfiles/install.sh` exists, is idempotent, and on a fresh machine recreates every symlink (pi config + shell rc files + git + vim).
- `~/dotfiles/shell/env.sh` exists and prepends `~/dotfiles/pi/bin` to `$PATH`.
- `bash/.bashrc`, `zsh/.zshrc` source `shell/env.sh`. `tcsh/.tcshrc` has an inline path edit.
- `$HOME` shell rc files, `~/.gitconfig`, `~/.vim` are symlinks into the repo (after `install.sh` runs successfully).

## Current state snapshot (as of plan writing, 2026-05-13)

```
~/.pi/
├── agent/
│   ├── AGENTS.md           (real file, will be moved)
│   ├── settings.json       (real file, will be moved)
│   ├── auth.json           (real file, STAYS — secret)
│   ├── prompts/            (dir, moved)
│   ├── skills/             (dir, moved)
│   ├── chains/             (dir, moved)
│   ├── extensions/         (dir, moved)
│   ├── templates/          (dir, moved)
│   ├── sessions/           (dir, STAYS — machine-local)
│   └── bin/rg              (npm-installed binary, STAYS)
├── bin/pi-init             (real file, will be moved)
├── context-mode           (file, STAYS — local state)
└── plan.md                (file, STAYS — local state)

~/dotfiles/
├── bash/{.bash_profile,.bashrc,.profile}
├── zsh/{.zshrc,.zshenv,.zprofile}
├── tcsh/.tcshrc
├── shell/aliases.sh
├── git/.gitconfig
├── vim/.vim/
├── CONTEXT.md, README.md, UML.md, .gitignore
├── docs/adr/0000-record-architecture-decisions.md
├── plans/pi-config-into-dotfiles.md
└── migration-plan.md       (this file)
```

Secret scan of `~/.pi/agent` was clean. Re-scan before moving.

## Two-script structure

| Script | When | Idempotent | Destructive |
|---|---|---|---|
| `scripts/migrate-pi-into-dotfiles.sh` | One-time, per existing machine | Yes (no-ops if already migrated) | Yes (moves files) |
| `install.sh` | Every new machine; after config changes | Yes | Only creates symlinks; refuses to clobber unless `--backup` |

## File-by-file plan

### 1. `scripts/migrate-pi-into-dotfiles.sh` (new, executable)

```bash
#!/usr/bin/env bash
# One-time migration: move ~/.pi/{agent/*, bin/pi-init} into the dotfiles repo,
# then invoke install.sh to symlink them back. Idempotent.
set -euo pipefail

REPO="${REPO:-$HOME/dotfiles}"
PI="$HOME/.pi"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/pi-backup-$TS.tgz"

[ -d "$REPO" ] || { echo "error: $REPO not found"; exit 1; }
[ -d "$PI" ]   || { echo "error: $PI not found";   exit 1; }

# 1. Backup (always, even on re-run — cheap insurance)
echo "→ backing up $PI to $BACKUP"
tar czf "$BACKUP" -C "$HOME" .pi

# 2. Ensure repo dirs exist
mkdir -p "$REPO/pi/agent" "$REPO/pi/bin"

# Helper: move source → dest unless source is already a symlink (already migrated)
move_if_real() {
  local src="$1" dest="$2"
  if [ -L "$src" ]; then
    echo "  · skip (already symlink): $src"
  elif [ ! -e "$src" ]; then
    echo "  · skip (missing): $src"
  elif [ -e "$dest" ]; then
    echo "  ! conflict: $dest already exists; not overwriting"
    return 1
  else
    echo "  + move: $src → $dest"
    mv "$src" "$dest"
  fi
}

echo "→ moving tracked pi/agent entries"
for name in AGENTS.md settings.json prompts skills chains extensions templates; do
  move_if_real "$PI/agent/$name" "$REPO/pi/agent/$name" || true
done

echo "→ moving pi-init"
move_if_real "$PI/bin/pi-init" "$REPO/pi/bin/pi-init" || true

# 3. Hand off to install.sh to (re)create symlinks
echo "→ running install.sh"
bash "$REPO/install.sh" "$@"

echo
echo "✓ migration complete. Backup at: $BACKUP"
echo "  Verify with: ls -la $PI/agent && which pi-init"
```

### 2. `install.sh` (new, executable, repo root)

```bash
#!/usr/bin/env bash
# Idempotent dotfiles installer. Creates symlinks from $HOME into the repo.
# Usage: install.sh [--backup]
#   --backup   move conflicting real files aside to ~/.dotfiles-backup-<ts>/
set -euo pipefail

REPO="${REPO:-$HOME/dotfiles}"
BACKUP_MODE=0
BACKUP_DIR="$HOME/.dotfiles-backup-$(date +%Y%m%d-%H%M%S)"

for arg in "$@"; do
  case "$arg" in
    --backup) BACKUP_MODE=1 ;;
    -h|--help) sed -n '2,6p' "$0"; exit 0 ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

created=()
skipped=()
conflicts=()

# link <src-in-repo> <dest-absolute>
link() {
  local src="$1" dest="$2"
  if [ -L "$dest" ] && [ "$(readlink "$dest")" = "$src" ]; then
    skipped+=("$dest")
    return
  fi
  if [ -e "$dest" ] || [ -L "$dest" ]; then
    if [ "$BACKUP_MODE" -eq 1 ]; then
      mkdir -p "$BACKUP_DIR"
      mv "$dest" "$BACKUP_DIR/"
      echo "  · backed up: $dest → $BACKUP_DIR/"
    else
      conflicts+=("$dest")
      return
    fi
  fi
  mkdir -p "$(dirname "$dest")"
  ln -s "$src" "$dest"
  created+=("$dest")
}

# pi config (each entry individually, so ~/.pi/agent/{sessions,auth.json,bin/rg} stay real)
for name in AGENTS.md settings.json prompts skills chains extensions templates; do
  [ -e "$REPO/pi/agent/$name" ] && link "$REPO/pi/agent/$name" "$HOME/.pi/agent/$name"
done
[ -e "$REPO/pi/bin/pi-init" ] && link "$REPO/pi/bin/pi-init" "$HOME/.pi/bin/pi-init"

# Shell rc files
link "$REPO/bash/.bash_profile" "$HOME/.bash_profile"
link "$REPO/bash/.bashrc"       "$HOME/.bashrc"
link "$REPO/bash/.profile"      "$HOME/.profile"
link "$REPO/zsh/.zshrc"         "$HOME/.zshrc"
link "$REPO/zsh/.zshenv"        "$HOME/.zshenv"
link "$REPO/zsh/.zprofile"      "$HOME/.zprofile"
link "$REPO/tcsh/.tcshrc"       "$HOME/.tcshrc"
link "$REPO/git/.gitconfig"     "$HOME/.gitconfig"
link "$REPO/vim/.vim"           "$HOME/.vim"

# Report
echo
echo "Created (${#created[@]}):"; for x in "${created[@]:-}"; do [ -n "$x" ] && echo "  + $x"; done
echo "Skipped already-linked (${#skipped[@]}):"; for x in "${skipped[@]:-}"; do [ -n "$x" ] && echo "  · $x"; done
if [ ${#conflicts[@]} -gt 0 ]; then
  echo "Conflicts (${#conflicts[@]}):"; for x in "${conflicts[@]}"; do echo "  ! $x"; done
  echo
  echo "Re-run with --backup to move these aside before linking."
  exit 1
fi
```

### 3. `shell/env.sh` (new)

```sh
# Sourced by bash and zsh rc files. Environment variables only.
export PATH="$HOME/dotfiles/pi/bin:$PATH"
```

### 4. Edits to existing shell files

- `bash/.bashrc`: add `[ -f "$HOME/dotfiles/shell/env.sh" ] && . "$HOME/dotfiles/shell/env.sh"` near the top.
- `zsh/.zshrc`: add the same line near the top.
- `tcsh/.tcshrc`: add `set path = ( $HOME/dotfiles/pi/bin $path )`.

### 5. `.gitignore` additions

```
# pi runtime state (never track)
pi/agent/sessions/
pi/agent/auth.json
pi/agent/bin/rg
pi/agent/cache/
pi/agent/tmp/
pi/agent/keybindings.json
pi/agent/extensions/**/node_modules/
```

### 6. New docs

- `pi/README.md` — what's in here, how `install.sh` wires it.
- `docs/adr/0001-pi-config-in-dotfiles.md` — decision record.
- Update `CONTEXT.md` — note pi config + install model.
- Update `UML.md` — structure + Last activity.

## Execution order (the actual steps to run)

1. **Read this whole doc.** Make sure target end-state matches what you want.
2. In a pi session at `~/dotfiles`, run `/implement` against `plans/pi-config-into-dotfiles.md`. This **writes** the scripts and docs but does **not** execute the migration.
3. Review the files. Especially `install.sh` and `scripts/migrate-pi-into-dotfiles.sh`.
4. Outside pi (or after `/quit`-ing this session — pi will still work via the as-yet-unmigrated `~/.pi/`), run:
   ```
   bash ~/dotfiles/scripts/migrate-pi-into-dotfiles.sh
   ```
   If it complains about conflicts in `$HOME` (e.g. real `.zshrc`), re-run with `--backup`:
   ```
   bash ~/dotfiles/scripts/migrate-pi-into-dotfiles.sh --backup
   ```
5. Start a fresh shell, then `pi`. Should behave identically. Run `/reload` once to confirm skills/prompts/extensions still resolve.
6. `which pi-init` → expect `~/dotfiles/pi/bin/pi-init` (via PATH from `shell/env.sh`).
7. Stage and commit manually.

## Rollback

If anything looks wrong after step 4:

```bash
# Find the backup tarball (most recent ~/pi-backup-*.tgz)
ls -t ~/pi-backup-*.tgz | head -1
# Nuke the partially-migrated state
rm -rf ~/.pi
# Restore
tar xzf ~/pi-backup-<TIMESTAMP>.tgz -C ~
# Optional: undo the in-repo moves
rm -rf ~/dotfiles/pi
# Optional: undo $HOME symlinks created by install.sh
ls -t ~/.dotfiles-backup-*/ 2>/dev/null | head -1   # if --backup was used
# Move contents back manually
```

The repo-side `pi/` directory and any `~/.dotfiles-backup-*/` directory are safe to delete on rollback; nothing else in the repo is touched destructively by the migration.

## Verification checklist

- [ ] `ls -la ~/.pi/agent` shows symlinks for the 7 tracked entries, real files for `auth.json`, `sessions/`, `bin/`.
- [ ] `readlink ~/.pi/agent/AGENTS.md` → `~/dotfiles/pi/agent/AGENTS.md`.
- [ ] `readlink ~/.pi/bin/pi-init` → `~/dotfiles/pi/bin/pi-init`.
- [ ] `command -v pi-init` resolves (in a new shell that loaded `env.sh`).
- [ ] `pi` starts cleanly and `/reload` lists same prompts/skills/extensions as before.
- [ ] `bash ~/dotfiles/install.sh` re-run is a clean no-op (all "skipped already-linked").
- [ ] `git status` in the repo: untracked files are `pi/`, `install.sh`, `scripts/`, `shell/env.sh`, `migration-plan.md`, plans updates, ADR. No surprise files.

## Resuming from a broken state in a new session

If you open a new pi session because this one died mid-migration:

1. Read this file first.
2. Inspect `~/.pi/agent/` and `~/dotfiles/pi/` to determine how far the migration got.
3. Identify the most recent `~/pi-backup-*.tgz` — that's your safety net.
4. Decide: roll back (restore tarball, delete `~/dotfiles/pi/`) and start over, OR continue forward (the migration script is idempotent — re-running is safe if files are partially in-place).
5. If `install.sh` already exists in the repo but no symlinks are in place, just running it manually will finish the wiring.
