import {
  AI_CAPABILITIES,
  AVAILABILITY_STATES,
  BROWSER_STATUSES,
  EXTENSION_STORE_STATES,
  FEATURE_STATES,
  FORBIDDEN_KEYS,
  FORM_FACTORS,
  IOS_ENGINE_STATES,
  MOBILE_CAPABILITIES,
  PLATFORMS,
  PRIVACY_STATE_FIELDS,
  PRIVACY_TEXT_FIELDS,
  PUBLIC_BROWSER_KEYS,
  RELEASE_CHANNELS,
  RENDERING_ENGINES,
  REQUIRED_EVIDENCE_GROUPS,
  WORKFLOW_FEATURES,
} from "./taxonomy.js";

const FOUNDATION_KEYS = [
  "renderingEngine",
  "javascriptEngine",
  "upstreamProject",
  "codeLicense",
  "releaseChannel",
  "sourceRepository",
];
const EXTENSION_KEYS = [
  "chromeWebStore",
  "firefoxAddons",
  "manifestV2",
  "manifestV3",
  "limitations",
  "nativeContentBlocking",
];
const ROOT_REQUIRED = PUBLIC_BROWSER_KEYS;

const nonEmpty = (value) => typeof value === "string" && value.trim().length > 0;
const isoDate = (value) =>
  nonEmpty(value) &&
  /^\d{4}-\d{2}-\d{2}$/.test(value) &&
  !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
const httpUrl = (value) => {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};
const issue = (path, message) => `${path}: ${message}`;
const keys = (value) => (value && typeof value === "object" && !Array.isArray(value) ? Object.keys(value) : []);
const checkExactKeys = (value, expected, path, issues) => {
  const allowed = new Set(expected);
  keys(value).filter((key) => !allowed.has(key)).forEach((key) => issues.push(issue(`${path}.${key}`, "unknown key")));
};
const checkRequiredKeys = (value, required, path, issues) => {
  required.filter((key) => !value || value[key] === undefined).forEach((key) => issues.push(issue(`${path}.${key}`, "is required")));
};
const stableStringify = (value) => {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
};

const findForbidden = (value, path = "record") => {
  const issues = [];
  if (typeof value === "string") {
    if (/\/(?:Volumes|Users|tank)\//.test(value)) issues.push(issue(path, "private filesystem paths are not allowed"));
    return issues;
  }
  if (!value || typeof value !== "object") return issues;
  if (Array.isArray(value)) {
    value.forEach((item, index) => issues.push(...findForbidden(item, `${path}[${index}]`)));
    return issues;
  }
  Object.entries(value).forEach(([key, child]) => {
    if (FORBIDDEN_KEYS.includes(key)) issues.push(issue(`${path}.${key}`, "editorial, site, brand, or private fields are not allowed"));
    issues.push(...findForbidden(child, `${path}.${key}`));
  });
  return issues;
};

const checkSourceRefs = (value, path, sourceIds, issues) => {
  if (!Array.isArray(value) || value.length === 0) {
    issues.push(issue(path, "must contain at least one source reference"));
    return;
  }
  const seen = new Set();
  value.forEach((ref) => {
    if (!nonEmpty(ref)) issues.push(issue(path, "contains an empty source reference"));
    if (seen.has(ref)) issues.push(issue(path, `contains duplicate source reference ${ref}`));
    if (!sourceIds.has(ref)) issues.push(issue(path, `unknown source reference ${ref}`));
    seen.add(ref);
  });
};

const validateState = (value, path, sourceIds, issues, allowedStates = FEATURE_STATES) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    issues.push(issue(path, "must be a state object"));
    return;
  }
  checkExactKeys(value, ["value", "note", "sourceRefs"], path, issues);
  checkRequiredKeys(value, ["value", "note", "sourceRefs"], path, issues);
  if (!allowedStates.includes(value.value)) issues.push(issue(`${path}.value`, `unknown controlled state ${value.value}`));
  if (!nonEmpty(value.note)) issues.push(issue(`${path}.note`, "must be non-empty"));
  checkSourceRefs(value.sourceRefs, `${path}.sourceRefs`, sourceIds, issues);
};

const validateSources = (record, issues) => {
  if (!Array.isArray(record.sources) || record.sources.length === 0) {
    issues.push(issue("sources", "must contain at least one source"));
    return new Set();
  }
  const ids = new Set();
  record.sources.forEach((source, index) => {
    const path = `sources[${index}]`;
    if (!source || typeof source !== "object" || Array.isArray(source)) {
      issues.push(issue(path, "must be an object"));
      return;
    }
    checkExactKeys(source, ["id", "label", "url", "verifiedAt", "note"], path, issues);
    checkRequiredKeys(source, ["id", "label", "url", "verifiedAt", "note"], path, issues);
    if (!nonEmpty(source.id) || ids.has(source.id)) issues.push(issue(`${path}.id`, "must be a unique non-empty id"));
    ids.add(source.id);
    if (!nonEmpty(source.label)) issues.push(issue(`${path}.label`, "must be non-empty"));
    if (!httpUrl(source.url)) issues.push(issue(`${path}.url`, "must be an HTTP(S) URL"));
    if (!isoDate(source.verifiedAt)) issues.push(issue(`${path}.verifiedAt`, "must be an ISO date"));
    if (!nonEmpty(source.note)) issues.push(issue(`${path}.note`, "must be non-empty"));
  });
  return ids;
};

const validateObjectStates = (object, names, path, sourceIds, issues, allowedStates = FEATURE_STATES) => {
  if (!object || typeof object !== "object" || Array.isArray(object)) {
    issues.push(issue(path, "must be an object"));
    return;
  }
  checkExactKeys(object, names, path, issues);
  checkRequiredKeys(object, names, path, issues);
  names.forEach((name) => validateState(object[name], `${path}.${name}`, sourceIds, issues, allowedStates));
};

export const validateBrowser = (record) => {
  const issues = [];
  if (!record || typeof record !== "object" || Array.isArray(record)) return ["record: must be an object"];
  issues.push(...findForbidden(record));
  checkExactKeys(record, ROOT_REQUIRED, "record", issues);
  checkRequiredKeys(record, ROOT_REQUIRED, "record", issues);
  ["slug", "name", "canonicalUrl", "publisher", "country", "sourceId", "statusNote"].forEach((field) => {
    if (!nonEmpty(record[field])) issues.push(issue(field, "must be non-empty"));
  });
  ["canonicalUrl"].forEach((field) => {
    if (record[field] && !httpUrl(record[field])) issues.push(issue(field, "must be an HTTP(S) URL"));
  });
  ["firstPublished", "verifiedAt"].forEach((field) => {
    if (!isoDate(record[field])) issues.push(issue(field, "must be an ISO date"));
  });
  if (!BROWSER_STATUSES.includes(record.status)) issues.push(issue("status", `unknown status ${record.status}`));

  const sourceIds = validateSources(record, issues);
  if (record.sourceId && !sourceIds.has(record.sourceId)) issues.push(issue("sourceId", `must match a source id (${record.sourceId})`));

  if (!record.availability || typeof record.availability !== "object") issues.push(issue("availability", "must be an object"));
  else {
    checkExactKeys(record.availability, [...PLATFORMS, "cpuNotes", "installMethod"], "availability", issues);
    checkRequiredKeys(record.availability, [...PLATFORMS, "cpuNotes", "installMethod"], "availability", issues);
    PLATFORMS.forEach((platform) => validateState(record.availability[platform], `availability.${platform}`, sourceIds, issues, AVAILABILITY_STATES));
    ["cpuNotes", "installMethod"].forEach((field) => { if (!nonEmpty(record.availability[field])) issues.push(issue(`availability.${field}`, "must be non-empty")); });
  }

  if (!record.foundation || typeof record.foundation !== "object") issues.push(issue("foundation", "must be an object"));
  else {
    checkExactKeys(record.foundation, FOUNDATION_KEYS, "foundation", issues);
    checkRequiredKeys(record.foundation, FOUNDATION_KEYS, "foundation", issues);
    ["javascriptEngine", "upstreamProject", "codeLicense"].forEach((field) => { if (!nonEmpty(record.foundation[field])) issues.push(issue(`foundation.${field}`, "must be non-empty")); });
    if (!RENDERING_ENGINES.includes(record.foundation.renderingEngine)) issues.push(issue("foundation.renderingEngine", "is not controlled"));
    if (!RELEASE_CHANNELS.includes(record.foundation.releaseChannel)) issues.push(issue("foundation.releaseChannel", "is not controlled"));
    if (!httpUrl(record.foundation.sourceRepository)) issues.push(issue("foundation.sourceRepository", "must be an HTTP(S) URL"));
  }

  if (!record.privacy || typeof record.privacy !== "object") issues.push(issue("privacy", "must be an object"));
  else {
    checkExactKeys(record.privacy, [...PRIVACY_STATE_FIELDS, ...PRIVACY_TEXT_FIELDS], "privacy", issues);
    checkRequiredKeys(record.privacy, [...PRIVACY_STATE_FIELDS, ...PRIVACY_TEXT_FIELDS], "privacy", issues);
    PRIVACY_STATE_FIELDS.forEach((field) => validateState(record.privacy[field], `privacy.${field}`, sourceIds, issues));
    PRIVACY_TEXT_FIELDS.forEach((field) => { if (!nonEmpty(record.privacy[field])) issues.push(issue(`privacy.${field}`, "must be non-empty")); });
  }

  if (!record.extensions || typeof record.extensions !== "object") issues.push(issue("extensions", "must be an object"));
  else {
    checkExactKeys(record.extensions, EXTENSION_KEYS, "extensions", issues);
    checkRequiredKeys(record.extensions, EXTENSION_KEYS, "extensions", issues);
    ["chromeWebStore", "firefoxAddons"].forEach((field) => { if (!EXTENSION_STORE_STATES.includes(record.extensions[field])) issues.push(issue(`extensions.${field}`, "is not controlled")); });
    ["manifestV2", "manifestV3", "nativeContentBlocking"].forEach((field) => validateState(record.extensions[field], `extensions.${field}`, sourceIds, issues));
    if (!nonEmpty(record.extensions.limitations)) issues.push(issue("extensions.limitations", "must be non-empty"));
  }

  validateObjectStates(record.workflow, WORKFLOW_FEATURES, "workflow", sourceIds, issues);
  if (!FORM_FACTORS.includes(record.formFactor)) issues.push(issue("formFactor", "is not controlled"));
  validateState(record.iosEngine, "iosEngine", sourceIds, issues, IOS_ENGINE_STATES);
  validateObjectStates(record.ai, AI_CAPABILITIES, "ai", sourceIds, issues);
  validateObjectStates(record.mobile, MOBILE_CAPABILITIES, "mobile", sourceIds, issues);

  if (!record.evidence || typeof record.evidence !== "object" || Array.isArray(record.evidence)) issues.push(issue("evidence", "must be an object"));
  else {
    checkExactKeys(record.evidence, REQUIRED_EVIDENCE_GROUPS, "evidence", issues);
    checkRequiredKeys(record.evidence, REQUIRED_EVIDENCE_GROUPS, "evidence", issues);
    REQUIRED_EVIDENCE_GROUPS.forEach((group) => checkSourceRefs(record.evidence[group], `evidence.${group}`, sourceIds, issues));
  }
  return issues;
};

export const validateBrowsers = (records) => {
  if (!Array.isArray(records)) return ["browsers: must be an array"];
  const issues = [];
  const slugs = new Set();
  records.forEach((record, index) => {
    if (slugs.has(record?.slug)) issues.push(issue(`browsers[${index}].slug`, "must be unique"));
    slugs.add(record?.slug);
    validateBrowser(record).forEach((error) => issues.push(`browsers[${index}].${error}`));
  });
  return issues;
};

export const validateSourceCatalog = (catalog) => {
  const issues = [];
  if (!catalog || typeof catalog !== "object" || Array.isArray(catalog)) return ["sources: must be an object"];
  Object.entries(catalog).forEach(([key, source]) => {
    if (key !== source?.id) issues.push(issue(`sources.${key}`, "catalog key must match source id"));
    const recordIssues = [];
    validateSources({ sources: [source] }, recordIssues);
    recordIssues.forEach((error) => issues.push(`sources.${key}.${error}`));
  });
  const ids = Object.values(catalog).map((source) => source?.id);
  if (new Set(ids).size !== ids.length) issues.push("sources: ids must be unique");
  return issues;
};

export const validateDataset = ({ browsers, sources, browserFiles = undefined }) => {
  const issues = [];
  issues.push(...validateSourceCatalog(sources));
  issues.push(...validateBrowsers(browsers));
  const sourceIds = new Set(Object.keys(sources || {}));
  const referencedSourceIds = new Set();
  (browsers || []).forEach((browser, index) => {
    if (browserFiles && browser?.slug && browserFiles[index] !== `${browser.slug}.json`) issues.push(`browsers[${index}]: filename must be ${browser.slug}.json`);
    (browser?.sources || []).forEach((source, sourceIndex) => {
      if (!source || typeof source !== "object") return;
      if (!sourceIds.has(source.id)) issues.push(`browsers[${index}].sources[${sourceIndex}].id: not present in source catalog`);
      referencedSourceIds.add(source.id);
      if (sourceIds.has(source.id) && stableStringify(source) !== stableStringify(sources[source.id])) issues.push(`browsers[${index}].sources[${sourceIndex}]: differs from data/sources.json source catalog`);
    });
  });
  sourceIds.forEach((id) => { if (!referencedSourceIds.has(id)) issues.push(`sources.${id}: is not referenced by a browser record`); });
  return issues;
};

export const assertValidDataset = (dataset) => {
  const issues = validateDataset(dataset);
  if (issues.length) throw new Error(`Invalid BrowserPedia factual dataset:\n${issues.join("\n")}`);
  return true;
};
