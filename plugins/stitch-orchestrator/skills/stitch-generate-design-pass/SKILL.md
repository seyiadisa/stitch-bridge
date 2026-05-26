---
name: stitch-generate-design-pass
description: Generate or refresh a Stitch design pass from a product prompt using the bundled Stitch MCP server. Use when Codex needs to create `.stitch/` artifacts, reuse or create a Stitch project, generate screens one at a time, preserve review-ready outputs, and stop before frontend implementation.
---

# Stitch Generate Design Pass

Use the bundled `stitch` MCP server from this plugin. Treat Stitch as mandatory for this workflow.

## Workflow

1. Inspect existing `.stitch/`, `design-output/`, and `.codex/HANDOFF.md` before generating anything.
2. Write or update durable design inputs:
   - `.stitch/DESIGN.md`
   - `.stitch/UI_FLOW.md`
   - `.stitch/prompts/*.md`
3. Reuse a known Stitch project when the workspace already references one. Otherwise create a new project.
4. Generate one screen at a time and preserve each result before moving on.
5. Keep raw artifacts under `.stitch/` and review-ready artifacts under `design-output/<pass-name>/`.
6. Stop at the review gate. Do not begin frontend implementation inside this skill.

## Guardrails

- Never silently fall back to a non-Stitch design generator.
- Never overwrite a successful artifact path blindly during retries.
- Prefer additive pass history over replacement.
- If Stitch readiness fails, explain the missing auth or project requirement clearly.

Load `references/artifact-contract.md` when you need the exact file contract.
