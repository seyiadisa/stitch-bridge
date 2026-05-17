import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { ensureWorkspacePaths, getWorkspacePaths } from "../src/state/paths.js";
import { updateHandoff } from "../src/state/handoff.js";
import {
  appendPassRecord,
  loadRunState,
  saveRunState,
  type RunPassRecord,
  type WorkspaceRunState,
} from "../src/state/runState.js";

function createTargetFolder(prefix: string): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), prefix));
}

function createPassRecord(overrides: Partial<RunPassRecord> = {}): RunPassRecord {
  return {
    id: "pass-1",
    label: "Initial design pass",
    kind: "design",
    status: "generated",
    createdAt: "2026-05-17T00:00:00.000Z",
    ...overrides,
  };
}

function createRunState(overrides: Partial<WorkspaceRunState> = {}): WorkspaceRunState {
  return {
    version: 1,
    runId: "run-123",
    prompt: "Design a trust-first onboarding flow",
    targetFolder: overrides.targetFolder ?? "TARGET_FOLDER",
    frameworkTarget: "next",
    reviewMode: "staged",
    approvalState: "approved",
    status: "completed",
    currentPhase: "handoff",
    currentPassId: null,
    passHistory: [createPassRecord()],
    updatedAt: "2026-05-17T00:10:00.000Z",
    ...overrides,
  };
}

test("ensureWorkspacePaths creates managed .stitch and .codex paths under the target folder", async () => {
  const targetFolder = createTargetFolder("stitch-state-paths-");

  const paths = getWorkspacePaths(targetFolder);
  await ensureWorkspacePaths(targetFolder);

  assert.equal(paths.targetFolder, targetFolder);
  assert.equal(paths.stitchDir, path.join(targetFolder, ".stitch"));
  assert.equal(paths.codexDir, path.join(targetFolder, ".codex"));
  assert.equal(paths.handoffFile, path.join(targetFolder, ".codex", "HANDOFF.md"));
  assert.equal(
    paths.runStateFile,
    path.join(targetFolder, ".codex", "stitch-orchestrator-run-state.json"),
  );

  assert.equal(fs.existsSync(paths.stitchDir), true);
  assert.equal(fs.existsSync(paths.codexDir), true);
});

test("saveRunState serializes framework, review mode, approval state, and pass history", async () => {
  const targetFolder = createTargetFolder("stitch-state-save-");
  const paths = await ensureWorkspacePaths(targetFolder);
  const state = createRunState({ targetFolder });

  await saveRunState(targetFolder, state);

  const restored = await loadRunState(targetFolder);
  const serialized = JSON.parse(fs.readFileSync(paths.runStateFile, "utf8"));

  assert.deepEqual(restored, state);
  assert.equal(serialized.frameworkTarget, "next");
  assert.equal(serialized.reviewMode, "staged");
  assert.equal(serialized.approvalState, "approved");
  assert.deepEqual(serialized.passHistory, state.passHistory);
});

test("appendPassRecord preserves prior pass history instead of replacing it", async () => {
  const targetFolder = createTargetFolder("stitch-state-passes-");
  const initialState = createRunState({ targetFolder });

  await saveRunState(targetFolder, initialState);
  await appendPassRecord(
    targetFolder,
    createPassRecord({
      id: "pass-2",
      label: "Variant pass",
      kind: "variant",
      status: "approved",
      createdAt: "2026-05-17T00:20:00.000Z",
    }),
  );

  const restored = await loadRunState(targetFolder);

  assert.ok(restored);
  assert.equal(restored?.passHistory.length, 2);
  assert.deepEqual(
    restored?.passHistory.map((pass) => pass.id),
    ["pass-1", "pass-2"],
  );
});

test("loadRunState restores an interrupted run without recomputing state", async () => {
  const targetFolder = createTargetFolder("stitch-state-resume-");
  const interruptedState = createRunState({
    targetFolder,
    approvalState: "pending",
    status: "awaiting_review",
    currentPhase: "review",
    currentPassId: "pass-2",
    passHistory: [
      createPassRecord(),
      createPassRecord({
        id: "pass-2",
        label: "Review pass",
        kind: "variant",
        status: "needs_revision",
        createdAt: "2026-05-17T00:30:00.000Z",
      }),
    ],
    updatedAt: "2026-05-17T00:31:00.000Z",
  });

  await saveRunState(targetFolder, interruptedState);

  const restored = await loadRunState(targetFolder);

  assert.deepEqual(restored, interruptedState);
});

test("updateHandoff writes the latest resumable workflow snapshot to .codex/HANDOFF.md", async () => {
  const targetFolder = createTargetFolder("stitch-state-handoff-");
  const paths = await ensureWorkspacePaths(targetFolder);

  await updateHandoff(targetFolder, {
    lastCompletedTask: {
      task: "Workspace state management",
      branch: "feat/workspace-state",
      commit: "feat: add durable workspace state management",
      filesChanged: [
        "plugins/stitch-orchestrator/src/state/paths.ts",
        "plugins/stitch-orchestrator/src/state/runState.ts",
      ],
      keyDecisions: [
        "Keep run metadata under .codex",
        "Preserve pass history across retries",
      ],
    },
    currentState: {
      branch: "feat/workspace-state",
      workingTree: "dirty: pending review",
      runningServices: ["none"],
      knownIssues: ["review approval still pending"],
    },
    nextTask: {
      exactNextStep: "Resume the interrupted review flow from pass-2.",
      filesToReadFirst: [
        ".codex/HANDOFF.md",
        ".codex/stitch-orchestrator-run-state.json",
      ],
      constraintsAndGotchas: [
        "Do not overwrite approved passes",
      ],
    },
    openIssues: ["Need explicit approval before frontend generation."],
  });

  const handoff = fs.readFileSync(paths.handoffFile, "utf8");

  assert.match(handoff, /# Session Handoff/);
  assert.match(handoff, /Workspace state management/);
  assert.match(handoff, /Resume the interrupted review flow from pass-2\./);
  assert.match(handoff, /Do not overwrite approved passes/);
});
