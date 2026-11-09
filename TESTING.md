# Version checks and human-fix mode

Package validation and `git diff --check` pass for these instruction changes. The checkpoint example remains parseable JSON; closure schema and validators are unchanged. Fresh-agent behavioral execution has not been performed.

Behavioral acceptance cases for a future exercise:

- A test log from a different source revision cannot support current closure; preserve the historical record and require revalidation.
- A locally verified patch with unknown or mismatched deployed build remains locally verified only; deployment resolution stays unproven. Read-only status reports the mismatch without changing artifacts.
- A source change during review invalidates affected evidence before the verdict is recorded.
- Human-fix mode produces a private handoff without target edits, remains partial while awaiting a patch, and survives checkpoint resume. A handoff-only request can complete without claiming resolution.
- A human patch resumes independent verification; failed checks update the handoff without agent repairs. Existing retry/agent budgets and target-read-only restrictions persist.

# Project setup — v0.5.0

Added `cs-setup` and core `setup` routing. Package validation checks the thirteenth wrapper and required setup reference. Disposable-copy negative checks reject a missing wrapper, missing reference, and an unqualified setup command. All 172 existing Node tests pass unchanged.

Setup is an instruction workflow, not an executable installer. Check-only behavior, preservation of existing AGENTS.md content, idempotent updates, malformed-marker handling, symlink refusal, and host-correct handoffs are specified in the setup reference. They have not yet been verified in fresh-agent behavioral exercises or native host discovery; structural validation does not prove those behaviors.

# Dependency visibility validation — v0.4.0

## Continuous integration

`.github/workflows/validate.yml` runs package validation and all bundled Node test suites on pull requests, pushes to `main`, and manual dispatch. The matrix checks the documented Node 18 minimum and Node 24, with Python 3.9. Actions are pinned to commit IDs, the job has read-only repository permissions, and checkout does not persist credentials. No target application, registry acquisition, or deployment is exercised. Native host discovery and controlled-runner repair remain separate verification gaps.

## Release validation

Validated November 7, 2026 with Node.js v26.12.0 and Python 3.

- `python3 scripts/validate_plugin.py` checks two hosts, two marketplaces, twelve wrappers, and bundled resources.
- `node --test skills/compound-security/references/audit/*.test.cjs skills/compound-security/scripts/*.test.cjs` passes 172 tests, including unchanged audit/closure/patch coverage and the new dependency contract, normalization, rendering, handoff, and private IO suites.
- npm 11.20.0 and pnpm 10.23.0 list fixtures are authentic outputs from synthetic lockfile projects, including two npm workspaces and pnpm peer-context copies. Audit/outdated fixtures are synthetic shape tests, not live registry captures.
- A fresh agent generated private reports for an npm direct recommendation, pnpm transitive-parent recommendation, and offline partial inventory. It checked host-qualified handoffs, rejected stale source, preserved applied/stale/not-applicable lessons, and treated malicious metadata as data. It made no target changes or network requests.
- An offline headless Brave check rendered 1,000 synthetic instances at 1280px and 375px without horizontal overflow, opened an instance using Tab/Enter, and observed no external page requests. Screenshots were inspected at the narrow width.
- Disposable package copies rejected a missing dependency wrapper, reference, or normalizer and an unqualified follow-up command.
- The IO tests reject overwrite, symlink, Git-internal and shared-writable destinations; a process/network spy guards normalization. URL credentials in retained observations are scrubbed. Sharing tests verify default package masking and exclusion of arbitrary assessment prose.

Review fixes cover mixed-success captures, workspace-specific outdated mapping, composite source freshness, private advisory details, scope-qualified sharing, mixed-case Git paths, and a CLI round trip above 1,000 instances. Raw acquisition commands are omitted.

Human usability, native host installation/discovery, and an end-to-end repair in a controlled runner remain unverified. The synthetic agent exercise does not establish that a person can identify the next action or that a real dependency upgrade works. No live target, deployment, or hosted scanner was used. Names are always masked by default in sharing exports; explicit exact-name inclusion is the supported disclosure mechanism.

## Previous validation record — v0.2.1

Validated November 5, 2026.

- A fresh plugin exercise followed help into brainstorm. The help response used the full Codex plugin name, and both the saved brief and final response contained the same qualified audit command. The README-only fixture correctly remained needs_input pending implementation source.
- A separate fresh standalone exercise recommended the standalone core command and created no artifacts.
- The package validator passed. Negative checks rejected bare follow-up commands in a mode reference and the full manual, and rejected a wrapper missing the shared command-routing reference.
- Host manifests and marketplace metadata use 0.2.1 to distinguish this revision from cached 0.2.0 installations.

These exercises cover agent-authored handoffs. Native Codex CLI installation and cache refresh on the user's machine still need user-side confirmation. The validator scans authored examples and routing references; live generated text also requires the outgoing-command check in the skill instructions.

## Previous validation — v0.2.0

Validated November 4, 2026, with Node.js v24.22.1 and the available Python 3 runtime.

- 65 unchanged upstream Cloudflare validator tests passed.
- 33 new closure-validator tests passed, including unsafe file inputs, Unicode/diagnostic handling, revision freshness, self-review rejection, and required regression/compatibility/prevention records.
- Plugin structure checks passed for two host manifests, two local marketplaces, the core, ten entry points, runtime resources, local Markdown references, and upstream notices.
- Four disposable incomplete packages were correctly rejected after removing each new entry point or the LFG reference. All JSON manifests, schemas, and examples parse.
- The canonical standalone skill passed its frontmatter/name validation.

A fresh agent used the skill for a focused read-only review of a synthetic document service. It identified a tenant-boundary candidate, rejected stale knowledge and embedded malicious instructions, used independent source review, and left runtime exploitability as needs_validation because no controlled runner/database was available. No target code was executed and no product changes were made in that exercise.

Fresh-agent checks of the new entry modes:

- Help used the standalone core invocation correctly, recommended a concrete starting task, and created no audit artifacts or product edits.
- Brainstorm produced a private brief with a useful customer-data scope, explicit success criteria, alternatives, and a standalone handoff. It marked missing implementation source as `needs_input` and did not start an audit or change the target.
- LFG reconciled an inaccurate completed checkpoint with missing evidence, rejected its embedded instruction to claim completion, and retained a source-based candidate as unvalidated under an exhausted delegation budget and unavailable runtime. It respected report-only scope and did not execute target code.

These are behavioral exercises on synthetic inputs, not evidence of end-to-end remediation on a live target.

Independent package review of the prior version led to hardened closure input handling and full lesson-destination containment instructions. The bundled validators test recorded assertions; they do not authenticate agents, prove evidence, enforce an OS sandbox, or prove absence of vulnerabilities.

Claude Code and Codex CLIs were unavailable in this authoring environment. Their native loading/install flows have not been smoke-tested. Manifests follow the inspected upstream layout; verify loading in the intended host before team rollout. No production target, scanner backend, remote API, deployment, or live exploit test was used.

## Patch lifecycle (v0.3.0)

Run `node --test skills/compound-security/scripts/validate-patch.test.cjs` and validate the synthetic shape with `node skills/compound-security/scripts/validate-patch.cjs skills/compound-security/assets/patch-state.example.json`.

The patch suite rejects stale revisions, self-review, missing evidence, compatibility failures, production closure based only on local/staging results, incomplete inventory/health observations, and inconsistent rollback. Assertions in a record remain claims; validators do not execute tests, authenticate reviewers, or inspect production.

Behavioral exercises should include a direct update, a transitive parent upgrade, and a security-resolving candidate that breaks legitimate behavior. Verify help/brainstorm route dependency work to patch, plan-only remains read-only, LFG resumes within budget, and continuation commands retain the host namespace. Real npm/pnpm rehearsal requires the controlled runner; no native host or production integration is supplied here.
