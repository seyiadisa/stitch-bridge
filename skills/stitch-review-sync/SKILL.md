---
name: stitch-review-sync
description: Use when Codex needs to compare a frontend implementation against an approved Stitch pass, identify code-to-design drift, missing states, or weak component extraction, and choose the smallest correction loop without restarting the whole workflow.
---

# Stitch Review Sync

Compare the current frontend implementation back to the approved Stitch pass.

This skill is for evaluation and correction planning. It should decide whether to fix code, refine the interpretation, or request a new Stitch pass.

## Inputs

- the current frontend implementation
- the approved Stitch artifacts
- the implementation brief, if one exists
- recent verification output or visual review notes

## Required Output

Produce a review summary that:

- names concrete drift by screen
- separates code problems from design problems
- recommends the smallest next loop
- updates `.codex/HANDOFF.md` with the current status and exact next step

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

## Handoff

- If the code is wrong but the design is right, hand back to `stitch-implement-frontend`.
- If the implementation brief was wrong or incomplete, hand back to `stitch-interpret-design`.
- If the approved design itself is wrong, hand back to `stitch-generate-design-pass`.

## Guardrails

- Do not call a pass "done" when key trust cues or primary flow elements are still missing.
- Do not regenerate the whole app when a local code fix is enough.
- Keep review notes concrete and screen-specific.
- Do not blur "design is wrong" and "implementation is wrong". That distinction is the main job of this skill.

Load `references/review-rubric.md` when you need a compact comparison rubric.
