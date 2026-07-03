---
name: stitch-implement-frontend
description: Use when Codex already has an implementation-ready brief from an approved Stitch pass and needs to build or update Next.js, Nuxt, React + Vite, or Vue + Vite code while preserving layout, hierarchy, tokens, component boundaries, and interaction cues.
---

# Stitch Implement Frontend

Use this skill only after the Stitch pass has been interpreted into an implementation-ready brief.

This skill is for application code only. It should not regenerate design artifacts or re-decide the product structure from scratch.

## Inputs

- a framework target: Next.js, Nuxt, React + Vite, or Vue + Vite
- the implementation brief from `stitch-interpret-design`
- approved Stitch artifacts for comparison
- downloaded Stitch HTML artifacts for structural reference
- the target app folder

## Required Output

Leave the target app with:

- route structure that matches the approved screen flow
- shared layout primitives and tokens applied consistently
- reusable components extracted where the interpretation brief called for them
- implemented screens and required states
- verification results for the chosen framework

If the design intent is still unclear, stop and return to `stitch-interpret-design` instead of guessing.

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
4. Prefer modular components over giant page files. Extract shared UI primitives,
   move non-trivial state or handlers into framework-appropriate hooks or composables,
   and keep static mock data separate when that makes iteration or testing easier.
5. Reuse local `.stitch/designs/*` artifacts when they already exist unless the user
   asks to refresh them from Stitch.
6. Use the downloaded `.stitch/designs/*.html` files as the primary screen-structure reference:
   - preserve hierarchy, section boundaries, repeated patterns, and token usage cues
   - adapt that structure into framework-appropriate components instead of copying static HTML verbatim
7. Use screenshots to verify visual fidelity and catch drift that the HTML alone does not explain.
8. Build one screen at a time and compare it back to the approved Stitch artifacts as you go.
9. Run the smallest meaningful verification for the chosen framework before claiming completion.

## Handoff

After the implementation is usable, hand off to `stitch-review-sync`.

## Guardrails

- Do not invent a scripted frontend generator when Codex can implement directly.
- Do not flatten every screen into one file if reuse is obvious.
- Do not hardcode arbitrary colors or spacing when the interpreted design tokens
  can be expressed as shared theme variables.
- Do not treat screenshots as the main implementation source when matching Stitch HTML is available.
- Do not "improve" the design away from Stitch unless the user explicitly asks for reinterpretation.
- Do not re-scope routes, states, or shared components casually during coding. If the brief is wrong, return to `stitch-interpret-design`.
- Do not claim fidelity based only on code structure. Use `stitch-review-sync` to compare back to Stitch.

Load `references/framework-targets.md` for framework-specific implementation cues.
