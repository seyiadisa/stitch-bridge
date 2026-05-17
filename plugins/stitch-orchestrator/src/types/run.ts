export const REVIEW_MODES = ["default", "staged"] as const;
export const DEFAULT_REVIEW_MODE = "default" satisfies ReviewMode;

export type ReviewMode = (typeof REVIEW_MODES)[number];

export const PACKAGE_MANAGERS = ["bun", "pnpm"] as const;
export type PackageManagerName = (typeof PACKAGE_MANAGERS)[number];
export type UnsupportedPackageManagerName = "npm" | "yarn" | "unknown";

export interface PackageManagerPolicy {
  name: PackageManagerName | null;
  source: "bun" | "pnpm-lock" | "unsupported" | "none";
  detectedManager: UnsupportedPackageManagerName | null;
  signal: string | null;
}

export interface ResolvedTargetFolder {
  cwd: string;
  targetFolder: string;
}

export interface RunInput {
  prompt: string;
  targetFolder?: string;
  frameworkTarget?: string;
  reviewMode?: string;
  extraImplementationConstraints?: string[];
}

export interface NormalizedRunConfig {
  prompt: string;
  targetFolder: string;
  frameworkTarget: import("../config/frameworks.js").FrameworkTarget | null;
  reviewMode: ReviewMode;
  extraImplementationConstraints: string[];
}

export interface RouteResult {
  status: "not_implemented";
  phase: "intake";
  config: NormalizedRunConfig;
  message: string;
}

export interface ValidationErrorResult {
  status: "validation_error";
  phase: "intake";
  errors: string[];
}
