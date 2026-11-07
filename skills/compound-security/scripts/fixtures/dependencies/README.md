# Captured list fixtures

Captured November 6, 2026 on Node 26.12.0 from an author-controlled synthetic project in a temporary directory. The manifest declared parent 1.0.0; handcrafted npm v3 and pnpm v9 lockfiles defined parent → leaf 1.0.0. Package names and integrity data are fictional. No target/customer code or package installs were run.

- `npm-11-list.json`: actual npm 11.20.0 output from `npm ls --all --json --package-lock-only --ignore-scripts`.
- `pnpm-10-list.json`: actual pnpm 10.23.0 output from `pnpm --config.manage-package-manager-versions=false --config.ignore-pnpmfile=true list --lockfile-only --json --depth Infinity`.

pnpm 10.23.0 was fetched as development tooling outside the target project because the host had pnpm 12.14.0. This is fixture setup, not behavior of the shipped inspection workflow. An initial attempt using non-config pnpm flags failed; only the corrected successful JSON is retained. Adversarial and audit/outdated test cases are synthetic, not claimed live registry captures.

`npm-11-workspaces.json` and `pnpm-10-peer-workspaces.json` are authentic npm 11.20.0 / pnpm 10.23.0 stdout from a second trusted synthetic lockfile-only project with two named workspaces. npm captures a/parent@1/leaf@1 and b/parent@2/leaf@2 using `npm ls --all --json --package-lock-only --ignore-scripts --workspaces`. pnpm captures two parent@1 peer contexts (peer@1 and peer@2) using the same pnpm list flags above with `-r`; the cached tool was invoked with npm exec's `--offline`. No package code was installed or run. Temporary paths in this captured stdout are synthetic-project provenance, not customer paths. Tests supply repository-relative workspace identities and preserve the peer-context paths separately from ancestry.
