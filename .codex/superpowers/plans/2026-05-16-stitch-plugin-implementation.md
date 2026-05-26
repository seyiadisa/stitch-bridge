# Stitch Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the old script-heavy plugin direction with a self-contained skill-first Stitch plugin.

**Architecture:** Keep the plugin centered on specialized skills plus a bundled Stitch MCP config. Runtime code should stay minimal and focus only on auth/header wiring for the remote Stitch MCP server.

**Tech Stack:** Codex plugin manifest, bundled skills, `.mcp.json`, Node.js bridge script, `mcp-remote`, Stitch MCP.

---

## Implementation Order

1. replace the old orchestrator runtime with plugin skills and bundled MCP config
2. remove obsolete TypeScript orchestration and test files
3. add the minimal Stitch MCP bridge script
4. refresh docs and handoff notes to describe the new architecture
5. validate plugin manifest shape and bridge-script syntax
