# stitch-orchestrator

`stitch-orchestrator` is a lean Codex plugin for turning approved Stitch passes into faithful frontend implementations.

## Architecture

This plugin is intentionally skill-first:

- bundled skills guide Codex through Stitch pass generation, interpretation, implementation, and review
- a bundled Stitch MCP config gives the plugin its own Stitch connection path
- a small MCP bridge forwards the user's Stitch API key to the remote Stitch MCP server
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

- Node.js 18 or newer
- a Stitch API key available as `STITCH_API_KEY`
- `pnpm install` run once in this plugin folder to install `mcp-remote` and `@google/stitch-sdk`

`STITCH_API_KEY` is the plugin's only credential. The same key authenticates both access paths:

- Stitch MCP for agent-driven generation and project operations
- Stitch SDK for HTML and image artifact downloads

### Configure the Stitch API key

1. In Stitch, open **Settings**, create an API key, and copy it.
2. Expose the key to the process that launches Codex.

PowerShell:

```powershell
$env:STITCH_API_KEY = "your-key"
```

macOS or Linux:

```bash
export STITCH_API_KEY="your-key"
```

3. Start Codex from that shell. If Codex was already running, restart it so the plugin receives the variable.

Never commit the key to this plugin or to a target application repository. Use your operating system, shell profile, or secret manager when you need persistent configuration.

## Stitch MCP Setup

The bundled `.mcp.json` launches:

- `node ./scripts/stitch-mcp-remote.mjs`

That script:

- resolves the local `mcp-remote` dependency
- requires `STITCH_API_KEY`
- sends the key to `https://stitch.googleapis.com/mcp` in the `X-Goog-Api-Key` header

## Stitch SDK Artifact Download

The bundled SDK helper downloads the full HTML and screenshot artifacts that Stitch exposes for every screen:

- `node ./scripts/download-stitch-artifacts.mjs`

The helper:

- uses the same `STITCH_API_KEY` as the MCP connection
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
