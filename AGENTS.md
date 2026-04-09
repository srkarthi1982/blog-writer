⚠️ Mandatory: AI agents must read this file before writing or modifying any code.

# AGENTS.md

This file complements the workspace-level Ansiversa-workspace/AGENTS.md (source of truth). Read workspace first.

MANDATORY: After completing each task, update this repo’s AGENTS.md Task Log (newest-first) before marking the task done.

## Scope
- Mini-app repository for 'blog-writer' within Ansiversa.
- Follow the parent-app contract from workspace AGENTS; do not invent architecture.

## Phase Status
- Freeze phase active: no new features unless explicitly approved.
- Allowed: verification, bug fixes, cleanup, behavior locking, and documentation/process hardening.

## Architecture & Workflow Reminders
- Prefer consistency over speed; match existing naming, spacing, and patterns.
- Keep Astro/Alpine patterns aligned with ecosystem standards (one global store pattern per app, actions via astro:actions, SSR-first behavior).
- Do not refactor or change established patterns without explicit approval.
- If unclear, stop and ask Karthikeyan/Astra before proceeding.

## Where To Look First
- Start with src/, src/actions/, src/stores/, and local docs/ if present.
- Review this repo's existing AGENTS.md Task Log history before making changes.

## Task Log (Recent)
- 2026-04-09 Investigated remote Astro DB alignment for Blog Writer: confirmed normal `npm run db:push` fails because both the checked-in `.env` and linked Vercel project point to `libsql://blog-writer-ansiversa.aws-ap-south-1.turso.io`, and that Turso host returns HTTP 404 / missing namespace instead of a live database endpoint. Verified the current token is not a Turso platform-admin token and cannot provision the missing DB from the repo, so the blocker is external DB provisioning rather than repo code or schema configuration.
- 2026-04-09 Bootstrapped Blog Writer from the approved app-starter baseline and implemented the V1 foundation from `docs/app-spec.md`: replaced placeholder landing/app pages with the Ansiversa landing standard plus protected `/app` and `/app/posts/[id]` flows, added the `BlogPosts` Astro DB schema and owner-safe create/list/detail/update/favorite/archive/restore helpers, enforced title/content/status validation with safe slug normalization, and verified the live local runtime end to end using a local Astro DB override because the current remote DB endpoint in `.env` returns HTTP 404 on `db:push`.
- 2026-04-09 Locked `docs/app-spec.md` for Blog Writer V1 using the new one-app-at-a-time spec-first process: defined the protected DB-backed personal drafting scope, route model, `BlogPosts` data model, validation rules, search/filter behavior, out-of-scope boundaries, and freeze tester guidance without changing runtime or schema code.
- 2026-03-23 Wave 1 cleanup patch: removed residual starter wording from homepage and protected-route copy, corrected app identity leftovers including `notifyParent` appKey wiring, refreshed shared repo notes, and validated with npm install, npm run typecheck, npm run build.
- Keep newest first; include date and short summary.
- 2026-02-09 Added repo-level AGENTS.md enforcement contract (workspace reference + mandatory task-log update rule).
- 2026-02-09 Initialized repo AGENTS baseline for single-repo Codex/AI safety.
