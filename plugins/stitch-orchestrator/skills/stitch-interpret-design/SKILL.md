---
name: stitch-interpret-design
description: Interpret an approved Stitch design pass into an implementation-ready frontend brief. Use when Codex needs to read `.stitch/` artifacts, derive routes, shared layout, component boundaries, states, and fidelity rules before writing application code.
---

# Stitch Interpret Design

Read the approved Stitch pass before touching application code.

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

## Guardrails

- Do not skip straight to coding from raw Stitch artifacts.
- Do not assume every visual difference deserves a reusable component.
- Preserve the product language and trust cues defined in the design pass.

Load `references/reading-order.md` when you need the exact artifact reading sequence.
