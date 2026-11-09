# Reusable verification: public-repository pilot

Status: local technical rehearsals executed on 2026-11-07. Setup, dependency reports, clean reinstall control, three historical Express upgrades, seeded negative control and restored checks completed. Full compatibility remains failed on pre-existing upstream tests; independent review and formal verification remain blocked. [Execution report and evidence](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/REPORT.md). No savings, customer approval, deployment or commercial result is claimed.

## Question and boundaries

Can application-specific acceptance checks and setup be reused across three dependency upgrades without weakening checks or hiding maintenance effort? This is the technical portion of B04 in the Offense selected thesis. An open-source replay cannot establish payment, renewal, customer review time, or superiority to a configured incumbent.

Target: https://github.com/gothinkster/node-express-realworld-example-app
Pinned commit: `30b68e1e881462b2f4164ea09ab4c4f5699c7b0b`.
Local disposable source: `/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/source`.
The GitHub API reports last push May 1, 2024; the manifest declares MIT but GitHub reports no detected license. Resolve licensing before redistribution. Do not send upstream PRs or publish a fork during this experiment.

Observed stack: Express ~4.18.1, body-parser ^1.20.2, Prisma ^4.16.1, PostgreSQL, TypeScript, Nx 17.2.6. These are manifest ranges, not an inventory of resolved versions or verified vulnerabilities. The source provides authentication, profiles, articles, comments and tags, plus service unit tests.

A useful pre-existing discrepancy: `e2e/src/server/server.spec.ts` expects `{message: 'Hello API'}`, while `src/main.ts` returns `{status: 'API is running on /api'}`. This is source evidence of a likely stale test, not an observed failing run. Keep it visible as benchmark U10; do not silently repair it and describe the baseline as clean.

## Freeze before running

1. Validate runner isolation, then capture a clean baseline using the pinned lockfile and upstream test suite. Keep every failure and setup intervention.
2. Establish an acceptance contract before inspecting candidate results: register/login, valid and invalid authentication, article create/read/edit/delete, cross-user modification denial, comments, favorites, and malformed input. Record expected behavior and distinguish existing defects from upgrade regressions. Database state must reset per case.
3. Select one routine control and three comparable upgrades using resolved dependency inventory, verified primary release/advisory evidence, and runtime requirements. Record all candidates considered and exclusion reasons before execution. Express/body-parser are plausible related candidates; do not force three "comparable" tasks if the available changes are materially different. A major Prisma migration belongs in a separate difficult-change cohort.
4. Freeze candidate versions, order, expected outcomes, assertion hashes and budgets. Budget each upgrade at 45 minutes with at most two candidate revisions after the initial attempt. Count timeouts and failed candidates in the denominator. Setup has a separate 90-minute budget. Stop at a named blocker rather than retrying indefinitely.

## Execute the full technical loop

- Run the new plugin setup in the disposable target; verify rerun leaves the managed section unchanged, check-only writes nothing, and unrelated instructions survive. Record that this tests the locally edited v0.5.0 implementation, not the installed marketplace version.
- Inspect dependency evidence, produce the local report, choose the frozen action and carry source/workspace identity through patch intake.
- Baseline: upstream tests plus the frozen application acceptance checks against a disposable PostgreSQL database. Preserve pre-existing failures.
- Upgrade 1: create the patch, run checks, record setup and new checks, produce a review packet and retain only justified reusable lessons.
- Upgrades 2 and 3: reuse the same runner recipe and acceptance checks, record unchanged/revised/new checks, and charge all maintenance to that upgrade. Capture the exact starting revision for each sequential upgrade.
- Add a deliberately broken candidate as a negative control, such as removing an ownership guard in a disposable copy. The frozen suite must reject it. Never count this seeded failure as an upstream vulnerability or successful remediation.
- Rebuild and verify each candidate from a clean disposable copy; warmed caches alone are not verification. A second qualified operator/reviewer should evaluate the packet without undocumented assistance. Until that happens, independent review and operator-transfer results remain unverified.
- Produce local diffs and review packets. Prepared, verified locally, human accepted, merged, and deployed are distinct states. No production deployment is part of this public-repo pilot.

## Evidence and measurements

For every attempt save: base/candidate SHA and dirty-tree digest, exact versions and dependency paths, commands/exit codes, runner image/configuration, timestamped baseline/candidate logs, acceptance-suite hash, changed assertions, failures, interventions, artifact hashes, and unresolved limitations. Retain evidence outside the target workspace under parent control.

Separate one-time harness construction, per-upgrade discovery, check maintenance, execution, review, and waiting. Record actual agent elapsed time separately from active human minutes. Unavailable token/cost telemetry is unknown, not zero. Retrospective guesses cannot support a savings percentage.

The first result is three case narratives and exact reuse evidence, not a causal productivity claim. Compare matched upgrades with a fresh-context/no-reuse arm before attributing savings to reusable verification. Use the same frozen scope, runtime, tool access and budget; account for order and task difficulty. A configured Renovate/Dependabot plus existing-CI arm is needed before claiming incremental value over bots. Neither comparator has run.

## Execution record (2026-11-07)

Used the local v0.5.0 plugin. The original disposable source contains local setup and three manifest/lockfile commits only. A second disposable clone under the experiment's `hardened/source` retains the controlled rerun lineage. No upstream publication or deployment occurred.

Frozen historical sequence: Express 4.18.2 → 4.19.2 → 4.20.0 → 4.21.2, selected from maintainer release/advisory evidence before candidate results. These are historical replay versions, not a recommendation of current secure releases; major Prisma/Express migrations were excluded. Exact versions, source identities, commands/exits and limitations are in the report and per-round packets.

The same 10 API cases passed the baseline/control and all three upgrades; build and type checks passed. Four upstream unit failures and U10's stale root-response expectation remained unchanged. The seeded ownership-guard removal failed U04 (200 versus expected 403); restoring the guard returned all 10 API cases to passing. Independent review remains unverified; no patch is marked local_verified, closed or compounded.

A scratch-only control gap was found after preliminary runs: Docker's default shared-memory path was writable. Those attempts remain provisional and retained. Baseline/control, all three upgrades, seeded control and clean restoration were repeated with /dev/shm and /dev/mqueue read-only, no external network, allowlisted target environment, read-only toolchain, bounded disposable scratch/resources/time and separate parent evidence. Trusted acquisition disabled package lifecycle scripts and separately fetched checksum-checked Prisma engines; target execution remained offline. Runtime-support review sequencing and incomplete timing attribution are disclosed in the report.

Dedicated containers and newly acquired full Node/Postgres image tags were cleaned up. No dedicated volumes/networks were created; the bot and its VM/resources were not modified. Licensing remains unresolved; no redistribution.

- [Report](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/REPORT.md)
- [Frozen plan](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/FROZEN-PLAN.json)
- [Measurements](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/MEASUREMENTS.json)
- Authoritative packets/evidence: `/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/hardened/`.

## Interpretation

Reusable checks surviving real upgrades support technical feasibility. Lower measured comparable delivery effort strengthens B04 only after maintenance and review are included. A stale suite that passes invalid behavior falsifies the verification claim. Flat or rising costs are informative, not grounds to omit cases. A successful public-repo pilot still requires paid customer repetitions to test willingness to pay and recurring value.

## Harder comparison outcome

Both Express 5 attempts froze incomplete before candidate implementation because Prisma engine acquisition was unavailable through the participant workflow. No reuse effect can be evaluated. Full retained result: /Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/followup/independent-review/comparison/COMPARISON-RESULT.md. A future pair requires preflighted equal native-binary acquisition, versioned preregistration and fresh contexts.

## Frozen v2 independent review (2026-11-08)

Both candidates passed the same14 heldout API cases, build/types and their acceptance checks. Guard-only ownership mutations failed for HTTP200 versus403; exact restoration passed. The four auth unit failures and stale root e2e remain, so full compatibility and closure are still failed. Source/schema/upstream tests were preserved; only dependency pins/lock and erased route type arguments changed.

Reported elapsed258.30s/274.254s excludes finalization to parent END (292.85s/320.55s). Common setup194.60s, prior acquisition-blocked pair, evaluator work and reviewer corrections remain separately accounted. Missing authoring/active-time/cost telemetry, one ordered pair and instruction-only host blindness prevent causal savings or customer acceptance claims. The frozen no-reuse recipe starts a fresh build entry; an additional common source-mode check also passed. No deployment proof is claimed.

[Definitive v2 outcome](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/followup/independent-review/comparison-v2/COMPARISON-RESULT.md), [structured results](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/followup/independent-review/comparison-v2/RESULTS.json), [independent evidence](/Users/i313/.compound-security/experiments/reusable-verification-2026-11-07/followup/independent-review/comparison-v2/parent-evaluation). Prior failed comparison above is retained. Dedicated resources/watchdogs were cleaned; only the two unused pinned full image references were removed, preserving bot/slim images and VM. No revisions, publication, pushes or deployment.
