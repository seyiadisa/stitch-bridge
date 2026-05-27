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
- a review-ready pass folder under `design-output/`
- enough state in `.codex/HANDOFF.md` for the next skill to continue

If the design pass is not ready, stop with a clear failure instead of partially improvising.

## Workflow

1. Inspect existing `.stitch/`, `design-output/`, and `.codex/HANDOFF.md` before generating anything.
2. Write or update durable design inputs:
   - `.stitch/DESIGN.md`
   - `.stitch/UI_FLOW.md`
   - `.stitch/prompts/*.md`
3. Use `stitch-enhance-prompt` to turn rough screen prompts into structured Stitch-ready prompts before generation.
4. Reuse a known Stitch project when the workspace already references one. Otherwise create a new project, then persist the project and screen identifiers to `.stitch/metadata.json`.
5. Generate one screen at a time and preserve each result before moving on.
6. Keep raw artifacts under `.stitch/` and review-ready artifacts under `design-output/<pass-name>/`.
7. Stop at the review gate. Do not begin frontend implementation inside this skill.

## Handoff

After review approval exists, hand off to `stitch-interpret-design`.

## Guardrails

- Never silently fall back to a non-Stitch design generator.
- Never overwrite a successful artifact path blindly during retries.
- Prefer additive pass history over replacement.
- If Stitch readiness fails, explain the missing auth or project requirement clearly.
- Do not infer component structure or framework routing here. That belongs to `stitch-interpret-design`.

Load `references/artifact-contract.md` when you need the exact file contract.
