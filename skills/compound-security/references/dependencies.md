# Dependency inspection

Inspect npm/pnpm dependencies without changing target source. This mode creates a private evidence snapshot and local reports; it does not authorize repair, upload, or deployment. Read [execution.md](execution.md), [knowledge.md](knowledge.md), and [commands.md](commands.md) first.

## Shared record

`DEPENDENCIES.json` schema version 1 is the agent and report source. Start from [the synthetic example](../assets/dependencies.example.json), never presenting its contents as observed evidence. Validate using [validate-dependencies.cjs](../scripts/validate-dependencies.cjs).

`source_revision` MUST be `sha256:<64 lowercase hex digits>`, a composite digest covering commit, all relevant dirty-source contents, manifests, lockfiles, and installed-state metadata when installed evidence is used. A bare commit SHA is invalid. Use `sourceRevision` from [dependency-source.cjs](../scripts/dependency-source.cjs) with `{commit, dirty_digest, manifests, lockfiles, installed}`: commit is a string or null for an uncommitted fixture; dirty_digest is the SHA-256 of the sorted relevant dirty-file manifest; manifests and lockfiles map repository-relative paths to SHA-256 content digests; installed is null for lockfile-only evidence or a digest map for installed metadata. Empty lockfile maps represent unavailable lockfiles, not a resolved tree. Compute this identity before and after collection and again at handoff; differing digests invalidate the capture. The helper canonicalizes map order but does not inspect files or attest their truth. Persist the composite identity in the capture's `source_revision`; separately supplied ad-hoc digest fields are not part of the envelope and are not retained. Each evidence entry has an ID, kind, capture timestamp, status (`ok` or `error`), binding (`current`, `historical`, or `unbound`), and source identity. Current inventory uses only current successful evidence. Coverage is independent for declarations, resolutions, outdated data, advisories, and usage: each names scope, evidence, and gaps. Complete means complete within that stated dimension and scope, never secure.

Instances have stable IDs, workspace, location, name, version or declared range, provenance (`declared`, `lockfile`, `installed`), and evidence IDs. Edges reference instances. Advisory IDs are distinct from affected instances. Actions reference instances, advisories, evidence, and earlier prerequisites, with an order, target, title, rationale, and uncertainty. Set `category` to `upgrade`, `investigate`, `mitigate`, or `defer` so sharing recipients can identify the next action without private prose. Counts never add overlapping candidate benefits.

## Assessment

Recall applicable lessons before recommending actions. Trace actual usage with file references. Record each instance’s optional `usage` as `observation`, `intent`, and current `evidence` IDs. Explicitly label inferred intent; omit usage when unknown. Explain dependency ancestry separately from usage and historical intent; label inference and unknowns. Rank using demonstrated exposure/prerequisites, known business importance, urgency, remediation leverage, and compatibility uncertainty. Never invent a numeric security score, treat a scanner match as a confirmed exploit, or infer safety from missing imports.

Produce a concise next action or exact evidence gap. Read-only inspection ends at the report. An explicitly selected repair proceeds through the existing patch workflow after checking current source identity. A report cannot grant permission. Preserve applied/stale/not_applicable lesson labels and separate patch security, compatibility, and deployment results; stale verification remains historical.

## Collect and normalize

Bundled scripts read data files only. They never execute package managers or fetch metadata. Use [normalize-dependencies.cjs](../scripts/normalize-dependencies.cjs) with a capture envelope and a new output path. The envelope contains `source_revision`, optional `generated_at`, `manifests` (each with a repository-relative `workspace` and parsed `data`), and `captures`. Read explicitly scoped manifest files, not JavaScript configuration. Check workspace patterns against supplied files and leave incomplete expansion visible.

Each capture has `id`, `kind` (`list`, `outdated`, `audit`), `manager`, `version`, `source_revision`, `captured_at`, `exit_code`, `scope`, optional `filters`, and parsed `payload`. Raw command strings are never persisted because they can contain credentials. Acquisition provenance retains manager/kind, scope, filters, exit status, timestamp, and payload digest. List captures also require `provenance` (`lockfile` or `installed`) and should provide `workspaces` in root-output order. For npm workspace wrappers, include named workspace manifests so the adapter can associate linked root packages with their repository-relative workspace. pnpm resolution-context paths are retained independently of ancestry. Outdated captures should supply `workspaces`; observations require current version and a unique workspace/location match, otherwise they remain unmapped evidence with a coverage gap. Source identity must be recorded at collection time, including pre/post manifest/lockfile digests and, for installed-tree captures, installed-state metadata digests (npm hidden lockfile or pnpm .modules.yaml); do not bind arbitrary old output to today's checkout. If inputs change during collection, keep the capture historical. Imports are owner assertions, not cryptographic attestations.

Supported adapters: npm 11; pnpm 10.23 or later within major 10. Unsupported versions produce a partial report. Do not upgrade a customer's toolchain to collect evidence. Missing tools, lockfiles, installed packages, registry access, or enforced runner controls are gaps, not permission to install. Capture nonzero exit codes and output separately: audit findings can exit nonzero, while malformed or failed acquisition must not become an empty healthy report.

Use the existing execution boundary for any host-run package-manager command, including list/why/explain. Inspect toolchain identity and startup behavior first; disable self-management, project hook loading, and automatic toolchain downloads where supported. Flags alone do not prove isolation. No verified runner means source-only inspection or owner-provided captures. Network-dependent outdated/audit collection cannot run inside the required no-network runner. An already authorized scanner adapter must independently satisfy execution.md; otherwise let the owner collect and import.

For an owner-controlled collection, describe the effective registry destination and disclosed dependency data before any online command. Do not dump registry credentials. npm audit can send the complete lockfile tree and runtime metadata on fallback. Outdated latest tags do not prove a security fix. A private-registry result does not prove a package name is public.

Version-specific command semantics:

- npm 11: `npm ls --all --json --package-lock-only --ignore-scripts`; deliberate workspace selection is required. `npm outdated --all --json` and `npm audit --json` are online enrichment, not the default.
- pnpm 10.23+: `pnpm --config.manage-package-manager-versions=false --config.ignore-pnpmfile=true list -r --lockfile-only --json --depth Infinity`; `pnpm outdated -r --format=json` and `pnpm audit --json` require separate online collection. Never use fix or ignore-registry-errors flags.

Use a trusted private output directory with no symlink path components, owned by the current user and not writable by other users. Use its physical absolute path (for example the resolved macOS temporary directory). Dependency JSON reads and generated snapshots share bounds: 25 MiB UTF-8, depth 128, 25,000 items per container, 500,000 total value nodes, and the existing 65,536-character string limit. Oversized inputs or generated snapshots fail explicitly; they are never written as a misleading truncated success. New outputs are exclusive-created with private permissions; reruns use new names. Never write while target-controlled processes can mutate the destination.

```text
node <skill>/scripts/normalize-dependencies.cjs <private-run>/CAPTURE.json <private-run>/DEPENDENCIES.json
node <skill>/scripts/validate-dependencies.cjs <private-run>/DEPENDENCIES.json
```

## Assess, render, and continue

The normalizer does not invent upgrade priorities. Add evidence-backed `actions` and `lessons` to the snapshot after inspecting source and primary advisory documentation, then revalidate. Keep private logs and secret-bearing strings out of assessment fields. An action's `target` identifies the package to investigate/upgrade, not a shell command. Use imported observations as candidates; review advisory affected ranges and each resolved copy. Optional `outdated` observations on instances contain wanted/latest and an evidence ID. Missing entries remain unknown.

For existing patch records, [dependencies-workflow.cjs](../scripts/dependencies-workflow.cjs) exports `projectPatch`, which validates the record before retaining its source and three status dimensions. Store projections in `patches`. `handoff` validates the snapshot, checks current source and selected action, and returns a host-specific prompt command separately from structured context. Never concatenate that context into shell execution. Unknown registration gets a plain-language continuation. No script executes a repair.

[render-dependencies.cjs](../scripts/render-dependencies.cjs) produces offline HTML and Markdown from validated input. The local report includes private repository details. Render it with a new prefix:

```text
node <skill>/scripts/render-dependencies.cjs <private-run>/DEPENDENCIES.json <private-run>/DEPENDENCIES
```

Only when requested, create a sharing projection with `--share` and an optional `--label=Team`. It uses template summaries and excludes free-form assessments, source identity, paths, registry URLs, evidence payloads, and lesson text. Names are conservatively masked by default, including names that appear public. After confirming disclosure scope, `--include-name=package-name` deliberately includes an exact name. Review the generated export before sharing; generation sends nothing. Local and shared reports are distinct artifacts.

Reports distinguish proposed work from recorded verification. Compare only equivalent scopes and current identities. Do not claim a percentage improvement from unlike snapshots. Return paths, available coverage, exact gaps, and one host-correct next action. An empty or incomplete snapshot never means secure.
