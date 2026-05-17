export const REVIEW_MODES = ["default", "staged"] as const;
export const DEFAULT_REVIEW_MODE = "default" satisfies ReviewMode;

export type ReviewMode = (typeof REVIEW_MODES)[number];

export const PACKAGE_MANAGERS = ["bun", "pnpm"] as const;
export type PackageManagerName = (typeof PACKAGE_MANAGERS)[number];

export interface PackageManagerPolicy {
  name: PackageManagerName;
  source: "default" | "bun" | "pnpm-lock";
}

export interface ResolvedTargetFolder {
  cwd: string;
  targetFolder: string;
}
