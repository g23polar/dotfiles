export PATH="$HOME/.local/bin:$PATH"
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"

[ -f "$HOME/dotfiles/shell/aliases.sh" ] && source "$HOME/dotfiles/shell/aliases.sh"

function code() {
  command code "$@"
  sleep 3
  osascript <<'EOF'
tell application "System Events"
  tell process "Code"
    -- Terminal 1: bash (opens by default, just focus it)
    keystroke "`" using {control down, shift down}
    delay 1

    -- Terminal 2: git
    keystroke "`" using {control down, shift down}
    delay 0.5
    keystroke "git status"
    key code 36
    delay 1

    -- Terminal 3: claude
    keystroke "`" using {control down, shift down}
    delay 0.5
    keystroke "claude"
    key code 36
  end tell
end tell
EOF
}
export PATH="/usr/local/opt/postgresql@18/bin:$PATH"
