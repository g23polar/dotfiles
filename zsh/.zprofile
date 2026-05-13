
# Setting PATH for Python 3.14
# The original version is saved in .zprofile.pysave
PATH="/Library/Frameworks/Python.framework/Versions/3.14/bin:${PATH}"
alias python='python3'
export PATH
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


eval "$(/usr/local/bin/brew shellenv zsh)"
