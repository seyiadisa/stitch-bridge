---
name: stitch-interpret-design
description: Use when Codex has an approved Stitch pass and needs to translate `.stitch/` artifacts into an implementation-ready frontend brief with routes, shared layout, component boundaries, required states, and fidelity rules before writing application code.
---

# Stitch Interpret Design

Read the approved Stitch pass before touching application code.

This skill exists to reduce ambiguity between design artifacts and implementation. It should leave behind a concrete build brief, not code.

## Inputs

- an approved Stitch pass
- `.stitch/DESIGN.md`
- `.stitch/UI_FLOW.md`
- approved `.stitch/designs/*.screen.json`
- any existing app structure that will receive the implementation

## Required Output

Produce a concise implementation brief that names:

- route inventory
- screen-to-route mapping
- shared layout primitives
- reusable component candidates
- required states and empty/error flows
- fidelity risks and non-negotiables

The brief can live in the working conversation, `.codex/HANDOFF.md`, or another workspace note if the session needs resumability.

## Workflow

1. Read `.stitch/DESIGN.md` for the design system contract.
2. Read `.stitch/UI_FLOW.md` for the product and screen flow contract.
3. Read the approved `.stitch/designs/*.screen.json` files and any review-ready notes in `design-output/`.
4. Produce an implementation brief that identifies:
   - route inventory
   - screen-to-route mapping
   - shared layout primitives
   - reusable component candidates
   - required states
   - fidelity risks
5. Decide what should remain page-specific and what should be extracted into shared components before coding starts.

## Handoff

When the implementation brief is clear, hand off to `stitch-implement-frontend`.

## Guardrails

- Do not skip straight to coding from raw Stitch artifacts.
- Do not assume every visual difference deserves a reusable component.
- Preserve the product language and trust cues defined in the design pass.
- Do not regenerate Stitch here. If the design itself is wrong, hand back to `stitch-generate-design-pass`.
- Do not spend this skill on framework syntax details. That belongs to `stitch-implement-frontend`.

Load `references/reading-order.md` when you need the exact artifact reading sequence.
