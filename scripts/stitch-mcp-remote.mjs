import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

const remoteUrl = process.env.STITCH_MCP_URL ?? "https://stitch.googleapis.com/mcp";
const accessToken = getAccessToken();
const billingProject = getBillingProject();
const proxyEntry = resolveMcpRemoteEntry();

const proxyArgs = [
  proxyEntry,
  remoteUrl,
  "--header",
  `Authorization: Bearer ${accessToken}`,
  "--header",
  `X-Goog-User-Project: ${billingProject}`
];

const child = spawn(process.execPath, proxyArgs, {
  stdio: "inherit",
  env: process.env
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

function getAccessToken() {
  const explicitToken = process.env.STITCH_ACCESS_TOKEN?.trim();

  if (explicitToken) {
    return explicitToken;
  }

  const result = spawnSync("gcloud", ["auth", "application-default", "print-access-token"], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    fail(
      "Could not obtain a Stitch access token from `gcloud auth application-default print-access-token`.\n" +
        "Run `gcloud auth application-default login` or set STITCH_ACCESS_TOKEN explicitly."
    );
  }

  const token = result.stdout.trim();

  if (!token) {
    fail("`gcloud auth application-default print-access-token` returned an empty token.");
  }

  return token;
}

function getBillingProject() {
  const envProject =
    process.env.STITCH_BILLING_PROJECT?.trim() ||
    process.env.GOOGLE_CLOUD_PROJECT?.trim() ||
    process.env.STITCH_USER_PROJECT?.trim();

  if (envProject) {
    return envProject;
  }

  const result = spawnSync("gcloud", ["config", "get-value", "project"], {
    encoding: "utf8"
  });

  if (result.status !== 0) {
    fail(
      "Could not resolve a Google billing project.\n" +
        "Set GOOGLE_CLOUD_PROJECT or STITCH_BILLING_PROJECT, or configure an active gcloud project."
    );
  }

  const project = result.stdout.trim();

  if (!project || project === "(unset)") {
    fail(
      "No Google billing project is configured.\n" +
        "Set GOOGLE_CLOUD_PROJECT or STITCH_BILLING_PROJECT before using the Stitch plugin."
    );
  }

  return project;
}

function resolveMcpRemoteEntry() {
  let packageJsonPath;

  try {
    packageJsonPath = require.resolve("mcp-remote/package.json");
  } catch {
    fail(
      "The local `mcp-remote` dependency is missing.\n" +
        "Run `pnpm install` in the plugin folder before using the bundled Stitch MCP server."
    );
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  const binEntry = packageJson.bin?.["mcp-remote"];

  if (typeof binEntry !== "string" || !binEntry) {
    fail("The installed `mcp-remote` package does not expose the expected `mcp-remote` binary.");
  }

  return path.resolve(path.dirname(packageJsonPath), binEntry);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}
