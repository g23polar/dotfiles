# f — friendly find wrapper
# Usage:
#   f <pattern>            Search current dir for files matching *pattern*
#   f <pattern> <dir>       Search <dir> instead of current dir
#   f -t d <pattern>        Find directories only (-t f for files only)
#   f -e ext <pattern>      Restrict to a file extension (e.g. -e ts)
#   f -x <dir> <pattern>    Exclude a directory (repeatable)
function f() {
  local type_flag="" ext="" depth="" dir="." pattern=""
  local -a excludes=()

  while [ $# -gt 0 ]; do
    case "$1" in
      -t)  type_flag="$2"; shift 2 ;;
      -e)  ext="$2";       shift 2 ;;
      -d)  depth="$2";     shift 2 ;;
      -x)  excludes+=("$2"); shift 2 ;;
      -*)  echo "f: unknown flag $1" >&2; return 1 ;;
      *)
        if [ -z "$pattern" ]; then
          pattern="$1"
        else
          dir="$pattern"
          pattern="$1"
        fi
        shift
        ;;
    esac
  done

  if [ -z "$pattern" ]; then
    echo "Usage: f <pattern> [dir]  [-t d|f] [-e ext] [-d maxdepth] [-x exclude_dir]" >&2
    return 1
  fi

  local -a cmd=(find "$dir")

  # Prune common noisy dirs + user-specified excludes
  local -a prune_dirs=(.git node_modules .venv __pycache__ .next .cache)
  prune_dirs+=("${excludes[@]}")
  local first=1
  cmd+=( \( )
  for d in "${prune_dirs[@]}"; do
    [ -n "$d" ] || continue
    [ "$first" -eq 1 ] && first=0 || cmd+=( -o )
    cmd+=( -name "$d" -type d )
  done
  cmd+=( \) -prune -o )

  # Max depth
  [ -n "$depth" ] && cmd+=( -maxdepth "$depth" )

  # Type filter
  [ -n "$type_flag" ] && cmd+=( -type "$type_flag" )

  # Name matching — if ext is set, match pattern + extension; else glob
  if [ -n "$ext" ]; then
    cmd+=( -name "*${pattern}*.${ext}" )
  else
    cmd+=( -name "*${pattern}*" )
  fi

  cmd+=( -print )

  "${cmd[@]}" 2>/dev/null | sed "s|^\./||" | sort
}

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
    set the clipboard to "🤖 claude danger" 
    keystroke "v" using {command down}
    key code 36
    delay 0.3
    keystroke "clauded"
    key code 36


-- Terminal 4: pi
    keystroke "`" using {control down, shift down}
    delay 0.3
    keystroke "p" using {command down, shift down}
    delay 0.5
    keystroke "Terminal: Rename"
    key code 36
    delay 0.8
    set the clipboard to "🤖 pi"
    keystroke "v" using {command down}
    key code 36
    delay 0.3
    keystroke "pi"
    key code 36
  end tell
end tell

EOF


}
