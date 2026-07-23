# GitHub Release Readiness Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the repository ready for public GitHub hosting and npm package release.

**Architecture:** Add GitHub automation and contribution metadata at the repository root. Keep the workspace private while the `rx4u` build script generates the metadata required by the publishable `dist` package.

**Tech Stack:** pnpm 10, Node.js 20, GitHub Actions, Vite, Vitest, TypeScript.

---

### Task 1: Add public-repository governance files

**Files:**

- Create: `.github/workflows/ci.yml`
- Create: `.github/dependabot.yml`
- Create: `.github/ISSUE_TEMPLATE/bug_report.yml`
- Create: `.github/ISSUE_TEMPLATE/feature_request.yml`
- Create: `.github/pull_request_template.md`
- Create: `CONTRIBUTING.md`
- Create: `SECURITY.md`
- Create: `CHANGELOG.md`

**Step 1:** Define CI checks that mirror the local release verification commands.

**Step 2:** Add issue, pull request, dependency update, security, contribution, and change documentation.

**Step 3:** Review the generated files for accurate commands and paths.

### Task 2: Make package publication explicit

**Files:**

- Modify: `package.json`
- Modify: `packages/rx4u/package.json`
- Modify: `packages/rx4u/scripts/build.js`
- Modify: `packages/examples/package.json`
- Modify: `packages/website/package.json`

**Step 1:** Mark non-publishable workspace packages as private and add workspace-wide type checks.

**Step 2:** Add the publishable package's engines, author, file list, and generated metadata.

**Step 3:** Build and inspect the generated package manifest with `npm pack --dry-run`.

### Task 3: Correct release documentation

**Files:**

- Modify: `README.md`
- Modify: `packages/rx4u/README.md`
- Modify: `packages/website/README.md`
- Delete: `fix-test-observables.js`

**Step 1:** Remove unverified implementation, performance, and compliance claims.

**Step 2:** Correct broken local links and describe the active test coverage accurately.

**Step 3:** Remove the obsolete migration script and verify no references remain.
