# Open Browser Index

Open Browser Index is a small, public, source-linked dataset of browser facts.
It is designed for people and software that need a stable factual baseline:
identity, availability, foundation, privacy, extensions, workflow, AI, and
mobile capabilities. The initial catalog contains 37 browser records, each in
its own reviewable JSON file.

BrowserPedia is a downstream publisher and consumer of this repository. It may
turn these facts into editorial pages or recommendations, but recommendations
are deliberately **not** part of Open Browser Index. This repository does not
contain the BrowserPedia site, UI, branding assets, guides, comparisons, or
private application code.

## Repository layout

```text
data/browsers/*.json         One factual record per browser
data/sources.json            Public source catalog
schemas/browser.schema.json  Machine-readable record shape
src/taxonomy.js              Controlled vocabularies
src/validator.js             No-dependency validation library
src/validate.js              Repository validation command
src/build.js                 Deterministic dist assembler
dist/                        Generated catalog (committed and reviewable)
test/                        Node's built-in test runner tests and fixtures
```

## Data and evidence contract

Every material claim is represented by a controlled state or factual text with
claim-level `sourceRefs`. A browser record also contains an `evidence` map for
the broad identity, availability, foundation, privacy, extension, workflow,
and status groups. Every referenced source must exist in both the record's
source snapshot and `data/sources.json`; snapshots must be equivalent to the
catalog entry. Sources require a public HTTP(S) URL, a useful label and note,
and an ISO verification date.

Use `unknown` when a capability was not verified. Do not convert an absence of
documentation into `unavailable`. Use `minimal-or-opt-in` or
`available-by-extension` where that is the factual distinction. Notes should
state the scope and qualification needed to interpret a claim, including
platform or regional limits.

Corrections should cite primary vendor or project documentation where
possible. A secondary source is acceptable when it directly documents a fact
and the primary source is unavailable, but explain why. Report conflicts
between sources rather than silently choosing the more convenient claim; a
maintainer may retain a qualified `unknown` state until the conflict is
resolved. Maintainers and contributors must disclose relevant financial,
employment, affiliate, or review relationships when proposing facts about a
vendor. A conflict does not automatically disqualify a correction, but it must
be visible to reviewers.

## Validation and generated files

This is a plain Git repository, not an npm package. `package.json` exists only
as a local task runner configuration; it has no package identity or publishing
configuration. Node.js 20 or newer is required and there are no runtime or
development dependencies.

```sh
npm run validate   # validate source records and source snapshots
npm test           # run focused node:test checks
npm run build      # validate, then deterministically rewrite dist/
```

The build has no clock-dependent output. It reads sorted filenames and writes
stable JSON with a fixed dataset version. `dist/` is committed so downstream
consumers can inspect the exact assembled catalog. A pull request that changes
source data must include the resulting generated diff; CI fails if generated
files are stale.

Downstream applications should consume an exact Git revision (or a submodule
pin), not an unreviewed moving branch. The generated catalog is data, not an
API promise: changes to factual values are reviewed as data changes.

## Boundaries and releases

The factual data and the editorial product that publishes it are separate
concerns. Maintainers may reject persuasive language, rankings, invented
scores, unsupported inferences, and product recommendations even when the
underlying browser is popular. BrowserPedia owns its editorial decisions as a
downstream publisher; this repository does not endorse any browser.

Open Browser Index uses semantic release labels for Git tags and changelog
entries:

* **MAJOR**: incompatible schema or controlled-vocabulary changes.
* **MINOR**: additive factual fields, taxonomy terms, or new browser records
  that do not invalidate existing consumers.
* **PATCH**: corrected facts, source updates, documentation, or generated data
  changes that preserve the schema.

Tags are ordinary Git releases. There is no npm release or publish workflow.

## License and attribution

Copyright © 2026 BrowserPedia contributors. The dataset is available under
[CC BY 4.0](./LICENSE). Please retain attribution and the source URLs when
redistributing it. See `dist/metadata.json` for machine-readable attribution.

## Contributing

Read [CONTRIBUTING.md](./CONTRIBUTING.md), [GOVERNANCE.md](./GOVERNANCE.md),
and [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) before opening a change.
Security reports should follow [SECURITY.md](./SECURITY.md).
