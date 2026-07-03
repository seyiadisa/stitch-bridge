# stitch-orchestrator

`stitch-orchestrator` is a lean Codex plugin for turning approved Stitch passes into faithful frontend implementations.

## Architecture

This plugin is intentionally skill-first:

- bundled skills guide Codex through Stitch pass generation, interpretation, implementation, and review
- a bundled Stitch MCP config gives the plugin its own Stitch connection path
- a small MCP bridge handles ADC token lookup and request headers for the remote Stitch MCP server
- a small SDK helper downloads HTML and image artifacts for generated Stitch screens

The plugin does **not** try to replace Codex with a large scripted frontend generator. Its job is to keep the Stitch-first workflow available with as little prompt surface as possible.

## Bundled Components

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/stitch-generate-design-pass/`
- `skills/stitch-interpret-design/`
- `skills/stitch-implement-frontend/`
- `skills/stitch-review-sync/`
- `scripts/stitch-mcp-remote.mjs`
- `scripts/download-stitch-artifacts.mjs`

## Requirements

- `gcloud` installed and available on `PATH`
- `gcloud auth application-default login` already completed
- a billing project available through `GOOGLE_CLOUD_PROJECT`, `STITCH_BILLING_PROJECT`, or the active `gcloud` project
- `STITCH_API_KEY` set in the environment for the Stitch SDK artifact downloader
- `pnpm install` run once in this plugin folder to install `mcp-remote` and `@google/stitch-sdk`

This plugin now requires both access paths:

- Stitch MCP for agent-driven generation and project operations
- Stitch SDK for HTML and image artifact downloads

If either requirement is missing, the intended workflow is not ready.

## Stitch MCP Setup

The bundled `.mcp.json` launches:

- `node ./scripts/stitch-mcp-remote.mjs`

That script:

- resolves the local `mcp-remote` dependency
- obtains an ADC access token from `gcloud`
- resolves the Google billing project
- forwards the request to `https://stitch.googleapis.com/mcp`

## Stitch SDK Artifact Download

The bundled SDK helper downloads the full HTML and screenshot artifacts that Stitch exposes for every screen:

- `node ./scripts/download-stitch-artifacts.mjs`

The helper:

- requires `STITCH_API_KEY`
- reads `.stitch/metadata.json`
- resolves the Stitch project and screen IDs
- writes `.stitch/designs/<screen-id>.html`
- writes `.stitch/designs/<screen-id>.jpeg`

These HTML files are the primary structural reference for frontend implementation. Screenshots remain the visual verification artifact.

## Intended Workflow

1. Use `stitch-generate-design-pass` to create or refresh durable Stitch artifacts for the current product brief, then hydrate the screen HTML and image artifacts with the bundled SDK helper.
2. Use `stitch-interpret-design` to derive routes, shared primitives, and implementation priorities from the approved pass, using downloaded HTML as the primary structural reference.
3. Use `stitch-implement-frontend` to build the app in Next.js, Nuxt, React + Vite, or Vue + Vite.
4. Use `stitch-review-sync` to compare the implementation back to Stitch and decide the smallest correction loop.
