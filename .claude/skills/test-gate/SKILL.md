# Test Gate
Run the full test suite, then run lint. Only report success if BOTH pass. If either fails, show the errors and stop — do not proceed to commit.

Steps:
1. Run `npm test` (or project equivalent)
2. Run `npm run lint`
3. Summarize results in a single block
