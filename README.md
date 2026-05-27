# stitch-orchestrator

`stitch-orchestrator` is a shareable Codex plugin for turning approved Stitch designs into faithful frontend implementations.

Some of the design-ingestion and design-preparation ideas bundled here were adapted
from Google's `stitch-design` plugin in
[`google-labs-code/stitch-skills`](https://github.com/google-labs-code/stitch-skills).

## Architecture

This plugin is intentionally skill-first:

- bundled skills guide Codex through Stitch generation, design interpretation, implementation, and review
- imported design-prep skills make it easier to ingest existing apps, extract DESIGN.md files, and upload assets into Stitch
- imported utility skills make prompt preparation, design-system synthesis, and premium taste profiles available inside the same plugin
- a bundled Stitch MCP config gives the plugin its own Stitch connection path
- a single small Node script handles ADC token lookup and request headers for the remote Stitch MCP server

The plugin does **not** try to replace Codex with a large scripted frontend generator. Its job is to make Codex better at reading Stitch artifacts and implementing them accurately.

## Bundled Components

- `.codex-plugin/plugin.json`
- `.mcp.json`
- `skills/stitch-code-to-design/`
- `skills/stitch-design-md/`
- `skills/stitch-enhance-prompt/`
- `skills/stitch-extract-design-md/`
- `skills/stitch-extract-static-html/`
- `skills/stitch-generate-design-pass/`
- `skills/stitch-generate-design/`
- `skills/stitch-interpret-design/`
- `skills/stitch-manage-design-system/`
- `skills/stitch-implement-frontend/`
- `skills/stitch-review-sync/`
- `skills/stitch-taste-design/`
- `skills/stitch-upload-to-stitch/`
- `scripts/stitch-mcp-remote.mjs`

## Requirements

- `gcloud` installed and available on `PATH`
- `gcloud auth application-default login` already completed
- a billing project available through `GOOGLE_CLOUD_PROJECT`, `STITCH_BILLING_PROJECT`, or the active `gcloud` project
- `pnpm install` run once in this plugin folder to install `mcp-remote`, `tsx`, and `puppeteer`
- for HTML snapshot workflows, either a local Chrome/Edge install or a working Puppeteer browser download

## Stitch MCP Setup

The bundled `.mcp.json` launches:

- `node ./scripts/stitch-mcp-remote.mjs`

That script:

- resolves the local `mcp-remote` dependency
- obtains an ADC access token from `gcloud`
- resolves the Google billing project
- forwards the request to `https://stitch.googleapis.com/mcp`

## Intended Workflow

1. Use `stitch-extract-design-md`, `stitch-extract-static-html`, or `stitch-code-to-design` when you are starting from an existing app or codebase.
2. Use `stitch-design-md`, `stitch-taste-design`, or `stitch-manage-design-system` when you need to synthesize or sharpen the design system before generation.
3. Use `stitch-enhance-prompt` and `stitch-generate-design` when you are exploring or editing designs directly in Stitch.
4. Use `stitch-generate-design-pass` to create or refresh durable Stitch artifacts for the orchestrated workflow.
5. Use `stitch-interpret-design` to derive routes, shared primitives, and implementation priorities from the approved pass.
6. Use `stitch-implement-frontend` to build the app in Next.js, Nuxt, React + Vite, or Vue + Vite.
7. Use `stitch-review-sync` to compare the implementation back to Stitch and decide the smallest correction loop.
