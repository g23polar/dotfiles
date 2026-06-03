export PATH="$HOME/.local/bin:$PATH"
export PATH="/usr/local/opt/postgresql@16/bin:$PATH"
export PATH="/usr/local/opt/postgresql@18/bin:$PATH"

[ -f "$HOME/dotfiles/shell/env.sh" ] && source "$HOME/dotfiles/shell/env.sh"
[ -f "$HOME/dotfiles/shell/aliases.sh" ] && source "$HOME/dotfiles/shell/aliases.sh"
[ -f "$HOME/dotfiles/shell/functions.sh" ] && source "$HOME/dotfiles/shell/functions.sh"

# Load local untracked secrets
[ -f ~/.zshrc.local ] && source ~/.zshrc.local
