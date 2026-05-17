import fs from "node:fs/promises";

import type { FrameworkTarget } from "../config/frameworks.js";
import type { ReviewMode } from "../types/run.js";
import { ensureWorkspacePaths } from "./paths.js";

export const APPROVAL_STATES = ["pending", "approved", "revisions_requested"] as const;
export type ApprovalState = (typeof APPROVAL_STATES)[number];

export const RUN_STATUSES = ["in_progress", "awaiting_review", "completed"] as const;
export type RunStatus = (typeof RUN_STATUSES)[number];

export const PASS_KINDS = ["design", "variant", "implementation"] as const;
export type RunPassKind = (typeof PASS_KINDS)[number];

export const PASS_STATUSES = [
  "generated",
  "needs_revision",
  "approved",
  "implemented",
] as const;
export type RunPassStatus = (typeof PASS_STATUSES)[number];

export interface RunPassRecord {
  id: string;
  label: string;
  kind: RunPassKind;
  status: RunPassStatus;
  createdAt: string;
}

export interface WorkspaceRunState {
  version: 1;
  runId: string;
  prompt: string;
  targetFolder: string;
  frameworkTarget: FrameworkTarget | null;
  reviewMode: ReviewMode;
  approvalState: ApprovalState;
  status: RunStatus;
  currentPhase: string;
  currentPassId: string | null;
  passHistory: RunPassRecord[];
  updatedAt: string;
}

export async function loadRunState(targetFolder: string): Promise<WorkspaceRunState | null> {
  const { runStateFile } = await ensureWorkspacePaths(targetFolder);

  try {
    const serialized = await fs.readFile(runStateFile, "utf8");
    return JSON.parse(serialized) as WorkspaceRunState;
  } catch (error: unknown) {
    if (isMissingFileError(error)) {
      return null;
    }

    throw error;
  }
}

export async function saveRunState(
  targetFolder: string,
  state: WorkspaceRunState,
): Promise<WorkspaceRunState> {
  const { runStateFile } = await ensureWorkspacePaths(targetFolder);
  await fs.writeFile(runStateFile, `${JSON.stringify(state, null, 2)}\n`, "utf8");
  return state;
}

export async function appendPassRecord(
  targetFolder: string,
  passRecord: RunPassRecord,
): Promise<WorkspaceRunState> {
  const existingState = await loadRunState(targetFolder);

  if (!existingState) {
    throw new Error("Cannot append a pass record before workspace run state exists.");
  }

  const nextState: WorkspaceRunState = {
    ...existingState,
    currentPassId: passRecord.id,
    passHistory: [...existingState.passHistory, passRecord],
    updatedAt: passRecord.createdAt,
  };

  return saveRunState(targetFolder, nextState);
}

function isMissingFileError(error: unknown): error is NodeJS.ErrnoException {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "ENOENT"
  );
}
