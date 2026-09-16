import test from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { validateBrowser, validateDataset } from "../src/validator.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const browserFiles = (await readdir(join(root, "data", "browsers"))).filter((file) => file.endsWith(".json")).sort();
const browsers = await Promise.all(browserFiles.map(async (file) => JSON.parse(await readFile(join(root, "data", "browsers", file), "utf8"))));
const sources = JSON.parse(await readFile(join(root, "data", "sources.json"), "utf8"));

test("the initial catalog has all 37 factual browser records", () => {
  assert.equal(browsers.length, 37);
  assert.equal(Object.keys(sources).length, 37);
  assert.deepEqual(validateDataset({ browsers, sources, browserFiles }), []);
});

test("invalid fixture reports forbidden fields and broken evidence", async () => {
  const invalid = JSON.parse(await readFile(join(root, "test", "fixtures", "invalid-browser.json"), "utf8"));
  const issues = validateBrowser({ ...invalid, editorial: { recommendation: "not allowed" } });
  assert.ok(issues.some((issue) => issue.includes("editorial")));
  assert.ok(issues.some((issue) => issue.includes("must be an HTTP(S) URL")));
  assert.ok(issues.some((issue) => issue.includes("must be an ISO date")));
  assert.ok(issues.some((issue) => issue.includes("unknown source reference missing-source")));
});

test("embedded source snapshots cannot drift from the source catalog", () => {
  const changed = structuredClone(browsers);
  changed[0].sources[0].note = "changed without updating the catalog";
  const issues = validateDataset({ browsers: changed, sources, browserFiles });
  assert.ok(issues.some((issue) => issue.includes("differs from data/sources.json source catalog")));
});

test("duplicate slugs are rejected", () => {
  const duplicate = structuredClone(browsers);
  duplicate[1].slug = duplicate[0].slug;
  const issues = validateDataset({ browsers: duplicate, sources, browserFiles });
  assert.ok(issues.some((issue) => issue.includes("slug: must be unique")));
});
