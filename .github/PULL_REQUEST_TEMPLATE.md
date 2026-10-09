## Description

<!-- What does this PR change and why? Link the issue it resolves. -->

Closes #(issue)

## Type of Change

- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Refactoring (no functional changes)
- [ ] Documentation / CI / tooling

## Changes Made

<!-- List the specific changes made in this PR -->

-

## Testing

<!-- How did you verify this change? Attach evidence (screenshots, logs) for UI changes. -->

- [ ] Frontend: `pnpm typecheck` passes
- [ ] Frontend: relevant `pnpm test` / `pnpm test:e2e` tests pass
- [ ] Backend: affected service(s) pass `./gradlew test`
- [ ] New UI strings added to **all** locales (`pnpm validate:locale`)
- [ ] API types regenerated (`pnpm generate:types` / `generate:paths`) if the contract changed
- [ ] k8s / compose manifests updated if deployment config changed

## Additional Context

<!-- Screenshots, migration notes, breaking changes, or pointers for the reviewer -->
