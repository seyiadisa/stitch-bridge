import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptDir, "..");
const testsRoot = path.join(packageRoot, "tests");

const allTestFiles = await findTestFiles(testsRoot);
const rawArgs = process.argv.slice(2);
const matchedFiles = rawArgs.length === 0 ? allTestFiles : matchTests(allTestFiles, rawArgs);

if (matchedFiles.length === 0) {
  process.stderr.write(`No test files matched: ${rawArgs.join(", ")}\n`);
  process.exit(1);
}

const child = spawn(process.execPath, ["--import", "tsx", "--test", ...matchedFiles], {
  cwd: packageRoot,
  stdio: "inherit",
});

child.on("exit", (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 1);
});

function matchTests(testFiles, args) {
  return testFiles.filter((filePath) => {
    const relativePath = path.relative(packageRoot, filePath).replace(/\\/g, "/");
    const baseName = path.basename(filePath);

    return args.some((arg) => {
      const normalizedArg = arg.replace(/\\/g, "/");
      return (
        relativePath.includes(normalizedArg) ||
        baseName === normalizedArg ||
        baseName === `${normalizedArg}.ts`
      );
    });
  });
}

async function findTestFiles(rootDir) {
  const entries = await fs.readdir(rootDir, { withFileTypes: true });
  const results = [];

  for (const entry of entries) {
    const fullPath = path.join(rootDir, entry.name);

    if (entry.isDirectory()) {
      results.push(...(await findTestFiles(fullPath)));
      continue;
    }

    if (entry.isFile() && entry.name.endsWith(".test.ts")) {
      results.push(fullPath);
    }
  }

  return results.sort();
}
