import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";

const require = createRequire(import.meta.url);

export function main(options = {}) {
  const env = options.env ?? process.env;
  const remoteUrl = env.STITCH_MCP_URL ?? "https://stitch.googleapis.com/mcp";
  const apiKey = getRequiredApiKey(env);
  const proxyEntry = resolveMcpRemoteEntry();
  const proxyArgs = buildProxyArgs({ proxyEntry, remoteUrl, apiKey });
  const child = spawn(process.execPath, proxyArgs, {
    stdio: "inherit",
    env
  });

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 1);
  });

  return child;
}

export function getRequiredApiKey(env = process.env) {
  const apiKey = env.STITCH_API_KEY?.trim();

  if (!apiKey) {
    fail(
      "Missing required Stitch credential `STITCH_API_KEY`.\n" +
        "Create a Stitch API key, expose it to the Codex process, and restart Codex."
    );
  }

  return apiKey;
}

export function buildProxyArgs({ proxyEntry, remoteUrl, apiKey }) {
  return [
    proxyEntry,
    remoteUrl,
    "--header",
    `X-Goog-Api-Key: ${apiKey}`
  ];
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
  throw new Error(message);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exit(1);
  }
}
