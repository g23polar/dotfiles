#!/usr/bin/env bash
set -euo pipefail

read -rsp "Paste your Anthropic API key: " ANTHROPIC_KEY
echo

SECRETS_FILE="$HOME/.zshrc.local"
PROFILE="$HOME/.zshrc"

# Resolve symlink to find the real zshrc (for adding the source line)
if [[ -L "$PROFILE" ]]; then
    TARGET="$(readlink "$PROFILE")"
    if [[ "$TARGET" = /* ]]; then
        REAL_PROFILE="$TARGET"
    else
        REAL_PROFILE="$(cd "$(dirname "$PROFILE")" && cd "$(dirname "$TARGET")" && pwd)/$(basename "$TARGET")"
    fi
else
    REAL_PROFILE="$PROFILE"
fi

echo "Real profile location: $REAL_PROFILE"
echo "Secrets file: $SECRETS_FILE"

# Make sure the source line exists in the tracked zshrc
SOURCE_LINE='[ -f ~/.zshrc.local ] && source ~/.zshrc.local'
if ! grep -qF "$SOURCE_LINE" "$REAL_PROFILE" 2>/dev/null; then
    echo "" >> "$REAL_PROFILE"
    echo "# Load local untracked secrets" >> "$REAL_PROFILE"
    echo "$SOURCE_LINE" >> "$REAL_PROFILE"
    echo "Added source line to $REAL_PROFILE"
fi

# Write/update the key in the local untracked file
touch "$SECRETS_FILE"
chmod 600 "$SECRETS_FILE"
sed -i.bak '/^export ANTHROPIC_API_KEY=/d' "$SECRETS_FILE"
rm -f "${SECRETS_FILE}.bak"
echo "export ANTHROPIC_API_KEY=\"$ANTHROPIC_KEY\"" >> "$SECRETS_FILE"

# Log out of any existing Claude Code session
claude logout 2>/dev/null || true

export ANTHROPIC_API_KEY="$ANTHROPIC_KEY"

echo ""
echo "Done. Key written to $SECRETS_FILE (chmod 600, not in your dotfiles repo)"
echo "Open a new terminal or run: source ~/.zshrc"