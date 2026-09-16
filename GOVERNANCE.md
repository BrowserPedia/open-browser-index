# Governance

Open Browser Index is maintained as a factual public data repository. Its
purpose is to make source-linked browser facts inspectable and reusable, not to
rank products or publish recommendations.

## Roles and boundaries

Contributors propose factual changes and evidence. Maintainers are responsible
for schema and taxonomy integrity, source traceability, conflict handling, and
the generated catalog. BrowserPedia is a downstream publisher: it may consume
an exact revision and write its own editorial material, but it does not turn
editorial judgments into facts in this repository.

This project does not accept recommendations, scores, rankings, affiliate
copy, review prose, or competitive claims. A factual note may describe a
documented limitation; it must not tell readers which product to choose.

## Decisions

Small corrections can be merged after maintainer review when the evidence is
clear and the generated catalog is current. Taxonomy, schema, boundary, and
governance changes require explicit review from a maintainer and a changelog
entry. When sources conflict, maintainers prefer a qualified statement or
`unknown` over an unsupported resolution. Contributors with a relevant
conflict must disclose it in the issue or pull request.

Maintainers may request changes, defer a claim, or revert a record when its
evidence expires or no longer supports the wording. Decisions should be
explained in the issue or pull request so the history remains auditable.

## Versioning

Git tags and `CHANGELOG.md` use semantic versioning: major for incompatible
schema/taxonomy changes, minor for additive compatible data shape or records,
and patch for factual corrections, source refreshes, and documentation.
Downstream consumers should pin an exact revision.
