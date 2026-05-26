---
name: stitch-review-sync
description: Review a frontend implementation against approved Stitch artifacts and drive the smallest correction loop. Use when Codex needs to identify code-to-design drift, missing states, weak component extraction, or decide whether to revise code or request a new Stitch pass.
---

# Stitch Review Sync

Compare the current frontend implementation back to the approved Stitch pass.

## Workflow

1. Compare each implemented screen to the approved Stitch artifacts.
2. Group findings into:
   - layout drift
   - hierarchy drift
   - token/style drift
   - missing states
   - wrong component boundaries
3. Prefer the smallest correction loop:
   - fix code when the design is still right
   - request a new Stitch pass only when the approved design itself is wrong or incomplete
4. Update `.codex/HANDOFF.md` with the current review status and next step.

## Guardrails

- Do not call a pass "done" when key trust cues or primary flow elements are still missing.
- Do not regenerate the whole app when a local code fix is enough.
- Keep review notes concrete and screen-specific.

Load `references/review-rubric.md` when you need a compact comparison rubric.
