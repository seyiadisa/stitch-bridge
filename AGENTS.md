# Stitch Plugin Repository Guide

## Overview

This repository is for the Stitch-first Codex plugin that turns a product prompt into durable Stitch design artifacts, a review loop, and a frontend implementation workflow.

Current source-of-truth docs to read before major work:

- `CODEX_STITCH_PLAYBOOK.md`
- `docs/superpowers/specs/2026-05-16-stitch-plugin-design.md`
- `docs/superpowers/plans/2026-05-16-stitch-plugin-implementation.md`

## Working Rules

- Explore the repo before editing and keep changes small, scoped, and reversible.
- Use a plan first for new features, architecture changes, dependency changes, or broad refactors.
- Follow the Stitch-first workflow. Design generation should use Stitch, persist durable artifacts, and fail clearly if Stitch is unavailable.
- Do not overwrite successful generated artifacts blindly. Prefer additive outputs and explicit pass history.
- Keep Codex state under `.codex/`. Do not create scattered AI state files elsewhere.

## Repository Layout

- Root governance: `AGENTS.md`
- Codex state: `.codex/`
- Task tracking: `.codex/tasks/`
- Durable design workflow artifacts: `.stitch/`
- Review-ready design deliverables: `design-output/`
- Plugin implementation: `plugins/`
- Planning and design docs: `docs/superpowers/`

## Plugin Notes

- The plugin should remain an orchestrator for Stitch generation, review, and frontend scaffolding.
- Plugin-specific code and manifests should live under `plugins/`, with local plugin metadata inside each plugin folder.
- Keep workspace mutations inside the active target folder plus dedicated state directories.

## Verification Order

Run the smallest meaningful checks first:

1. lint
2. typecheck
3. targeted tests
4. broader validation only when justified

If you narrow or skip verification, record why in `.codex/HANDOFF.md`.
