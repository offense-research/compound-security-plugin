---
name: cs-dependencies
description: Inspect npm/pnpm dependency evidence, explain upgrade priorities, and create private local or deliberately shareable reports. Use for dependency inventory, outdated packages, dependency paths, or an upgrade overview. Inspection does not authorize repair.
---

# Compound Security: dependencies

Before loading the core, read [command routing](../compound-security/references/commands.md). Preserve the host-provided registered name and invocation prefix throughout this mode and all follow-up commands.

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `dependencies` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's scope, findings, run path, constraints, and arguments. This entry point selects `dependencies`; it does not expand authorization or override an explicit user restriction. Follow the core's prerequisites, evidence gates, execution boundaries, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
