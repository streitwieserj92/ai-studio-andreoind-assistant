# AGENTS.md

Instructions for AI coding agents working in this repository.

## Working agreement
- Read before writing. Prefer the smallest change that solves the actual problem.
- Follow existing conventions (formatting, naming, structure) over personal preference.
- Never commit secrets, tokens, or credentials. Use `.env.example` as the template; `.env` stays local.
- When builds, tests, or typechecks exist, run them and confirm green before finishing.
- State clearly what changed, what was verified, and what was not.

## Scope
- Repository owner: Jackson Streitwieser. Human reviewer of record: Jackson.
- This project is AI-built; this file is the entry point for agent context.
- Out of scope by default: dependency upgrades, infra changes, and deletions outside the current task.
