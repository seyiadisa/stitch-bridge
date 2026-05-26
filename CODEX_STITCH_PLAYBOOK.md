# Codex Stitch Playbook

This playbook defines the preferred workflow for the Stitch plugin in this repository.

## Principle

The plugin is **skill-first**:

- Stitch is the design source of truth.
- Plugin skills guide Codex through generation, interpretation, implementation, and review.
- Runtime code stays minimal and should only handle MCP/auth wiring or artifact normalization.

## Preferred Workflow

1. Use the bundled Stitch MCP server from the plugin.
2. Generate or refresh a Stitch design pass and persist `.stitch/` artifacts.
3. Review and approve the design pass.
4. Interpret the approved design into an implementation brief.
5. Implement the frontend directly in the chosen framework.
6. Review the implementation back against Stitch and refine the smallest possible surface.

## Artifact Contract

- `.stitch/DESIGN.md`
- `.stitch/UI_FLOW.md`
- `.stitch/prompts/*.md`
- `.stitch/designs/*.response.json`
- `.stitch/designs/*.screen.json`
- `design-output/<pass-name>/`
- `.codex/HANDOFF.md`

## Guardrails

- Do not silently replace Stitch with another generator.
- Do not jump from raw Stitch output straight into coding without interpretation.
- Do not build a heavyweight scripted frontend generator when Codex can implement the app directly.
- Do not overwrite successful artifacts during retries.
