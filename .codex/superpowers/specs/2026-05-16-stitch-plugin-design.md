# Stitch Plugin Design

## Goal

Build a shareable Codex plugin that bundles Stitch MCP access and a small set of specialized skills for:

1. generating Stitch design passes
2. interpreting approved Stitch artifacts
3. implementing frontend apps faithfully
4. reviewing code-to-design fidelity

## Architecture

### Plugin Center Of Gravity

The plugin is centered on bundled `SKILL.md` files, not a large scripted generator.

### Bundled Skills

- `stitch-generate-design-pass`
- `stitch-interpret-design`
- `stitch-implement-frontend`
- `stitch-review-sync`

### Thin Runtime

Keep runtime code minimal. It may:

- launch the bundled Stitch MCP connection
- resolve auth headers
- normalize artifact shapes

It should not attempt to replace Codex with a large custom frontend emitter.

## Supported Frontend Targets

- Next.js
- Nuxt
- React + Vite
- Vue + Vite

## Workspace Contract

- raw Stitch artifacts live under `.stitch/`
- review-ready artifacts live under `design-output/`
- Codex state lives under `.codex/`

## Non-Goals

- a heavyweight script-based frontend generator
- non-Stitch design generation
- arbitrary framework support outside the four named targets
