export const SUPPORTED_FRAMEWORKS = ["next", "react-vite", "vue-vite"] as const;

export type FrameworkTarget = (typeof SUPPORTED_FRAMEWORKS)[number];

export function ensureFrameworkTarget(value: string): FrameworkTarget {
  if (SUPPORTED_FRAMEWORKS.includes(value as FrameworkTarget)) {
    return value as FrameworkTarget;
  }

  throw new Error(
    `Unsupported framework target. Expected one of ${SUPPORTED_FRAMEWORKS.join(", ")}.`,
  );
}
