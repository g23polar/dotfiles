---
description: Add or improve tests for specified code
argument-hint: "<file, function, or module to test>"
---

Add tests for: $ARGUMENTS

1. **Find the test setup** — identify the test framework, runner, and directory conventions already used in this project. If none exist, suggest one appropriate for the language/framework and ask before proceeding.
2. **Read the target code** — understand the function/module to test, its inputs, outputs, edge cases, and error paths.
3. **Survey existing tests** — if related tests exist, match their style (naming, helpers, fixtures, assertions).
4. **Write tests** covering:
   - Happy path (expected inputs → expected outputs)
   - Edge cases (empty, null, boundary values)
   - Error paths (invalid input, missing dependencies, network failures)
5. **Run the tests** and fix any failures.
6. Report what's covered and what's explicitly not covered (and why).
