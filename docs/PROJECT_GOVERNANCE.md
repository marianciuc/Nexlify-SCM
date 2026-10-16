# Project governance and delivery setup

This repository now contains baseline automation/templates under `.github`:

- CI: `.github/workflows/ci.yml`
- Releases: `.github/workflows/release.yml`
- PR template: `.github/pull_request_template.md`
- Issue templates: `.github/ISSUE_TEMPLATE/*`

## Branch rules (GitHub settings)

Apply these branch protection settings to `main` in repository settings:

1. Require pull request before merging.
2. Require status checks to pass before merging (select `test-userservice` and `test-gateway` from CI workflow).
3. Require branches to be up to date before merging.
4. Restrict force pushes and branch deletion.

## Release flow

1. Merge changes to `main`.
2. Create and push a version tag `vX.Y.Z`.
3. The `Release` workflow builds both backend modules and publishes jar artifacts into a GitHub Release.

## Deployment baseline

Current deploy baseline is artifact publication (jars) via release workflow.
Use these artifacts in your target runtime (VM, container image build pipeline, or platform deploy job).

## Project / Wiki structure

Use this wiki map as initial structure:

- Home: architecture and module overview
- Local setup: `Configuration/compose.yml`, environment dependencies
- API usage: auth/token examples and service endpoints
- Operations: release and deployment runbook
- Contribution guide: branch rules and PR workflow
