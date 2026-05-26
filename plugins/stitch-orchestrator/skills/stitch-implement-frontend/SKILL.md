---
name: stitch-implement-frontend
description: Implement an approved Stitch design in a real frontend app with high fidelity. Use when Codex needs to build or update Next.js, Nuxt, React + Vite, or Vue + Vite code from an interpreted Stitch pass while preserving layout, hierarchy, tokens, and interaction cues.
---

# Stitch Implement Frontend

Use this skill only after the Stitch pass has been interpreted into an implementation-ready brief.

## Workflow

1. Confirm the target framework:
   - Next.js
   - Nuxt
   - React + Vite
   - Vue + Vite
2. Inspect the target app before scaffolding or editing. Preserve existing conventions when the app already exists.
3. Implement the app in this order:
   - app shell and route structure
   - shared layout primitives
   - design tokens and theme variables
   - reusable components
   - screen implementations
   - edge states
4. Build one screen at a time and compare it back to the approved Stitch artifacts as you go.
5. Run the smallest meaningful verification for the chosen framework before claiming completion.

## Guardrails

- Do not invent a scripted frontend generator when Codex can implement directly.
- Do not flatten every screen into one file if reuse is obvious.
- Do not "improve" the design away from Stitch unless the user explicitly asks for reinterpretation.

Load `references/framework-targets.md` for framework-specific implementation cues.
