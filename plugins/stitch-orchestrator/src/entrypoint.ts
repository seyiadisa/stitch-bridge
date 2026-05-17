import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

import { ensureFrameworkTarget, type FrameworkTarget, SUPPORTED_FRAMEWORKS } from "./config/frameworks.js";
import { ensureReviewMode } from "./config/reviewMode.js";
import { resolveTargetFolder } from "./config/targetFolder.js";
import type {
  NormalizedRunConfig,
  ReviewMode,
  RouteResult,
  RunInput,
  ValidationErrorResult,
} from "./types/run.js";

const ALLOWED_INPUT_KEYS = [
  "prompt",
  "targetFolder",
  "frameworkTarget",
  "reviewMode",
  "extraImplementationConstraints",
] as const;

export class InputValidationError extends Error {
  readonly issues: string[];

  constructor(issues: string[]) {
    super(issues.join(" "));
    this.name = "InputValidationError";
    this.issues = issues;
  }
}

export function normalizeRunInput(
  input: unknown,
  cwd: string = process.cwd(),
): NormalizedRunConfig {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    throw new InputValidationError([
      "Run input must be an object with the declared command surface.",
    ]);
  }

  const candidate = input as Record<string, unknown>;
  const unknownKeys = Object.keys(candidate).filter(
    (key) => !ALLOWED_INPUT_KEYS.includes(key as (typeof ALLOWED_INPUT_KEYS)[number]),
  );

  if (unknownKeys.length > 0) {
    throw new InputValidationError([
      `Unknown input field${unknownKeys.length === 1 ? "" : "s"}: ${unknownKeys.join(
        ", ",
      )}. Allowed fields are ${ALLOWED_INPUT_KEYS.join(", ")}.`,
    ]);
  }

  const prompt = normalizePrompt(candidate.prompt);
  const frameworkTarget = normalizeFrameworkTarget(candidate.frameworkTarget);
  const reviewMode = normalizeReviewMode(candidate.reviewMode);
  const targetFolder = normalizeTargetFolder(candidate.targetFolder, cwd);
  const extraImplementationConstraints = normalizeConstraints(
    candidate.extraImplementationConstraints,
  );

  return {
    prompt,
    targetFolder,
    frameworkTarget,
    reviewMode,
    extraImplementationConstraints,
  };
}

export function routeRun(
  input: unknown,
  cwd: string = process.cwd(),
): RouteResult | ValidationErrorResult {
  try {
    const config = normalizeRunInput(input, cwd);

    return {
      status: "not_implemented",
      phase: "intake",
      config,
      message:
        "The stitch-orchestrator scaffold validated the command surface. Orchestration internals land in later tasks.",
    };
  } catch (error: unknown) {
    if (error instanceof InputValidationError) {
      return {
        status: "validation_error",
        phase: "intake",
        errors: error.issues,
      };
    }

    throw error;
  }
}

function normalizePrompt(value: unknown): string {
  if (typeof value !== "string") {
    throw new InputValidationError([
      "The plugin requires `prompt` to be a string.",
    ]);
  }

  const prompt = value.trim();

  if (!prompt) {
    throw new InputValidationError([
      "The plugin requires a non-empty `prompt`.",
    ]);
  }

  return prompt;
}

function normalizeFrameworkTarget(value: unknown): FrameworkTarget | null {
  if (value === undefined) {
    return null;
  }

  if (typeof value !== "string") {
    throw new InputValidationError([
      `Unsupported framework target. Expected one of ${SUPPORTED_FRAMEWORKS.join(
        ", ",
      )}.`,
    ]);
  }

  try {
    return ensureFrameworkTarget(value);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new InputValidationError([message]);
  }
}

function normalizeReviewMode(value: unknown): ReviewMode {
  try {
    return ensureReviewMode(value);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    throw new InputValidationError([message]);
  }
}

function normalizeTargetFolder(value: unknown, cwd: string): string {
  if (value === undefined) {
    return resolveTargetFolder({ cwd }).targetFolder;
  }

  if (typeof value !== "string") {
    throw new InputValidationError([
      "`targetFolder` must be a string when provided.",
    ]);
  }

  return resolveTargetFolder({ cwd, targetFolder: value }).targetFolder;
}

function normalizeConstraints(value: unknown): string[] {
  if (value === undefined) {
    return [];
  }

  if (!Array.isArray(value)) {
    throw new InputValidationError([
      "`extraImplementationConstraints` must be an array of strings when provided.",
    ]);
  }

  if (!value.every((item) => typeof item === "string")) {
    throw new InputValidationError([
      "`extraImplementationConstraints` array items must all be strings.",
    ]);
  }

  return value.map((item) => item.trim()).filter(Boolean);
}

function parseCliArgs(argv: string[]): RunInput {
  const input: RunInput = {
    prompt: "",
  };

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    const next = argv[index + 1];

    switch (token) {
      case "--input": {
        if (!next) {
          throw new InputValidationError([
            "Missing JSON payload after `--input`.",
          ]);
        }

        if (argv.length !== 2) {
          throw new InputValidationError([
            "`--input` cannot be combined with other CLI flags. Pass either `--input <json>` or individual flags.",
          ]);
        }

        return parseJsonInput(next);
      }
      case "--prompt": {
        input.prompt = requireValue(token, next);
        index += 1;
        break;
      }
      case "--target-folder": {
        input.targetFolder = requireValue(token, next);
        index += 1;
        break;
      }
      case "--framework-target": {
        input.frameworkTarget = requireValue(token, next) as FrameworkTarget;
        index += 1;
        break;
      }
      case "--review-mode": {
        input.reviewMode = requireValue(token, next) as ReviewMode;
        index += 1;
        break;
      }
      case "--constraint": {
        const existing = input.extraImplementationConstraints;
        const value = requireValue(token, next);

        input.extraImplementationConstraints = Array.isArray(existing)
          ? [...existing, value]
          : existing
            ? [existing, value]
            : [value];

        index += 1;
        break;
      }
      default: {
        throw new InputValidationError([`Unknown argument: ${token}`]);
      }
    }
  }

  return input;
}

function parseJsonInput(serialized: string): RunInput {
  let parsed: unknown;

  try {
    parsed = JSON.parse(serialized);
  } catch (error) {
    throw new InputValidationError([
      `Invalid JSON passed to \`--input\`: ${String(error)}`,
    ]);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new InputValidationError([
      "The `--input` payload must be a JSON object.",
    ]);
  }

  return parsed as RunInput;
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value || value.startsWith("--")) {
    throw new InputValidationError([`Missing value after ${flag}.`]);
  }

  return value;
}

async function main(argv: string[]): Promise<void> {
  const result = routeRun(parseCliArgs(argv));
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

const isDirectExecution =
  process.argv[1] !== undefined &&
  fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);

if (isDirectExecution) {
  main(process.argv.slice(2)).catch((error: unknown) => {
    if (error instanceof InputValidationError) {
      const result: ValidationErrorResult = {
        status: "validation_error",
        phase: "intake",
        errors: error.issues,
      };

      process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
      process.exitCode = 1;
      return;
    }

    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
