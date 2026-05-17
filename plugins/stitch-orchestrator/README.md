# stitch-orchestrator

`stitch-orchestrator` is the local Codex plugin scaffold for the Stitch-first workflow described in this repository.

## Current scope

This scaffold provides:

- `.codex-plugin/plugin.json` metadata for local development
- a TypeScript runtime shell
- a minimal entrypoint contract that validates and normalizes run input
- structured scaffold validation errors for invalid command-surface input
- a routing stub that reports the normalized configuration without running orchestration

The actual Stitch workflow, review loop, state management, and framework generation layers will be added in later tasks.

## Command contract

The entrypoint currently accepts these inputs:

- `prompt`
- `targetFolder`
- `frameworkTarget`
- `reviewMode`
- `extraImplementationConstraints`

Allowed values:

- `frameworkTarget`: `next`, `react-vite`, `vue-vite`
- `reviewMode`: `default`, `staged`

## Local usage

Examples below use Bun, which matches this repo's default preference when `pnpm` is not already established.

Build the scaffold:

```bash
bun run build
```

Run the entrypoint with flags:

```bash
bun run start --prompt "Design a fintech onboarding flow" --framework-target next --review-mode staged --constraint "Use Tailwind CSS"
```

Or pass JSON:

```bash
bun run start --input "{\"prompt\":\"Design a SaaS dashboard\",\"frameworkTarget\":\"react-vite\"}"
```

The current output is either a normalized configuration payload with a `not_implemented` route result or a structured `validation_error` response for invalid input.
