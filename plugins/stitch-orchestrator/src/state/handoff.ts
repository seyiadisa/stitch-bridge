import fs from "node:fs/promises";

import { ensureWorkspacePaths } from "./paths.js";

export interface HandoffSnapshot {
  lastCompletedTask: {
    task: string;
    branch: string;
    commit: string;
    filesChanged: string[];
    keyDecisions: string[];
  };
  currentState: {
    branch: string;
    workingTree: string;
    runningServices: string[];
    knownIssues: string[];
  };
  nextTask: {
    exactNextStep: string;
    filesToReadFirst: string[];
    constraintsAndGotchas: string[];
  };
  openIssues: string[];
}

export async function updateHandoff(
  targetFolder: string,
  snapshot: HandoffSnapshot,
): Promise<string> {
  const { handoffFile } = await ensureWorkspacePaths(targetFolder);
  const document = renderHandoff(snapshot);

  await fs.writeFile(handoffFile, document, "utf8");

  return document;
}

function renderHandoff(snapshot: HandoffSnapshot): string {
  const sections = [
    "# Session Handoff",
    "",
    "## Last Completed Task",
    `- task: ${snapshot.lastCompletedTask.task}`,
    `- branch: \`${snapshot.lastCompletedTask.branch}\``,
    `- commit: \`${snapshot.lastCompletedTask.commit}\``,
    `- files changed: ${formatInlineList(snapshot.lastCompletedTask.filesChanged)}`,
    `- key decisions: ${formatInlineList(snapshot.lastCompletedTask.keyDecisions)}`,
    "",
    "## Current State",
    `- branch: \`${snapshot.currentState.branch}\``,
    `- working tree: ${snapshot.currentState.workingTree}`,
    `- running services: ${formatInlineList(snapshot.currentState.runningServices)}`,
    `- known issues: ${formatInlineList(snapshot.currentState.knownIssues)}`,
    "",
    "## Next Task",
    `- exact next step: ${snapshot.nextTask.exactNextStep}`,
    `- files to read first: ${formatInlineList(snapshot.nextTask.filesToReadFirst)}`,
    `- constraints/gotchas: ${formatInlineList(snapshot.nextTask.constraintsAndGotchas)}`,
    "",
    "## Open Issues",
    ...snapshot.openIssues.map((issue) => `- ${issue}`),
    "",
  ];

  return sections.join("\n");
}

function formatInlineList(values: string[]): string {
  if (values.length === 0) {
    return "none";
  }

  return values.map((value) => `\`${value}\``).join(", ");
}
