# Dotfiles handoff

A reference for picking this repo up cold — what it is, how it works, how to extend it, and what's deliberately excluded.

---

## 1. Overview

`~/dotfiles` is a **GNU Stow-managed dotfiles repository**. Configuration files physically live inside this repo, organized into "packages" by tool. Stow creates symlinks from `$HOME` to the files in here, so every program that expects a config at e.g. `~/.zshrc` finds it transparently.

**Philosophy:**
- The repo is the source of truth. Symlinks in `$HOME` point in.
- One package per tool — easy to enable/disable independently.
- Aliases and shell functions live in shared sourced files, not duplicated across rc files.
- Only configuration is tracked. Credentials, history, cache, and machine-local state stay out.

**Tooling:**
- GNU Stow 2.4.1 (`brew install stow`)
- Bash, Zsh (primary shells); tcsh has a placeholder config only

---

## 2. Repo structure

```
~/dotfiles/
├── .git/                         git repo, main branch
├── .gitignore                    OS junk + .netrwhist + .pi/ harness dirs
│
├── bash/                         Stow package -> $HOME
│   ├── .bashrc                   interactive bash; sources shared files
│   ├── .bash_profile             login bash; sources .bashrc, then cargo env
│   └── .profile                  generic profile; cargo env
├── zsh/                          Stow package -> $HOME
│   ├── .zshrc                    interactive zsh; sources shared files + PATH
│   ├── .zshenv                   always sourced; cargo env
│   └── .zprofile                 login zsh; Python 3.14 PATH + brew shellenv
├── git/.gitconfig                Stow package -> $HOME
├── vim/.vim/                     Stow package -> $HOME (.vim/ as a whole dir)
├── tcsh/.tcshrc                  Stow package -> $HOME (placeholder, cargo only)
│
├── shell/                        NOT a Stow package — sourced by absolute path
│   ├── aliases.sh                shared aliases (ls, python, clauded)
│   └── functions.sh              shared functions (gacp, hi)
│
├── handoffs/handoff.md           this file
│
└── (external doc workflow output — not Stow, not part of dotfiles config)
    ├── CONTEXT.md
    ├── README.md
    ├── UML.md
    ├── docs/adr/
    ├── plans/
    └── .pi/
```

**Key distinction:** the *Stow packages* are the directories whose contents get symlinked into `$HOME`. `shell/`, `handoffs/`, and the external-workflow dirs are **not** Stow packages — they live only inside the repo and are referenced (if at all) by absolute path.

---

## 3. How Stow works here

From `~/dotfiles`, running:

```sh
stow zsh
```

Walks `~/dotfiles/zsh/`, sees `.zshrc`, `.zshenv`, `.zprofile`, and creates symlinks:

```
~/.zshrc    -> dotfiles/zsh/.zshrc
~/.zshenv   -> dotfiles/zsh/.zshenv
~/.zprofile -> dotfiles/zsh/.zprofile
```

The symlinks use **relative paths** (`dotfiles/zsh/.zshrc`, not `/Users/...`), which makes the repo portable across machines/usernames.

For directories like `vim/.vim/`, Stow either symlinks the whole directory (if `$HOME` has no conflict) or "folds" — creates the dir in `$HOME` and symlinks individual files inside. Current setup: `~/.vim` is a single symlink to `dotfiles/vim/.vim`.

Editing `~/.zshrc` or `~/dotfiles/zsh/.zshrc` is the same file — the symlink is transparent.

---

## 4. Shell sourcing chain

Understanding this matters when deciding *where* to put a new export, alias, or function.

### Zsh (default on macOS)

Every zsh session sources `.zshenv`. Login shells additionally source `.zprofile`. Interactive shells additionally source `.zshrc`.

Terminal.app opens **login + interactive**, so all three run in this order:

1. `.zshenv` — `. "$HOME/.cargo/env"`
2. `.zprofile` — Python 3.14 path, `eval "$(brew shellenv zsh)"`
3. `.zshrc` — PATH for `.local/bin`, postgres, then sources `shell/aliases.sh` and `shell/functions.sh`

### Bash

macOS Terminal.app opens bash as a **login shell**, which sources `.bash_profile` and **does not** automatically source `.bashrc`. The standard fix (in place here): `.bash_profile` explicitly sources `.bashrc`.

1. `.bash_profile` — sources `.bashrc`, then cargo env
2. `.bashrc` — adds `/usr/bin` to PATH, sources `shell/aliases.sh` and `shell/functions.sh`

For non-login subshells (scripts, `bash` invoked from another shell), only `.bashrc` runs.

### Where to put new things

| Kind | Goes in |
|---|---|
| Alias usable in both shells | `shell/aliases.sh` |
| Function usable in both shells | `shell/functions.sh` |
| Alias zsh-only | `zsh/.zshrc` |
| Alias bash-only | `bash/.bashrc` |
| PATH/env vars zsh-only | `zsh/.zshrc` (interactive) or `zsh/.zprofile` (login) |
| PATH/env vars bash-only | `bash/.bash_profile` (login) or `bash/.bashrc` (interactive) |
| Env vars that ALL zsh sessions need (incl. scripts) | `zsh/.zshenv` |

---

## 5. Adding a new tool

```sh
mkdir ~/dotfiles/<tool>
mv ~/.<configfile> ~/dotfiles/<tool>/
cd ~/dotfiles && stow <tool>
```

The `mv` is critical: Stow refuses to create a symlink when the target path already exists as a real file. So the original must be relocated into the package first.

Examples that might come up:
- **Neovim**: `mkdir ~/dotfiles/nvim && mv ~/.config/nvim ~/dotfiles/nvim/.config/nvim` — note the nested `.config/nvim` path so Stow recreates it correctly under `$HOME/.config/nvim`.
- **Tmux**: `mkdir ~/dotfiles/tmux && mv ~/.tmux.conf ~/dotfiles/tmux/`
- **Starship**: `mkdir ~/dotfiles/starship && mv ~/.config/starship.toml ~/dotfiles/starship/.config/starship.toml`

After `stow <tool>`, verify with `ls -la ~/.<file>` — should show `-> dotfiles/<tool>/.<file>`.

---

## 6. Adding an alias or function

```sh
# alias usable in zsh and bash
echo "alias gs='git status'" >> ~/dotfiles/shell/aliases.sh

# function usable in zsh and bash
cat >> ~/dotfiles/shell/functions.sh <<'EOF'

function mkcd() {
  mkdir -p "$1" && cd "$1"
}
EOF
```

Open a new terminal (or `source ~/.zshrc`) to pick it up.

Don't add aliases or functions directly to `.zshrc` or `.bashrc` unless they're truly shell-specific (e.g. uses zsh-only `alias -g`).

---

## 7. Removing a tool / undoing stow

```sh
cd ~/dotfiles && stow -D <tool>     # removes the symlinks, files stay in repo
cd ~/dotfiles && stow -R <tool>     # re-stow (useful after renaming files inside the package)
```

To fully remove a tool from the dotfiles flow: `stow -D <tool>`, then either delete `~/dotfiles/<tool>/` or move the files back into `$HOME`.

---

## 8. What's deliberately NOT tracked

These were intentionally excluded when setting the repo up:

**Credentials / auth** (symlinks break or secrets in git):
- `~/.ssh/` — ssh enforces strict perms; symlinks can fail those checks
- `~/.aws/` — credentials
- `~/.claude.json`, `~/.claude.json.backup` — contains OAuth tokens
- `~/.claude/` — session state, machine-specific (left untouched per user request)

**Runtime state / cache / package-manager dirs** (not config, regenerated):
- `~/.cache/`, `~/.local/`, `~/.Trash/`, `~/.zsh_sessions/`
- `~/.npm/`, `~/.cargo/`, `~/.rustup/`, `~/.m2/`, `~/.cdk/`, `~/.ollama/`
- `~/.baml/`, `~/.codex/`, `~/.council/`, `~/.dbclient/`, `~/.ideaLibSources/`, `~/.llm-checker/`, `~/.pi/`, `~/.rhinocode/`

**Mixed config + state** (could be added selectively later if needed):
- `~/.ipython/`, `~/.jupyter/`, `~/.idlerc/`, `~/.matplotlib/`, `~/.vscode/`
- `~/.config/` (large XDG dir; pull in specific subdirs as needed)

**History files** (machine-local, noisy in git):
- `~/.bash_history`, `~/.zsh_history`, `~/.python_history`, `~/.lesshst`, `~/.viminfo`

**OS junk:**
- `~/.CFUserTextEncoding`, `~/.DS_Store`

If something from these lists later turns out to be worth tracking selectively, stow supports nested paths — e.g. `~/dotfiles/vscode/.config/Code/User/settings.json` would symlink just that one file.

---

## 9. Known issues / TODOs

1. **`zsh/.zshrc` has both `postgresql@16` and `postgresql@18` on PATH.** `@18` is exported last so it wins; `@16` is dead. Decide which is actually used and delete the other line.
2. **`bash/.bashrc` has `export PATH=$PATH:/usr/bin`.** `/usr/bin` is already on macOS's default PATH via `/etc/paths`. Tautology, safe to remove.
3. **No git remote configured.** If sync across machines or backup is wanted: `gh repo create dotfiles --private --source=. --push`.
4. **tcsh package is a placeholder** — only sources cargo env, no aliases/functions. tcsh has different syntax (no functions, `alias name value` without `=`), so the shared `shell/*.sh` files cannot be sourced from it without a translation layer. If you stop using tcsh, can be removed via `stow -D tcsh` and `rm -rf ~/dotfiles/tcsh`.

---

## 10. New machine setup

```sh
# 1. install Stow
brew install stow

# 2. clone the repo
git clone <remote> ~/dotfiles
cd ~/dotfiles

# 3. (optional) back up any existing dotfiles that would conflict
#    Stow will refuse to stow a package if a real file exists at the target path
mv ~/.zshrc ~/.zshrc.bak  # etc., as needed

# 4. stow each package
stow zsh bash git vim tcsh

# 5. verify symlinks
ls -la ~/.zshrc ~/.bashrc ~/.gitconfig ~/.vim    # should all be symlinks
```

External tools that the rc files assume are installed (the rc files don't fail if missing, but features won't work):
- Homebrew (`/usr/local/bin/brew`)
- Cargo / Rust (`~/.cargo/env`)
- Postgres via brew (one of `postgresql@16`, `postgresql@18`)
- Python 3.14 at `/Library/Frameworks/Python.framework/Versions/3.14/`
- VS Code (`code` CLI) — for the `hi()` function
- `claude` CLI — for the `clauded` alias

---

## 11. Troubleshooting

**Dangling symlink in `$HOME`** (target moved or renamed inside the package):
```sh
cd ~/dotfiles && stow -R <tool>
```

**Stow refuses to stow** (`existing target is not owned by stow`):
The conflicting file at the target path is a real file, not a stow-created symlink. Either move it out of the way (`mv ~/.zshrc ~/.zshrc.bak`) or move it into the package (`mv ~/.zshrc ~/dotfiles/zsh/`).

**Alias/function changes not visible:**
The current shell already loaded the old config. Open a new terminal or `source ~/.zshrc` (resp. `.bashrc`).

**Overwriting via the symlink** (`echo "foo" > ~/.zshrc`):
This writes through the symlink to the actual file at `~/dotfiles/zsh/.zshrc`. The symlink is not replaced; the target's content is overwritten. This is usually what you want — but `rm ~/.zshrc` would delete only the symlink, leaving the file in the repo orphaned.

**Vim creates `~/.vim/.netrwhist` and it shows as untracked:**
Already in `.gitignore`. Ignore it.

---

## 12. Quick reference

| Action | Command |
|---|---|
| Stow all packages | `cd ~/dotfiles && stow zsh bash git vim tcsh` |
| Unstow one | `cd ~/dotfiles && stow -D <tool>` |
| Re-stow (after rename inside package) | `cd ~/dotfiles && stow -R <tool>` |
| Dry-run a stow | `cd ~/dotfiles && stow -n -v <tool>` |
| List symlinks pointing into the repo | `find ~ -maxdepth 2 -type l -lname '*dotfiles/*'` |
| Reload zsh config in current session | `source ~/.zshrc` |
| Reload bash config in current session | `source ~/.bashrc` |
