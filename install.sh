#!/usr/bin/env bash
# Idempotent dotfiles installer. Creates symlinks from $HOME (and ~/.pi/) into
# this repo. Safe to re-run.
#
# Usage:
#   bash install.sh [--backup]
#
# --backup   move conflicting real files aside to ~/.dotfiles-backup-<ts>/
#            instead of refusing to clobber.

set -euo pipefail

REPO="${REPO:-$HOME/dotfiles}"
BACKUP_MODE=0
BACKUP_DIR="$HOME/.dotfiles-backup-$(date +%Y%m%d-%H%M%S)"

for arg in "$@"; do
  case "$arg" in
    --backup) BACKUP_MODE=1 ;;
    -h|--help)
      sed -n '2,11p' "$0" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
    *) echo "unknown flag: $arg" >&2; exit 2 ;;
  esac
done

[ -d "$REPO" ] || { echo "error: $REPO not found" >&2; exit 1; }

created=()
skipped=()
conflicts=()

# link <src-in-repo> <dest-absolute>
link() {
  local src="$1" dest="$2"
  if [ ! -e "$src" ] && [ ! -L "$src" ]; then
    return  # source doesn't exist in repo yet; silently skip
  fi
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

# --- pi config ---
# Symlink each tracked entry individually so ~/.pi/agent/{sessions,auth.json,bin/rg}
# remain real files outside the repo.
for name in AGENTS.md settings.json prompts skills chains extensions templates; do
  link "$REPO/pi/agent/$name" "$HOME/.pi/agent/$name"
done
link "$REPO/pi/bin/pi-init" "$HOME/.pi/bin/pi-init"

# --- shell rc files ---
link "$REPO/bash/.bash_profile" "$HOME/.bash_profile"
link "$REPO/bash/.bashrc"       "$HOME/.bashrc"
link "$REPO/bash/.profile"      "$HOME/.profile"
link "$REPO/zsh/.zshrc"         "$HOME/.zshrc"
link "$REPO/zsh/.zshenv"        "$HOME/.zshenv"
link "$REPO/zsh/.zprofile"      "$HOME/.zprofile"
link "$REPO/tcsh/.tcshrc"       "$HOME/.tcshrc"

# --- git, vim ---
link "$REPO/git/.gitconfig" "$HOME/.gitconfig"
link "$REPO/vim/.vim"       "$HOME/.vim"

# --- report ---
echo
echo "Created (${#created[@]}):"
for x in "${created[@]:-}"; do [ -n "${x:-}" ] && echo "  + $x"; done
echo "Already linked (${#skipped[@]}):"
for x in "${skipped[@]:-}"; do [ -n "${x:-}" ] && echo "  · $x"; done

if [ ${#conflicts[@]} -gt 0 ]; then
  echo
  echo "Conflicts (${#conflicts[@]}) — existing real files or wrong symlinks:"
  for x in "${conflicts[@]}"; do echo "  ! $x"; done
  echo
  echo "Re-run with --backup to move these aside before linking."
  exit 1
fi

echo
echo "✓ install complete."
