# Getting started

## Prerequisites

- **Node.js 22** (`engines` in `package.json`)
- **Yarn**
- Running **Portfolio Watch API** for full functionality (see [local-full-stack.md](./local-full-stack.md))

## Install and run

```bash
yarn
cp .env.example .env
yarn dev
```

Aliases: `yarn start` runs the same Vite dev server.

## Project layout (high level)

| Path | Purpose |
|------|---------|
| `src/components/views/` | Page-level features (Borrowers, Loans, Dashboard, …) |
| `src/components/global/` | Shared UI (AppWrapper, inputs, routes guards) |
| `src/api/` | Axios API modules (debounced reads) |
| `src/lib/_helpers/` or view `_helpers/` | Signals, events, resolvers per feature |
| `src/scss/` | Global styles, `_vars.scss` design tokens |
| `src/utils/` | Firebase, auth, shared utilities |

## Scripts

| Command | Purpose |
|---------|---------|
| `yarn dev` / `yarn start` | Vite dev server |
| `yarn build` | Production bundle to `dist/` |
| `yarn preview` | Preview production build |
| `yarn lint` | ESLint (Airbnb React) |
| `yarn deploy:qa` / `yarn deploy:prod` | Build + Firebase hosting (see [deployment.md](./deployment.md)) |

## Related

- [environment.md](./environment.md)
- [architecture.md](./architecture.md)
