# Contributing to rx4u

Thanks for contributing. Please discuss substantial API or behavioral changes in an issue before starting implementation.

## Development Setup

Use Node.js 20.19 or later and pnpm 10.6.2.

```bash
pnpm install
```

Useful commands:

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm --filter rx4u pack:check
```

To run the documentation website locally:

```bash
pnpm --filter @rx4u/website dev
```

## Code and Tests

- Keep changes focused and preserve the existing functional API style.
- Add or update tests for changed runtime behavior in `packages/rx4u`.
- Keep documentation and examples aligned with public APIs.
- Follow [the frontend code style](docs/code-style.md) for website changes.

## Pull Requests

- Use a descriptive title and explain the motivation in the PR description.
- Run the verification commands above before opening a PR.
- Document breaking changes and required migration steps.
- Do not include unrelated formatting or generated-file changes.

## Reporting Issues

Use the GitHub issue templates for bugs and feature requests. For security vulnerabilities, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.
