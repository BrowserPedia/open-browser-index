import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assertValidDataset } from "./validator.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const output = join(root, "dist");
const browserFiles = (await readdir(join(root, "data", "browsers"))).filter((file) => file.endsWith(".json")).sort();
const browsers = await Promise.all(browserFiles.map(async (file) => JSON.parse(await readFile(join(root, "data", "browsers", file), "utf8"))));
const sources = JSON.parse(await readFile(join(root, "data", "sources.json"), "utf8"));
assertValidDataset({ browsers, sources, browserFiles });
const orderedSources = Object.fromEntries(Object.entries(sources).sort(([left], [right]) => left.localeCompare(right)));

const verifiedAt = browsers[0]?.verifiedAt;
if (!verifiedAt || browsers.some((browser) => browser.verifiedAt !== verifiedAt)) throw new Error("All browser records must share a verification date");
const metadata = {
  name: "Open Browser Index",
  version: "1.0.0",
  dataset: "Open Browser Index factual browser catalog",
  description: "Source-linked factual records about browser identity, availability, foundations, privacy, extensions, workflow, AI, and mobile capabilities.",
  license: {
    spdx: "CC-BY-4.0",
    name: "Creative Commons Attribution 4.0 International",
    url: "https://creativecommons.org/licenses/by/4.0/",
  },
  attribution: {
    name: "BrowserPedia",
    url: "https://browserpedia.com",
    text: "BrowserPedia factual browser data, licensed under CC BY 4.0.",
  },
  verifiedAt,
  browserCount: browsers.length,
  sourceCount: Object.keys(orderedSources).length,
  includesRecommendations: false,
};
const catalog = {
  schemaVersion: "1.0.0",
  datasetVersion: "1.0.0",
  verifiedAt,
  browsers,
  sources: orderedSources,
};
await mkdir(output, { recursive: true });
const json = (value) => `${JSON.stringify(value, null, 2)}\n`;
await writeFile(join(output, "browsers.json"), json(browsers));
await writeFile(join(output, "sources.json"), json(orderedSources));
await writeFile(join(output, "metadata.json"), json(metadata));
await writeFile(join(output, "catalog.json"), json(catalog));
console.log(`Built dist for ${browsers.length} browsers and ${Object.keys(sources).length} sources.`);
