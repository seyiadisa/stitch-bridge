# Stitch Plugin Repository Guide

## Overview

This repository is for a Stitch-first Codex plugin whose primary product is a bundled skill set plus bundled Stitch MCP access. The plugin helps Codex generate Stitch passes, interpret approved designs, implement frontend apps faithfully, and review code-to-design fidelity.

Current source-of-truth docs to read before major work:

- `CODEX_STITCH_PLAYBOOK.md`
- `.codex/superpowers/specs/2026-05-16-stitch-plugin-design.md`
- `.codex/superpowers/plans/2026-05-16-stitch-plugin-implementation.md`

## Working Rules

- Explore the repo before editing and keep changes small, scoped, and reversible.
- Use a plan first for new features, architecture changes, dependency changes, or broad refactors.
- Follow the Stitch-first workflow. Design generation should use Stitch, persist durable artifacts, and fail clearly if Stitch is unavailable.
- Prefer specialized plugin skills over bespoke generator scripts whenever Codex can perform the implementation directly.
- Do not overwrite successful generated artifacts blindly. Prefer additive outputs and explicit pass history.
- Keep Codex state under `.codex/`. Do not create scattered AI state files elsewhere.

## Repository Layout

- Root governance: `AGENTS.md`
- Codex state: `.codex/`
- Task tracking: `.codex/tasks/`
- Durable design workflow artifacts: `.stitch/`
- Review-ready design deliverables: `design-output/`
- Plugin implementation: `plugins/`
- Planning and design docs: `.codex/superpowers/`

## Codex State File Purposes

- `.codex/HANDOFF.md`: current branch, working-tree snapshot, and exact next step
- `.codex/memory.md`: stable repo-specific reminders that should survive across tasks
- `.codex/tasks/roadmap.md`: high-level sequence of planned work
- `.codex/tasks/backlog.md`: queued tasks not started yet
- `.codex/tasks/in-progress.md`: only the work currently active
- `.codex/tasks/done.md`: completed milestones worth preserving

## Plugin Notes

- The plugin should remain skill-first. Bundle specialized skills and the Stitch MCP connection path inside the plugin.
- Keep runtime code minimal and narrowly focused on MCP/auth wiring or artifact normalization that skills alone cannot do reliably.
- Plugin-specific code and manifests should live under `plugins/`, with local plugin metadata inside each plugin folder.
- Keep workspace mutations inside the active target folder plus dedicated state directories.

## Verification Order

Run the smallest meaningful checks first:

1. lint
2. typecheck
3. targeted tests
4. broader validation only when justified

If you narrow or skip verification, record why in `.codex/HANDOFF.md`.
