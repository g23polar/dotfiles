#!/usr/bin/env bash
# One-time migration: move ~/.pi/{agent/*, bin/pi-init} into the dotfiles repo,
# then invoke install.sh to symlink them back. Idempotent — safe to re-run.
#
# Usage:
#   bash scripts/migrate-pi-into-dotfiles.sh [--backup]
#
# --backup is forwarded to install.sh and causes existing real files in $HOME
# (e.g. ~/.zshrc) to be moved to ~/.dotfiles-backup-<ts>/ before linking.
#
# Always creates a tarball of ~/.pi/ at ~/pi-backup-<ts>.tgz before touching
# anything. Restore with: tar xzf <tarball> -C ~

set -euo pipefail

REPO="${REPO:-$HOME/dotfiles}"
PI="$HOME/.pi"
TS="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/pi-backup-$TS.tgz"

[ -d "$REPO" ] || { echo "error: $REPO not found" >&2; exit 1; }
[ -d "$PI" ]   || { echo "error: $PI not found"   >&2; exit 1; }

# 1. Backup (always, even on re-run — cheap insurance)
echo "→ backing up $PI to $BACKUP"
tar czf "$BACKUP" -C "$HOME" .pi

# 2. Ensure repo dirs exist
mkdir -p "$REPO/pi/agent" "$REPO/pi/bin"

# Helper: move source → dest unless source is already a symlink (already migrated).
# Returns 0 on success or expected no-op, 1 on unresolved conflict.
move_if_real() {
  local src="$1" dest="$2"
  if [ -L "$src" ]; then
    echo "  · skip (already symlink): $src"
  elif [ ! -e "$src" ]; then
    echo "  · skip (missing): $src"
  elif [ -e "$dest" ]; then
    echo "  ! conflict: $dest already exists and $src is a real file" >&2
    echo "    resolve manually: diff/merge, then remove one side" >&2
    return 1
  else
    echo "  + move: $src → $dest"
    mv "$src" "$dest"
  fi
}

echo "→ moving tracked pi/agent entries"
had_conflict=0
for name in AGENTS.md settings.json prompts skills chains extensions templates; do
  move_if_real "$PI/agent/$name" "$REPO/pi/agent/$name" || had_conflict=1
done

echo "→ moving pi-init"
move_if_real "$PI/bin/pi-init" "$REPO/pi/bin/pi-init" || had_conflict=1

if [ "$had_conflict" -ne 0 ]; then
  echo
  echo "✗ migration stopped: unresolved conflicts above." >&2
  echo "  Backup is safe at: $BACKUP" >&2
  exit 1
fi

# 3. Hand off to install.sh to (re)create symlinks
echo "→ running install.sh $*"
bash "$REPO/install.sh" "$@"

echo
echo "✓ migration complete. Backup: $BACKUP"
echo "  Verify: ls -la $PI/agent && command -v pi-init"
