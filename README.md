# stitch-bridge

`stitch-bridge` is a skill-first plugin for using Google Stitch design passes from Codex and Claude Code. It helps coding agents generate and hydrate Stitch artifacts, interpret an approved design, implement the frontend, and review code-to-design fidelity.

Clone it once, install its dependencies, and register the clone as a local plugin marketplace in either agent.

## What is included

- four shared agent skills under `skills/`
- a shared Stitch MCP connection in `.mcp.json`
- a Stitch SDK helper for downloading screen HTML and screenshots
- Codex plugin and marketplace metadata
- Claude Code plugin and marketplace metadata

The plugin deliberately keeps host-specific packaging thin. Codex and Claude Code use the same skills, scripts, credentials, and generated `.stitch/` artifacts.

## Requirements

- Node.js 18 or newer
- pnpm 10 or newer
- a Stitch API key available as `STITCH_API_KEY`
- Codex or Claude Code with plugin support

## Installation

### 1. Clone and prepare the plugin

```bash
git clone https://github.com/seyiadisa/stitch-bridge.git
cd stitch-bridge
pnpm install
```

Dependencies are installed inside the clone. Keep the cloned directory in place after registering it because the local marketplace points back to this checkout.

### 2. Configure the Stitch API key

In Stitch, open **Settings**, create an API key, and expose it to the shell that launches your coding agent.

PowerShell:

```powershell
$env:STITCH_API_KEY = "your-key"
```

macOS or Linux:

```bash
export STITCH_API_KEY="your-key"
```

Never commit the key to this repository or a target application repository. `STITCH_API_KEY` authenticates both Stitch MCP operations and Stitch SDK artifact downloads.

### 3. Add the plugin to your agent

#### Codex

From the repository root, register the clone as a local marketplace:

```bash
codex plugin marketplace add .
```

Open the Codex Plugins interface, find **Stitch Bridge**, and install or enable it. Start a new thread after installing or updating the plugin so its skills and MCP tools are loaded.

The exact installation surface can vary by Codex release. `codex plugin marketplace add .` registers the local catalog; use the Plugins interface when your CLI does not expose a separate plugin-install command.

#### Claude Code

From the repository root:

```bash
claude plugin marketplace add .
claude plugin install stitch-bridge@stitch-bridge
```

Reload plugins in an existing Claude Code session:

```text
/reload-plugins
```

For development without installing the marketplace plugin:

```bash
claude --plugin-dir .
```

Claude Code copies installed marketplace plugins into its cache. The MCP launcher uses `CLAUDE_PLUGIN_ROOT` when Claude provides it, so the bundled script resolves from the cached plugin directory.

### 4. Start or reload your agent

- Codex: start Codex from the configured shell and open a new thread.
- Claude Code: start it from the configured shell, or run `/reload-plugins` in an existing session.

## Bundled skills

- `stitch-generate-design-pass`: create or refresh a durable Stitch design pass
- `stitch-interpret-design`: convert an approved pass into an implementation brief
- `stitch-implement-frontend`: implement the design in a supported frontend stack
- `stitch-review-sync`: compare the implementation with the approved pass

Claude Code namespaces installed skills with the plugin name, for example:

```text
/stitch-bridge:stitch-generate-design-pass
```

Codex can select the skills automatically from their descriptions, or you can name the desired skill in your prompt.

During design generation, the plugin downloads Stitch's HTML and screenshot artifacts into `.stitch/`. The skills use those files as structural and visual references during implementation and review; no separate download command is required during normal use.

## Updating

Update the existing clone and refresh dependencies:

```bash
git pull
pnpm install
```

Refresh the registered marketplace in your agent, then start a new Codex thread or run `/reload-plugins` in Claude Code.

## License

MIT
