---
name: cs-setup
description: Set up Compound Security for a repository. Use for first-run onboarding, project security conventions, capability checks, or refreshing an existing setup.
---

# Compound Security: setup

Before loading the core, read [command routing](../compound-security/references/commands.md). Preserve the host-provided registered name and invocation prefix throughout this mode and all follow-up commands.

Read the sibling [Compound Security core](../compound-security/SKILL.md) and execute its `setup` mode. Resolve that path relative to this file, never relative to the target repository.

Pass through the user's goal, scope, findings, run path, restrictions, and arguments. This entry point selects `setup`; it does not override an explicit user restriction. Follow the core's mode-specific reference, prerequisites, evidence gates, and completion contract. If an argument conflicts with this mode, follow the user's explicit requested outcome and state the selected mode.

Resolve every core-relative reference or script from the directory containing the core `SKILL.md`. If the core is missing, report the incomplete installation; do not approximate the workflow.
