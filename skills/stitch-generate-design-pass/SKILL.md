---
name: stitch-generate-design-pass
description: Use when Codex needs to create or refresh a Stitch design pass from a product brief, write `.stitch/` artifacts, reuse or create a Stitch project, and stop at design review before any frontend implementation begins.
---

# Stitch Generate Design Pass

Use the bundled `stitch` MCP server from this plugin. Treat Stitch as mandatory for this workflow.

This skill is only for producing design artifacts. It does not decide frontend structure and it does not write app code.

## Inputs

- a product brief, feature brief, or UI prompt
- the current workspace
- any known Stitch project id or prior pass history

## Required Output

Leave the workspace with:

- updated `.stitch/DESIGN.md`
- updated `.stitch/UI_FLOW.md`
- updated `.stitch/metadata.json`
- one prompt file per target screen under `.stitch/prompts/`
- raw Stitch artifacts for the current pass under `.stitch/designs/`
- downloaded `.stitch/designs/*.html` files for generated screens
- downloaded `.stitch/designs/*.jpeg` screenshots for generated screens
- a review-ready pass folder under `design-output/`
- enough state in `.codex/HANDOFF.md` for the next skill to continue

If the design pass is not ready, stop with a clear failure instead of partially improvising.

## Workflow

1. Inspect existing `.stitch/`, `design-output/`, and `.codex/HANDOFF.md` before generating anything.
2. Write or update durable design inputs:
   - `.stitch/DESIGN.md`
   - `.stitch/UI_FLOW.md`
   - `.stitch/prompts/*.md`
3. Turn rough screen prompts into structured Stitch-ready prompts before generation. Each prompt should name the target user, the screen purpose, the primary hierarchy, the key actions, the important states, and any non-negotiable trust or brand cues.
4. Reuse a known Stitch project when the workspace already references one. Otherwise create a new project, then persist the project and screen identifiers to `.stitch/metadata.json`.
5. Generate one screen at a time and preserve each result before moving on.
6. After generation metadata is current, run the bundled SDK helper:
   - `node ./scripts/download-stitch-artifacts.mjs`
   This step is required. It must download both HTML and image artifacts for the approved screens before handoff.
7. Keep raw artifacts under `.stitch/` and review-ready artifacts under `design-output/<pass-name>/`.
8. Stop at the review gate. Do not begin frontend implementation inside this skill.

## Handoff

After review approval exists, hand off to `stitch-interpret-design`.

## Guardrails

- Never silently fall back to a non-Stitch design generator.
- Never overwrite a successful artifact path blindly during retries.
- Prefer additive pass history over replacement.
- Treat `STITCH_API_KEY` as the only credential for both the bundled Stitch MCP server and SDK artifact downloads.
- If `STITCH_API_KEY` is missing, explain that the key must be available to the Codex process and that Codex may need to be restarted.
- If Stitch authentication or HTML downloads fail, stop the workflow. Do not continue with screenshot-only artifacts.
- Do not infer component structure or framework routing here. That belongs to `stitch-interpret-design`.

Load `references/artifact-contract.md` when you need the exact file contract.
