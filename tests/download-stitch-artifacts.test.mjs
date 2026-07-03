import test from "node:test";
import assert from "node:assert/strict";

import {
  collectScreenIds,
  getRequiredApiKey,
  getRequiredMetadataPath,
  getRequiredProjectId,
  normalizeResourceId
} from "../scripts/download-stitch-artifacts.mjs";

test("normalizeResourceId strips resource prefixes", () => {
  assert.equal(normalizeResourceId("projects/abc"), "abc");
  assert.equal(normalizeResourceId("projects/abc/screens/def", "screens"), "def");
  assert.equal(normalizeResourceId("plain-id"), "plain-id");
});

test("getRequiredApiKey returns trimmed key", () => {
  assert.equal(getRequiredApiKey({ STITCH_API_KEY: "  test-key  " }), "test-key");
});

test("getRequiredApiKey throws when key is missing", () => {
  assert.throws(
    () => getRequiredApiKey({}),
    /STITCH_API_KEY/
  );
});

test("getRequiredMetadataPath honors explicit override", () => {
  assert.equal(
    getRequiredMetadataPath({ STITCH_METADATA_PATH: ".stitch/custom.json" }),
    ".stitch/custom.json"
  );
});

test("getRequiredProjectId accepts flat and nested metadata", () => {
  assert.equal(getRequiredProjectId({ projectId: "projects/demo-project" }), "demo-project");
  assert.equal(getRequiredProjectId({ project: { id: "demo-project-2" } }), "demo-project-2");
});

test("getRequiredProjectId throws when project id is missing", () => {
  assert.throws(
    () => getRequiredProjectId({}),
    /project id/i
  );
});

test("collectScreenIds supports string and object screen entries", () => {
  const ids = collectScreenIds({
    screens: [
      "screens/hero",
      { id: "screens/features" },
      { screenId: "cta" },
      { name: "projects/demo/screens/footer" }
    ]
  });

  assert.deepEqual(ids, ["hero", "features", "cta", "footer"]);
});

test("collectScreenIds deduplicates repeated screen ids", () => {
  const ids = collectScreenIds({
    screens: [
      "hero",
      { id: "hero" },
      { screenId: "screens/hero" }
    ]
  });

  assert.deepEqual(ids, ["hero"]);
});
