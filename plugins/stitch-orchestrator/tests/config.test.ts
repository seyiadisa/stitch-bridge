import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DEFAULT_REVIEW_MODE, REVIEW_MODES } from "../src/types/run.js";
import { resolveTargetFolder } from "../src/config/targetFolder.js";
import { SUPPORTED_FRAMEWORKS, ensureFrameworkTarget } from "../src/config/frameworks.js";
import { detectPackageManagerPolicy } from "../src/config/packageManager.js";

test("resolveTargetFolder uses the current folder by default", () => {
  const cwd = path.join("D:", "workspace", "stitch-plugin");

  assert.equal(resolveTargetFolder({ cwd }), cwd);
});

test("resolveTargetFolder respects an explicit target folder", () => {
  const cwd = path.join("D:", "workspace", "stitch-plugin");

  assert.equal(
    resolveTargetFolder({ cwd, targetFolder: "./apps/demo" }),
    path.resolve(cwd, "apps/demo"),
  );
});

test("detectPackageManagerPolicy prefers pnpm when pnpm-lock.yaml exists", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-pnpm-"));
  fs.writeFileSync(path.join(targetFolder, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");

  await assert.doesNotReject(async () => {
    const policy = await detectPackageManagerPolicy(targetFolder);
    assert.equal(policy.name, "pnpm");
  });
});

test("detectPackageManagerPolicy keeps Bun when the folder is already configured for Bun", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-bun-"));
  fs.writeFileSync(
    path.join(targetFolder, "package.json"),
    JSON.stringify({ name: "demo", packageManager: "bun@1.2.15" }, null, 2),
  );

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.equal(policy.name, "bun");
});

test("ensureFrameworkTarget accepts the allowed frameworks", () => {
  assert.deepEqual(SUPPORTED_FRAMEWORKS, ["next", "react-vite", "vue-vite"]);

  for (const framework of SUPPORTED_FRAMEWORKS) {
    assert.equal(ensureFrameworkTarget(framework), framework);
  }
});

test("ensureFrameworkTarget rejects unsupported frameworks", () => {
  assert.throws(
    () => ensureFrameworkTarget("astro"),
    /Unsupported framework target/,
  );
});

test("shared run types expose the supported review modes and default", () => {
  assert.deepEqual(REVIEW_MODES, ["default", "staged"]);
  assert.equal(DEFAULT_REVIEW_MODE, "default");
});
