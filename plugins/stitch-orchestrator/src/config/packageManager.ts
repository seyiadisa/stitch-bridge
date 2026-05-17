import fs from "node:fs/promises";
import path from "node:path";

import type { PackageManagerPolicy, UnsupportedPackageManagerName } from "../types/run.js";

const BUN_MARKERS = ["bun.lock", "bun.lockb", "bunfig.toml"] as const;
const UNSUPPORTED_MANAGER_SIGNALS = [
  { fileName: "package-lock.json", manager: "npm" },
  { fileName: "npm-shrinkwrap.json", manager: "npm" },
  { fileName: "yarn.lock", manager: "yarn" },
] as const;

export async function detectPackageManagerPolicy(
  targetFolder: string,
): Promise<PackageManagerPolicy> {
  if (await pathExists(path.join(targetFolder, "pnpm-lock.yaml"))) {
    return {
      name: "pnpm",
      source: "pnpm-lock",
      detectedManager: null,
      signal: "pnpm-lock.yaml",
    };
  }

  const declaredPackageManager = await detectDeclaredPackageManager(targetFolder);

  if (declaredPackageManager === "pnpm") {
    return {
      name: "pnpm",
      source: "pnpm",
      detectedManager: null,
      signal: "packageManager:pnpm",
    };
  }

  if (await hasBunConfiguration(targetFolder)) {
    return {
      name: "bun",
      source: "bun",
      detectedManager: null,
      signal: await detectBunSignal(targetFolder),
    };
  }

  const unsupportedManagerPolicy = await detectUnsupportedManagerPolicy(targetFolder);

  if (unsupportedManagerPolicy) {
    return unsupportedManagerPolicy;
  }

  return {
    name: null,
    source: "none",
    detectedManager: null,
    signal: null,
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

async function detectBunSignal(targetFolder: string): Promise<string> {
  for (const marker of BUN_MARKERS) {
    if (await pathExists(path.join(targetFolder, marker))) {
      return marker;
    }
  }

  return "packageManager:bun";
}

async function detectUnsupportedManagerPolicy(
  targetFolder: string,
): Promise<PackageManagerPolicy | null> {
  for (const signal of UNSUPPORTED_MANAGER_SIGNALS) {
    if (await pathExists(path.join(targetFolder, signal.fileName))) {
      return {
        name: null,
        source: "unsupported",
        detectedManager: signal.manager,
        signal: signal.fileName,
      };
    }
  }

  const packageJsonPath = path.join(targetFolder, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return null;
  }

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
      packageManager?: unknown;
    };

    if (typeof packageJson.packageManager !== "string") {
      return null;
    }

    const detectedManager = normalizeDeclaredManager(packageJson.packageManager);

    if (detectedManager === null || detectedManager === "bun" || detectedManager === "pnpm") {
      return null;
    }

    return {
      name: null,
      source: "unsupported",
      detectedManager,
      signal: `packageManager:${detectedManager}`,
    };
  } catch {
    return null;
  }
}

function normalizeDeclaredManager(
  packageManager: string,
): UnsupportedPackageManagerName | "bun" | "pnpm" | null {
  const normalized = packageManager.split("@")[0]?.trim();

  if (normalized === "bun") {
    return "bun";
  }

  if (normalized === "pnpm") {
    return "pnpm";
  }

  if (normalized === "npm" || normalized === "yarn") {
    return normalized;
  }

  return normalized ? "unknown" : null;
}

async function detectDeclaredPackageManager(
  targetFolder: string,
): Promise<"pnpm" | "bun" | UnsupportedPackageManagerName | null> {
  const packageJsonPath = path.join(targetFolder, "package.json");

  if (!(await pathExists(packageJsonPath))) {
    return null;
  }

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as {
      packageManager?: unknown;
    };

    if (typeof packageJson.packageManager !== "string") {
      return null;
    }

    return normalizeDeclaredManager(packageJson.packageManager);
  } catch {
    return null;
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
