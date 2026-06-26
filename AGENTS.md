# AGENTS.md — SUST Codex Community Hackathon Mock Exam

## Repo state

This is a **planning-only repo**. No implementation code, config, or
dependencies exist. Everything must be built from scratch during the
4.5-hour hackathon round (QueueStorm Investigator challenge).

## Must-read docs (in order)

1. `docs/ARCHITECTURE.md` — TypeScript/Express backend blueprint
   (Clean Architecture, SOLID, AI provider port/adapter pattern).
2. `docs/AI_Safety_Docs_Lead_Role.md` — Python/FastAPI role playbook
   (safety guardrails, prompt design, edge-case tests, README template).

## Key facts

- **Hackathon:** SUST CSE Carnival 2026, Codex Community Hackathon.
- **Challenge:** QueueStorm Investigator — fintech copilot that classifies
  customer complaints + returns safe replies.
- **Team roles:** API/Backend Lead | Reasoning/Logic Lead | AI/Safety/Docs Lead.
- **Scoring:** Safety rules S1–S5 carry heavy penalties (up to −15 pts,
  disqualification at 2+ critical violations).
- **Target:** A public repo with either a live URL, Docker image, or runbook.

## Architectural tension

`ARCHITECTURE.md` describes a Node.js/TypeScript backend (Express, Zod,
Pino, Vitest, PM2, nginx). `AI_Safety_Docs_Lead_Role.md` describes a
Python/FastAPI approach. The team must pick one direction before coding.

## No existing tooling

- No `package.json`, `pyproject.toml`, `tsconfig.json`, or any config.
- No CI, linter, formatter, or test framework configured.
- No lockfile, no Dockerfile, no `.env.example`.
- Setup must be bootstrapped from scratch (recommended: `pnpm init` or
  `pip install fastapi uvicorn` depending on chosen stack).

## What to preserve from docs

- Safety module with regex-based credential/refund/URL scrubbing (S1–S3).
- `validate_response()` for enum-checking all response fields.
- 25+ hidden adversarial test cases covering 5 categories.
- Prompt-injection firewall (`_strip_injection` on input).
