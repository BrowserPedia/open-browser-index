export const BROWSER_STATUSES = Object.freeze([
  "active",
  "maintenance-mode",
  "experimental",
  "discontinued",
  "unsupported",
]);

export const AVAILABILITY_STATES = Object.freeze([
  "available",
  "partial",
  "unavailable",
  "unknown",
]);

export const FEATURE_STATES = Object.freeze([
  "built-in",
  "available-by-extension",
  "minimal-or-opt-in",
  "not-applicable",
  "unavailable",
  "unknown",
]);

export const EXTENSION_STORE_STATES = Object.freeze([
  "supported",
  "partial",
  "unsupported",
  "unknown",
]);

export const RENDERING_ENGINES = Object.freeze([
  "chromium",
  "gecko",
  "webkit",
  "goanna",
  "ladybird",
  "webview",
]);

export const FORM_FACTORS = Object.freeze(["desktop", "mobile", "cross-platform"]);

export const AI_CAPABILITIES = Object.freeze([
  "assistant",
  "summarization",
  "agenticActions",
  "aiSearch",
  "contentGeneration",
  "modelChoice",
  "aiPrivacyControls",
  "crossTabContext",
  "voiceMultimodal",
]);

export const MOBILE_CAPABILITIES = Object.freeze([
  "dataSaver",
  "mobileExtensions",
  "setAsDefault",
  "desktopSiteMode",
  "downloadManager",
  "offlineReading",
  "addressBarPosition",
  "biometricLock",
  "backgroundMedia",
  "webPush",
]);

export const IOS_ENGINE_STATES = Object.freeze([
  "webkit-required",
  "own-engine-permitted-not-shipped",
  "own-engine-shipped",
  "not-applicable",
  "unknown",
]);

export const RELEASE_CHANNELS = Object.freeze([
  "stable",
  "beta",
  "nightly",
  "rolling",
  "experimental",
]);

export const PLATFORMS = Object.freeze(["macos", "windows", "linux", "android", "ios"]);

export const WORKFLOW_FEATURES = Object.freeze([
  "verticalTabs",
  "tabTrees",
  "workspaces",
  "profiles",
  "splitView",
  "sidebar",
  "readerMode",
  "commandPalette",
  "sync",
  "translation",
  "pwa",
]);

export const PRIVACY_STATE_FIELDS = Object.freeze([
  "telemetry",
  "trackerBlocking",
  "fingerprintingProtections",
  "vpnOrProxy",
]);

export const PRIVACY_TEXT_FIELDS = Object.freeze([
  "privateWindows",
  "defaultSearchEngine",
]);

export const REQUIRED_EVIDENCE_GROUPS = Object.freeze([
  "identity",
  "availability",
  "foundation",
  "privacy",
  "extensions",
  "workflow",
  "status",
]);

export const PUBLIC_BROWSER_KEYS = Object.freeze([
  "slug",
  "name",
  "canonicalUrl",
  "publisher",
  "country",
  "sourceId",
  "status",
  "statusNote",
  "availability",
  "foundation",
  "privacy",
  "extensions",
  "workflow",
  "formFactor",
  "iosEngine",
  "ai",
  "mobile",
  "evidence",
  "firstPublished",
  "verifiedAt",
  "sources",
]);

export const FORBIDDEN_KEYS = Object.freeze([
  "editorial",
  "shortDescription",
  "alternatives",
  "comparisonLinks",
  "guides",
  "comparisons",
  "brandAssets",
  "logoSource",
  "siteCode",
  "privatePath",
]);
