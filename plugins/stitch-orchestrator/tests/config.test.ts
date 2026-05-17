import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { DEFAULT_REVIEW_MODE, REVIEW_MODES } from "../src/types/run.js";
import { resolveTargetFolder } from "../src/config/targetFolder.js";
import { SUPPORTED_FRAMEWORKS, ensureFrameworkTarget } from "../src/config/frameworks.js";
import { detectPackageManagerPolicy } from "../src/config/packageManager.js";
import { ensureReviewMode } from "../src/config/reviewMode.js";

test("resolveTargetFolder uses the current folder by default", () => {
  const cwd = path.join("D:", "workspace", "stitch-plugin");

  assert.deepEqual(resolveTargetFolder({ cwd }), {
    cwd,
    targetFolder: cwd,
  });
});

test("resolveTargetFolder respects an explicit target folder", () => {
  const cwd = path.join("D:", "workspace", "stitch-plugin");

  assert.deepEqual(resolveTargetFolder({ cwd, targetFolder: "./apps/demo" }), {
    cwd,
    targetFolder: path.resolve(cwd, "apps/demo"),
  });
});

test("detectPackageManagerPolicy prefers pnpm when pnpm-lock.yaml exists", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-pnpm-"));
  fs.writeFileSync(path.join(targetFolder, "pnpm-lock.yaml"), "lockfileVersion: '9.0'");

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: "pnpm",
    source: "pnpm-lock",
    detectedManager: null,
    signal: "pnpm-lock.yaml",
  });
});

test("detectPackageManagerPolicy keeps Bun when the folder is already configured for Bun", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-bun-"));
  fs.writeFileSync(
    path.join(targetFolder, "package.json"),
    JSON.stringify({ name: "demo", packageManager: "bun@1.2.15" }, null, 2),
  );

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: "bun",
    source: "bun",
    detectedManager: null,
    signal: "packageManager:bun",
  });
});

test("detectPackageManagerPolicy keeps Bun when bun.lock exists", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-bun-lock-"));
  fs.writeFileSync(path.join(targetFolder, "bun.lock"), "");

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: "bun",
    source: "bun",
    detectedManager: null,
    signal: "bun.lock",
  });
});

test("detectPackageManagerPolicy keeps Bun when bun.lockb exists", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-bun-lockb-"));
  fs.writeFileSync(path.join(targetFolder, "bun.lockb"), "");

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: "bun",
    source: "bun",
    detectedManager: null,
    signal: "bun.lockb",
  });
});

test("detectPackageManagerPolicy keeps Bun when bunfig.toml exists", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-bunfig-"));
  fs.writeFileSync(path.join(targetFolder, "bunfig.toml"), "preload = []");

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: "bun",
    source: "bun",
    detectedManager: null,
    signal: "bunfig.toml",
  });
});

test("detectPackageManagerPolicy flags unsupported npm-style manager signals", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-npm-"));
  fs.writeFileSync(path.join(targetFolder, "package-lock.json"), "{}");

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: null,
    source: "unsupported",
    detectedManager: "npm",
    signal: "package-lock.json",
  });
});

test("detectPackageManagerPolicy flags unsupported packageManager declarations", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-yarn-"));
  fs.writeFileSync(
    path.join(targetFolder, "package.json"),
    JSON.stringify({ name: "demo", packageManager: "yarn@4.4.1" }, null, 2),
  );

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: null,
    source: "unsupported",
    detectedManager: "yarn",
    signal: "packageManager:yarn",
  });
});

test("detectPackageManagerPolicy reports no signal for a new app folder", async () => {
  const targetFolder = fs.mkdtempSync(path.join(os.tmpdir(), "stitch-config-empty-"));

  const policy = await detectPackageManagerPolicy(targetFolder);

  assert.deepEqual(policy, {
    name: null,
    source: "none",
    detectedManager: null,
    signal: null,
  });
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
  assert.equal(ensureReviewMode(undefined), "default");
  assert.equal(ensureReviewMode("staged"), "staged");
});

test("ensureReviewMode rejects unsupported values", () => {
  assert.throws(
    () => ensureReviewMode("deep-review"),
    /Unsupported review mode/,
  );
});
