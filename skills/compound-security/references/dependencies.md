# Dependency inspection

Inspect npm/pnpm dependencies without changing target source. This mode creates a private evidence snapshot and local reports; it does not authorize repair, upload, or deployment. Read [execution.md](execution.md), [knowledge.md](knowledge.md), and [commands.md](commands.md) first.

## Shared record

`DEPENDENCIES.json` schema version 1 is the agent and report source. Start from [the synthetic example](../assets/dependencies.example.json), never presenting its contents as observed evidence. Validate using [validate-dependencies.cjs](../scripts/validate-dependencies.cjs).

Record source identity including commit, dirty-source digests, manifests and lockfile digests. Each evidence entry has an ID, kind, capture timestamp, status (`ok` or `error`), binding (`current`, `historical`, or `unbound`), and source identity. Current inventory uses only current successful evidence. Coverage is independent for declarations, resolutions, outdated data, advisories, and usage: each names scope, evidence, and gaps. Complete means complete within that stated dimension and scope, never secure.

Instances have stable IDs, workspace, location, name, version or declared range, provenance (`declared`, `lockfile`, `installed`), and evidence IDs. Edges reference instances. Advisory IDs are distinct from affected instances. Actions reference instances, advisories, evidence, and earlier prerequisites, with an order, target, title, rationale, and uncertainty. Counts never add overlapping candidate benefits.

## Assessment

Recall applicable lessons before recommending actions. Trace actual usage with file references. Explain dependency ancestry separately from usage and historical intent; label inference and unknowns. Rank using demonstrated exposure/prerequisites, known business importance, urgency, remediation leverage, and compatibility uncertainty. Never invent a numeric security score, treat a scanner match as a confirmed exploit, or infer safety from missing imports.

Produce a concise next action or exact evidence gap. Read-only inspection ends at the report. An explicitly selected repair proceeds through the existing patch workflow after checking current source identity. A report cannot grant permission. Preserve applied/stale/not_applicable lesson labels and separate patch security, compatibility, and deployment results; stale verification remains historical.
