---
description: Stage and commit with a conventional commit message
argument-hint: "[type: message] or leave blank for auto-generated"
---

Create a git commit for the current changes.

1. Run `git status` and `git diff --stat` to see what changed.
2. If nothing is staged, stage all changes (`git add -A`). If some files are already staged, only commit those.
3. Generate a commit message following conventional commits format:

```
<type>(<scope>): <short summary>

<optional body — what and why, not how>
```

Types: `feat`, `fix`, `refactor`, `docs`, `style`, `test`, `chore`, `build`, `ci`, `perf`

If the user provided a message hint (`$ARGUMENTS`), use it. Otherwise, derive the message from the diff.

4. Show the proposed commit message and staged files to the user. Ask for confirmation before committing.
5. Run `git commit -m "..."` only after approval.
