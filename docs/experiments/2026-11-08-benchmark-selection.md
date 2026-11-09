# Benchmark selection: Compound Security versus a plain coding agent

Decision: use an explicitly labeled npm subset of VulnBump for the first external benchmark. This is a proposed protocol, not an executed score or a claim of superiority. Research checked November 8, 2026. Benchmark repository head observed: 043a0dc7d6adaeda4e01b91a4b0e121922d461af.

## Why this benchmark

[VulnBump](https://github.com/snyk-labs/snyk-vulnbump) supplies pinned vulnerable projects, dependency-upgrade tasks, and independent install/rescan/build/test gates. Its published dataset contains 307 tasks across 43 repositories, including 11 npm repositories. The public harness includes mechanical package upgrades and plain Claude Code with scanner findings. This matches the plugin's dependency repair workflow much better than the previous single-application replay.

Task discovery and verification depend on Snyk. The scanner database changes over time. Snapshot the task list, targets, advisory IDs and baseline evidence for both conditions together; do not compare our subset directly to old full-dataset leaderboard scores. Snyk authored the benchmark and its scanner judges remediation. Passing means targeted advisory resolution and preserved tested functionality, not demonstrated absence of vulnerabilities. [Methodology](https://github.com/snyk-labs/snyk-vulnbump/blob/main/docs/methodology.md).

## Primary experiment

A: plain coding agent with the same actionable findings, target versions, source access and generic runner.
B: exact same agent/model/low-reasoning setting plus a pinned Compound Security plugin.
Optional mechanical baseline: benchmark package-manager bump. This tests whether a difficult case needs an agent at all; it does not stand in for an independently configured Dependabot or Renovate deployment.

Freeze plugin source, prompts, evaluator, budgets, tools and equal scanner access. Plain agent receives a competent task prompt, not an intentionally weak instruction. All plugin subagent/reviewer calls count against its total budget. Use independently enforced clean contexts; exclude historical reports, upstream fixes, future git history and benchmark answers from both agents. Review benchmark leakage/network controls before reuse; its documented hosts-file block is not the plugin's offline execution boundary. Separate acquisition/scanning/model traffic from target execution and record adapter deviations.

Primary metric: proportion of attempts passing every independent benchmark gate. Secondary: false-ready claims, introduced advisory regressions (additional metric, not native score), invalid test edits, observed tokens/cost per successful task, total elapsed and intervention burden. Preserve original benchmark scoring, and separately report all attempted operational failures so exclusions cannot manufacture improvement. Compare paired outcomes with uncertainty clustered by repository; don't treat many tasks in one repo as independent customers.

## Economical sequence

1. Preflight without agent calls: inspect harness, determine Snyk/model access and resource requirements, reproduce untouched baselines, and select eligible npm tasks using a published rule. Record every excluded/broken baseline.
2. Engineering smoke: six tasks across at least three repositories, two agent conditions, one attempt each. Keep easy and migration cases. This only checks harness feasibility; it is not the superiority test.
3. Freeze changes learned from smoke. Select a disjoint held-out set, ideally 20–30 tasks if eligible tasks permit, with three repetitions per condition. Randomize order and keep budgets identical. Freeze a total spending ceiling before launch. Report wins, losses, ties, uncertainty and all failures, even if there is no advantage.
4. Publish only the narrow supported claim: on the pinned npm subset, plugin versus specified plain agent under the stated budgets and independent gates. Never generalize it to all security work or all competing products.

Don't select tasks merely because an earlier run showed the plugin wins. If exploring the mechanical-failure subgroup, define it from the mechanical baseline before inspecting either agent and report it alongside the entire selected set.

## Reuse is a separate hypothesis

VulnBump resets repositories per task; its ordinary score does not establish compounding. A separately labeled extension can allow sanitized knowledge from earlier tasks while hiding future repairs/evaluator material. Compare plugin with memory versus plugin without memory, holding all other instructions equal. Keep this out of the standard leaderboard score. The previous experiment established transferable checks but not a delivery-cost advantage.

## Alternatives and practical limits

[SEC-bench](https://github.com/SEC-bench/SEC-bench) covers vulnerability patching and PoC generation with containerized cases. Consider it later for broader audit/fix claims; it has a substantial environment footprint and is less directly aligned to npm dependency repair. [Vul4J](https://github.com/tuhh-softsec/Vul4J) pairs Java vulnerabilities with PoV tests and human patches; useful for a Java-focused future track, outside our current npm/pnpm emphasis.

The [VulnBump running guide](https://github.com/snyk-labs/snyk-vulnbump/blob/main/docs/running.md) specifies Linux x86-64, Snyk token, API-backed Claude access and up to 24 GB per container. Our earlier ARM64/4 GB VM is not a verified equivalent. No benchmark target code, API-backed runs, scans or purchases were started for this selection. A Codex/low-budget adaptation must be labeled and rerun both conditions, not compared as though it reproduces the published Claude leaderboard.

## November 8 preflight execution

The authorized no-agent preflight is recorded privately in [PREFLIGHT.md](/Users/i313/.compound-security/experiments/vulnbump-2026-11-08/PREFLIGHT.md), with [machine-readable evidence](/Users/i313/.compound-security/experiments/vulnbump-2026-11-08/preflight.json) and the [prospective six-task manifest](/Users/i313/.compound-security/experiments/vulnbump-2026-11-08/task-manifest.json). All 11 pinned npm cases were prepared and attempted under bounded offline ARM64 controls; harness unit tests passed (154 passed, 1 skipped). Paired smoke remains **blocked** on authenticated Snyk task discovery, a clean plugin-disabled agent environment and enforceable model cost limits. Six task targets are not invented from historical reports. No benchmark model calls, candidate repairs, paid infrastructure or scores were produced. This supersedes the selection-stage statement above that target execution had not started; it does not reproduce the published x86-64/24 GB configuration.
