# Git Commit Guidelines

*Created by Dimash*

## Commit Philosophy
**One change = one commit.** If changes are unrelated, split them into separate commits.

## Commit Message Format
```
<type>(<scope>): <summary>

[optional body: what & why]

[optional footer: BREAKING CHANGE: … / Co-authored-by: …]
```

## Types
Choose one of the following:

| Type | Description |
|------|-------------|
| `feat` | New user-facing feature |
| `fix` | Bug fix or patch |
| `docs` | Documentation changes only |
| `refactor` | Code cleanup, no behavior change |
| `perf` | Performance or speed improvements |
| `test` | Add or update tests |
| `build` | Build system or dependencies |
| `ci` | CI/CD configuration or scripts |
| `chore` | Other tasks, no app functionality change |
| `revert` | Undo previous commit |

## Summary Rules
- Use **lowercase**
- Write in **imperative mood** ("add" not "added")
- **No period** at the end
- Keep it **concise and clear**

## Scope (Optional)
Helps identify the area of change:
- `api` - API changes
- `ui` - User interface
- `db` - Database
- `auth` - Authentication
- etc.

## Body (Optional)
- Only include if the change isn't obvious from the diff
- Explain **what** and **why**, not how
- Maximum **75 characters** per line

## Example
```
feat(ui): add dark mode toggle

Users can switch themes without reloading the page.
Improves accessibility and user experience.
```