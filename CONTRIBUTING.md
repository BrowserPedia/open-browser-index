# Contributing to Open Browser Index

## Before opening a change

Check the existing record and source catalog first. Keep one browser per file,
use the existing controlled vocabulary, and edit only factual fields. Do not
add `editorial`, `shortDescription`, recommendations, alternatives,
comparisons, guides, UI/site code, brand assets, or filesystem paths.

For a correction, include:

1. the exact record and claim being corrected;
2. one or more public URLs, preferably primary documentation;
3. the relevant passage or a precise description of what it establishes;
4. the date checked and platform, version, region, or plan limits; and
5. any conflict of interest, sponsorship, employment, affiliate relationship,
   or other relationship with the vendor.

Do not treat marketing copy as proof of a stronger capability than it states.
Record uncertainty rather than inferring a negative. If credible sources
conflict, explain both positions and let reviewers decide whether a qualified
state or additional note is appropriate.

## Adding a browser

Use the new-browser issue form first unless the record and evidence are ready
for immediate review. A new record needs identity, all five platform
availability states, foundation, privacy, extension, workflow, AI, and mobile
facts, verification dates, evidence groups, and a source snapshot matching
`data/sources.json`. Do not add a partial or demo record.

## Local checks

```sh
npm run validate
npm test
npm run build
git diff --check
git diff -- dist/
```

Commit generated `dist/` changes with the source changes. Do not commit local
logs, editor settings, dependencies, credentials, or build artifacts outside
`dist/`.

## Review standard

Reviewers check evidence quality, source dates and URLs, controlled terms,
platform scope, conflicts of interest, and the factual/editorial boundary.
The maintainer may request a narrower claim, a qualification, or a more direct
source. Approval is not an endorsement of the browser or its vendor.
