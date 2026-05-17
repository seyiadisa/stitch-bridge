import path from "node:path";

import type { ResolvedTargetFolder } from "../types/run.js";

export interface ResolveTargetFolderOptions {
  cwd: string;
  targetFolder?: string;
}

export function resolveTargetFolder({
  cwd,
  targetFolder,
}: ResolveTargetFolderOptions): ResolvedTargetFolder["targetFolder"] {
  return targetFolder ? path.resolve(cwd, targetFolder) : path.resolve(cwd);
}
