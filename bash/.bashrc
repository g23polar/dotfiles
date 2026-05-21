export PATH=$PATH:/usr/bin

[ -f "$HOME/dotfiles/shell/env.sh" ] && source "$HOME/dotfiles/shell/env.sh"
[ -f "$HOME/dotfiles/shell/aliases.sh" ] && source "$HOME/dotfiles/shell/aliases.sh"
[ -f "$HOME/dotfiles/shell/functions.sh" ] && source "$HOME/dotfiles/shell/functions.sh"
export PATH="$HOME/.local/bin:$PATH" # or /Users/gautam/.zshrc
