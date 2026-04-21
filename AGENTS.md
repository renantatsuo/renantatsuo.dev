# Agent Guidelines

## React

- Import React as a namespace in React files: `import * as React from "react"`.
- Prefer namespaced React APIs and hooks: use `React.useState`, `React.useEffect`,
  `React.useMemo`, and similar forms instead of importing hooks directly.

## UI

- Build reusable UI pieces with shadcn components installed by the shadcn CLI.
- Keep shadcn-generated primitives in `components/ui`.
- Prefer Radix-backed shadcn primitives over ad hoc buttons, inputs, labels,
  sliders, dialogs, menus, and other common controls.

## Library Code

- Keep reusable library code and domain logic in `lib`.
- Use lowercase names for short lib names, such as `campsnap` and `filesystem`.
- Use snake_case for longer multiword lib names when it improves readability.

## Development Workflow

- Use TDD when viable: add or adjust a focused failing test before changing
  domain logic.
- Work in small tasks and commit each completed task with a conventional commit.
- Before committing or claiming work is done, run:

```bash
bun run type-check
bun run test
```
