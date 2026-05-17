import fs from "node:fs/promises";
import path from "node:path";

import type { PackageManagerPolicy } from "../types/run.js";

const BUN_MARKERS = ["bun.lock", "bun.lockb", "bunfig.toml"] as const;

export async function detectPackageManagerPolicy(
  targetFolder: string,
): Promise<PackageManagerPolicy> {
  if (await pathExists(path.join(targetFolder, "pnpm-lock.yaml"))) {
    return {
      name: "pnpm",
      source: "pnpm-lock",
    };
  }

  if (await hasBunConfiguration(targetFolder)) {
    return {
      name: "bun",
      source: "bun",
    };
  }

  return {
    name: "bun",
    source: "default",
  };
}

async function hasBunConfiguration(targetFolder: string): Promise<boolean> {
  for (const marker of BUN_MARKERS) {
    if (await pathExists(path.join(targetFolder, marker))) {
      return true;
    }
  }

  const packageJsonPath = path.join(targetFolder, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return false;
  }

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
      packageManager?: unknown;
    };

    return (
      typeof packageJson.packageManager === "string" &&
      packageJson.packageManager.startsWith("bun@")
    );
  } catch {
    return false;
  }
}

async function pathExists(candidatePath: string): Promise<boolean> {
  try {
    await fs.access(candidatePath);
    return true;
  } catch {
    return false;
  }
}
