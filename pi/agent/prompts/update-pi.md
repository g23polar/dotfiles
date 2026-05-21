---
description: Review and update global pi agent config (prompts, skills, chains, extensions, settings)
---

Help me review and update my global pi agent configuration.

1. Read the current state:
   - `~/.pi/agent/settings.json` — model defaults, thinking level
   - `~/.pi/agent/prompts/` — list all prompt templates with their descriptions
   - `~/.pi/agent/skills/` — list all skills with their descriptions
   - `~/.pi/agent/chains/` — list chains
   - `~/.pi/agent/extensions/` — list extensions

2. Present a summary of the current setup — what's installed, what each piece does.

3. Ask what the user wants to change:
   - Add / remove / edit prompts
   - Add / remove / edit skills
   - Change default model or thinking level
   - Fix or improve existing workflows
   - Something else

4. Make the changes. If the project is the dotfiles repo, edit in `pi/agent/` (the tracked copies). Otherwise, edit directly in `~/.pi/agent/`.

5. Remind the user to run `/reload` to pick up changes.
