import fs from "node:fs/promises";
import path from "node:path";

export interface WorkspacePaths {
  targetFolder: string;
  stitchDir: string;
  promptsDir: string;
  designsDir: string;
  codexDir: string;
  handoffFile: string;
  runStateFile: string;
  designOutputDir: string;
}

export function getWorkspacePaths(targetFolder: string): WorkspacePaths {
  const resolvedTargetFolder = path.resolve(targetFolder);
  const stitchDir = path.join(resolvedTargetFolder, ".stitch");
  const codexDir = path.join(resolvedTargetFolder, ".codex");

  return {
    targetFolder: resolvedTargetFolder,
    stitchDir,
    promptsDir: path.join(stitchDir, "prompts"),
    designsDir: path.join(stitchDir, "designs"),
    codexDir,
    handoffFile: path.join(codexDir, "HANDOFF.md"),
    runStateFile: path.join(codexDir, "stitch-orchestrator-run-state.json"),
    designOutputDir: path.join(resolvedTargetFolder, "design-output"),
  };
}

export async function ensureWorkspacePaths(targetFolder: string): Promise<WorkspacePaths> {
  const paths = getWorkspacePaths(targetFolder);

  await fs.mkdir(paths.stitchDir, { recursive: true });
  await fs.mkdir(paths.codexDir, { recursive: true });

  return paths;
}
