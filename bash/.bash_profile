alias clauded='claude --dangerously-skip-permissions'
function gacp() {
  if [ $# -eq 0 ]; then
    echo "Usage: gacp <commit message>"
    return 1
  fi
  git add .
  git commit -m "$*"
  git push
}

function hi() {
  command code "$@"
  osascript <<'EOF'

-- Wait for Code to launch
repeat until application "Visual Studio Code" is running
  delay 0.5
end repeat
tell application "Visual Studio Code" to activate

-- Wait for Code process to be ready
tell application "System Events"
  repeat until exists process "Code"
    delay 0.5
  end repeat
end tell
delay 1

tell application "System Events"
  tell process "Code"

    -- Terminal 1: bash
    keystroke "p" using {command down, shift down}
    delay 0.5
    keystroke "Terminal: Rename"
    key code 36
    delay 0.8
    set the clipboard to "🖥️ bash"
    keystroke "v" using {command down}
    key code 36

    -- Terminal 2: git
    keystroke "`" using {control down, shift down}
    delay 0.3
    keystroke "p" using {command down, shift down}
    delay 0.5
    keystroke "Terminal: Rename"
    key code 36
    delay 0.8
    set the clipboard to "🌿 git"
    keystroke "v" using {command down}
    key code 36
    delay 0.3
    keystroke "git status"
    key code 36

    -- Terminal 3: claude
    keystroke "`" using {control down, shift down}
    delay 0.3
    keystroke "p" using {command down, shift down}
    delay 0.5
    keystroke "Terminal: Rename"
    key code 36
    delay 0.8
    set the clipboard to "🤖 claude"
    keystroke "v" using {command down}
    key code 36
    delay 0.3
    keystroke "claude"
    key code 36

  end tell
end tell
EOF
}
. "$HOME/.cargo/env"
