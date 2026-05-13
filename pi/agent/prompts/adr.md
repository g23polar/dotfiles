---
description: Create a new Architecture Decision Record in docs/adr/
argument-hint: "<decision title>"
---

Create a new ADR for: $ARGUMENTS

1. Ensure `docs/adr/` exists.
2. Find the next ADR number by scanning existing `NNNN-*.md` files (start at 0001 if none, ignoring the seed `0000-record-architecture-decisions.md`).
3. Slugify the title to kebab-case for the filename: `docs/adr/NNNN-<slug>.md`.
4. Use this template:

```markdown
# NNNN. <Title>

- **Status:** Proposed
- **Date:** <YYYY-MM-DD>

## Context
What is the issue we're seeing that motivates this decision?

## Decision
What is the change we're proposing or have agreed to?

## Consequences
What becomes easier or harder as a result?

## Alternatives Considered
- ...
```

5. Fill in the Context and Decision sections based on the conversation so far if obvious; otherwise leave placeholders and tell the user what to fill in.
6. Show the path to the user.
