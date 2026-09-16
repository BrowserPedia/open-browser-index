import { readdir, readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { assertValidDataset } from "./validator.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const browserDirectory = join(root, "data", "browsers");
const browserFiles = (await readdir(browserDirectory)).filter((file) => file.endsWith(".json")).sort();
const browsers = await Promise.all(browserFiles.map(async (file) => JSON.parse(await readFile(join(browserDirectory, file), "utf8"))));
const sources = JSON.parse(await readFile(join(root, "data", "sources.json"), "utf8"));
assertValidDataset({ browsers, sources, browserFiles });
console.log(`Validated ${browsers.length} browsers and ${Object.keys(sources).length} sources.`);
