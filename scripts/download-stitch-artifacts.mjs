import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

import { stitch } from "@google/stitch-sdk";

const DEFAULT_METADATA_PATH = ".stitch/metadata.json";
const DEFAULT_OUTPUT_DIR = ".stitch/designs";

export async function main(options = {}) {
  const env = options.env ?? process.env;
  const cwd = options.cwd ?? process.cwd();
  const metadataPath = path.resolve(cwd, options.metadataPath ?? getRequiredMetadataPath(env));
  const outputDir = path.resolve(cwd, options.outputDir ?? env.STITCH_ARTIFACT_OUTPUT_DIR ?? DEFAULT_OUTPUT_DIR);

  getRequiredApiKey(env);

  const metadata = await readMetadata(metadataPath);
  const projectId = getRequiredProjectId(metadata);
  const requestedScreenIds = collectScreenIds(metadata);
  const project = stitch.project(projectId);
  const screens = requestedScreenIds.length > 0
    ? await Promise.all(requestedScreenIds.map((screenId) => project.getScreen(screenId)))
    : await project.screens();

  if (screens.length === 0) {
    fail(
      `No Stitch screens were found for project \`${projectId}\`.\n` +
        "Persist screen IDs to `.stitch/metadata.json` or generate at least one screen before downloading artifacts."
    );
  }

  await fs.mkdir(outputDir, { recursive: true });

  const downloaded = [];

  for (const screen of screens) {
    const screenId = normalizeResourceId(screen.id ?? screen.screenId, "screens");

    if (!screenId) {
      fail("Encountered a Stitch screen without a usable screen ID while downloading artifacts.");
    }

    const htmlUrl = await screen.getHtml();
    const imageUrl = await screen.getImage();

    if (!htmlUrl || !imageUrl) {
      fail(
        `Screen \`${screenId}\` did not return both artifact URLs.\n` +
          "The Stitch SDK must provide both HTML and image artifacts for every approved screen."
      );
    }

    const html = await fetchRequiredText(htmlUrl, screenId, "HTML");
    const image = await fetchRequiredBuffer(imageUrl, screenId, "image");

    await fs.writeFile(path.join(outputDir, `${screenId}.html`), html);
    await fs.writeFile(path.join(outputDir, `${screenId}.jpeg`), image);

    downloaded.push(screenId);
  }

  process.stdout.write(
    `Downloaded ${downloaded.length} Stitch screen artifact set(s) to ${outputDir}\n`
  );
}

export function getRequiredApiKey(env) {
  const apiKey = env.STITCH_API_KEY?.trim();

  if (!apiKey) {
    fail(
      "Missing required Stitch SDK credential `STITCH_API_KEY`.\n" +
        "This plugin now requires both the Stitch MCP connection and the Stitch SDK API key."
    );
  }

  return apiKey;
}

export function getRequiredMetadataPath(env) {
  const metadataPath = env.STITCH_METADATA_PATH?.trim() || DEFAULT_METADATA_PATH;

  if (!metadataPath) {
    fail("Could not resolve the Stitch metadata path.");
  }

  return metadataPath;
}

export function getRequiredProjectId(metadata) {
  const candidate =
    metadata.projectId ??
    metadata.project?.id ??
    metadata.project?.projectId ??
    metadata.project?.name;

  const projectId = normalizeResourceId(candidate, "projects");

  if (!projectId) {
    fail(
      "Could not determine the Stitch project id from `.stitch/metadata.json`.\n" +
        "Persist `projectId`, `project.id`, or `project.name` before downloading artifacts."
    );
  }

  return projectId;
}

export function collectScreenIds(metadata) {
  const candidates = [];

  if (Array.isArray(metadata.screens)) {
    for (const entry of metadata.screens) {
      if (typeof entry === "string") {
        candidates.push(entry);
        continue;
      }

      if (entry && typeof entry === "object") {
        candidates.push(entry.screenId, entry.id, entry.name);
      }
    }
  }

  return [...new Set(
    candidates
      .map((value) => normalizeResourceId(value, "screens"))
      .filter(Boolean)
  )];
}

export function normalizeResourceId(value, resourceType = "projects") {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();

  if (!trimmed) {
    return "";
  }

  if (resourceType === "screens") {
    const screenMatch = trimmed.match(/screens\/([^/]+)$/);

    return screenMatch ? screenMatch[1] : trimmed;
  }

  const projectMatch = trimmed.match(/projects\/([^/]+)$/);

  return projectMatch ? projectMatch[1] : trimmed;
}

async function readMetadata(metadataPath) {
  let rawMetadata;

  try {
    rawMetadata = await fs.readFile(metadataPath, "utf8");
  } catch (error) {
    fail(
      `Could not read Stitch metadata at \`${metadataPath}\`.\n` +
        "Run the design-pass generation skill first so `.stitch/metadata.json` exists."
    );
  }

  try {
    return JSON.parse(rawMetadata);
  } catch (error) {
    fail(
      `The Stitch metadata file at \`${metadataPath}\` is not valid JSON.\n` +
        "Fix the metadata file before downloading artifacts."
    );
  }
}

async function fetchRequiredText(url, screenId, artifactLabel) {
  const response = await fetch(url);

  if (!response.ok) {
    fail(
      `Failed to download ${artifactLabel} artifact for screen \`${screenId}\`.\n` +
        `HTTP ${response.status} from ${url}`
    );
  }

  return response.text();
}

async function fetchRequiredBuffer(url, screenId, artifactLabel) {
  const response = await fetch(url);

  if (!response.ok) {
    fail(
      `Failed to download ${artifactLabel} artifact for screen \`${screenId}\`.\n` +
        `HTTP ${response.status} from ${url}`
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export function fail(message) {
  throw new Error(message);
}

if (import.meta.url === new URL(process.argv[1], "file:").href) {
  main().catch((error) => {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  });
}
