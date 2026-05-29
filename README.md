# stitch-orchestrator

`stitch-orchestrator` is a lean Codex plugin for turning approved Stitch passes into faithful frontend implementations.

## Architecture

This plugin is intentionally skill-first:

- bundled skills guide Codex through Stitch pass generation, interpretation, implementation, and review
- a bundled Stitch MCP config gives the plugin its own Stitch connection path
- a single small Node script handles ADC token lookup and request headers for the remote Stitch MCP server

The plugin does **not** try to replace Codex with a large scripted frontend generator. Its job is to keep the Stitch-first workflow available with as little prompt surface as possible.

## Bundled Components

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/stitch-generate-design-pass/`
- `skills/stitch-interpret-design/`
- `skills/stitch-implement-frontend/`
- `skills/stitch-review-sync/`
- `scripts/stitch-mcp-remote.mjs`

## Requirements

- `gcloud` installed and available on `PATH`
- `gcloud auth application-default login` already completed
- a billing project available through `GOOGLE_CLOUD_PROJECT`, `STITCH_BILLING_PROJECT`, or the active `gcloud` project
- `pnpm install` run once in this plugin folder to install `mcp-remote`

## Stitch MCP Setup

The bundled `.mcp.json` launches:

- `node ./scripts/stitch-mcp-remote.mjs`

That script:

- resolves the local `mcp-remote` dependency
- obtains an ADC access token from `gcloud`
- resolves the Google billing project
- forwards the request to `https://stitch.googleapis.com/mcp`

## Intended Workflow

1. Use `stitch-generate-design-pass` to create or refresh durable Stitch artifacts for the current product brief.
2. Use `stitch-interpret-design` to derive routes, shared primitives, and implementation priorities from the approved pass.
3. Use `stitch-implement-frontend` to build the app in Next.js, Nuxt, React + Vite, or Vue + Vite.
4. Use `stitch-review-sync` to compare the implementation back to Stitch and decide the smallest correction loop.
