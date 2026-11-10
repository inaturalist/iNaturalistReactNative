# `.claude/`

The checked-in parts of this repo's AI agent configuration. Everything here is
tracked; anything personal or machine-specific — `settings.local.json`, local
worktrees, caches — stays gitignored, so pulling `main` is the whole install
step.

| Path | What it is |
| --- | --- |
| `CLAUDE.md` | Entry point. Imports `../AGENTS.md` and adds the Claude-only notes below the import. |
| `rules/` | Path-scoped rules. Each has a `paths:` frontmatter and loads only when a matching file is read. |

## What is portable and what is not

`../AGENTS.md` is tool-agnostic on purpose, so Codex and Cursor users get the
same core guidance.

**`rules/` is Claude Code specific.** Path-scoped rule loading is a Claude Code
feature; another tool will ignore these files entirely. Keep anything every agent
needs in `AGENTS.md`, not in a rule.

## Conventions

- **Rules are instructions; `agent-docs/` holds the reasoning.** Each rule names
  the doc it came from. Keep a rule under 40 lines — a long rule competes for
  attention with the rest of the loaded context.
- **Don't restate a rule in `AGENTS.md`.** `AGENTS.md` loads every session; a
  rule loads only when it is relevant. Duplicating it costs context and lets the
  two drift. The one exception is a rule whose mistake is made outside its own
  `paths:` — 64 of the 79 `useStore` callers are in `src/components/`, not
  `src/stores/` — so a few Realm and API rules also appear under Hard rules in
  `AGENTS.md`. Widening the rule's `paths:` is the wrong fix: it would load the
  whole rule on every component edit.
- **Commands live in `AGENTS.md` only.** It always loads, and you need a command
  from wherever you happen to be. A rule states the standard and points at the
  doc; it does not carry the invocation.

## Adding to this

A convention Claude gets wrong twice belongs in `AGENTS.md` or a rule. A prompt
you keep retyping belongs in a skill. A thing that must happen every single time
belongs in a hook.
