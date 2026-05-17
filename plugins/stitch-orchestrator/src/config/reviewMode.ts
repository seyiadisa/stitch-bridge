import { DEFAULT_REVIEW_MODE, REVIEW_MODES, type ReviewMode } from "../types/run.js";

export function ensureReviewMode(value: unknown): ReviewMode {
  if (value === undefined) {
    return DEFAULT_REVIEW_MODE;
  }

  if (typeof value === "string" && REVIEW_MODES.includes(value as ReviewMode)) {
    return value as ReviewMode;
  }

  throw new Error(
    `Unsupported review mode. Expected one of ${REVIEW_MODES.join(", ")}.`,
  );
}
