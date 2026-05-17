import { fileURLToPath } from "node:url";
import path from "node:path";
import process from "node:process";

const SUPPORTED_FRAMEWORKS = ["next", "react-vite", "vue-vite"] as const;
const SUPPORTED_REVIEW_MODES = ["default", "staged"] as const;

export type FrameworkTarget = (typeof SUPPORTED_FRAMEWORKS)[number];
export type ReviewMode = (typeof SUPPORTED_REVIEW_MODES)[number];

export interface RunInput {
  prompt: string;
  targetFolder?: string;
  frameworkTarget?: FrameworkTarget;
  reviewMode?: ReviewMode;
  extraImplementationConstraints?: string | string[];
}

export interface NormalizedRunConfig {
  prompt: string;
  targetFolder: string;
  frameworkTarget: FrameworkTarget | null;
  reviewMode: ReviewMode;
  extraImplementationConstraints: string[];
}

export interface RouteResult {
  status: "not_implemented";
  phase: "intake";
  config: NormalizedRunConfig;
  message: string;
}

export function normalizeRunInput(
  input: RunInput,
  cwd: string = process.cwd(),
): NormalizedRunConfig {
  const prompt = input.prompt?.trim();

  if (!prompt) {
    throw new Error("The plugin requires a non-empty prompt.");
  }

  if (
    input.frameworkTarget !== undefined &&
    !SUPPORTED_FRAMEWORKS.includes(input.frameworkTarget)
  ) {
    throw new Error(
      `Unsupported framework target: ${input.frameworkTarget}. Expected one of ${SUPPORTED_FRAMEWORKS.join(
        ", ",
      )}.`,
    );
  }

  const reviewMode = input.reviewMode ?? "default";

  if (!SUPPORTED_REVIEW_MODES.includes(reviewMode)) {
    throw new Error(
      `Unsupported review mode: ${reviewMode}. Expected one of ${SUPPORTED_REVIEW_MODES.join(
        ", ",
      )}.`,
    );
  }

  const targetFolder = path.resolve(cwd, input.targetFolder ?? ".");
  const extraImplementationConstraints = normalizeConstraints(
    input.extraImplementationConstraints,
  );

  return {
    prompt,
    targetFolder,
    frameworkTarget: input.frameworkTarget ?? null,
    reviewMode,
    extraImplementationConstraints,
  };
}

export function routeRun(
  input: RunInput,
  cwd: string = process.cwd(),
): RouteResult {
  const config = normalizeRunInput(input, cwd);

  return {
    status: "not_implemented",
    phase: "intake",
    config,
    message:
      "The stitch-orchestrator scaffold validated the command surface. Orchestration internals land in later tasks.",
  };
}

function normalizeConstraints(
  value: RunInput["extraImplementationConstraints"],
): string[] {
  if (value === undefined) {
    return [];
  }

  const items = Array.isArray(value) ? value : [value];

  return items.map((item) => item.trim()).filter(Boolean);
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
          throw new Error("Missing JSON payload after --input.");
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
        throw new Error(`Unknown argument: ${token}`);
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
    throw new Error(`Invalid JSON passed to --input: ${String(error)}`);
  }

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("The --input payload must be a JSON object.");
  }

  return parsed as RunInput;
}

function requireValue(flag: string, value: string | undefined): string {
  if (!value) {
    throw new Error(`Missing value after ${flag}.`);
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
    const message = error instanceof Error ? error.message : String(error);
    process.stderr.write(`${message}\n`);
    process.exitCode = 1;
  });
}
