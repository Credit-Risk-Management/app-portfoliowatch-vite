# Architecture

Portfolio Watch UI uses **React 18**, **Vite**, **Bootstrap 5 + SCSS**, and **signals** for state (via `@fyclabs/tools-fyc-react`).

## Component shape

Feature code lives under `src/components/views/<Feature>/`:

- **`<Feature>.jsx`** — imports, `useEffect` / `useEffectAsync`, JSX only
- **`_helpers/consts.js`** — signals and constants
- **`_helpers/events.js`** — click handlers, form interactions
- **`_helpers/resolvers.js`** — data fetch/update (only place that calls `src/api/*`)
- **`_helpers/helpers.js`** — pure utilities

Global shared helpers may live in `src/lib/_helpers/`.

## State rules

- **Do not use `useState`** for feature state; use signals in `_helpers/consts`.
- **UI state** (loading, modals, validation flags) belongs in signals, not inside form payload objects sent to the API.
- Access signals inline in JSX, e.g. `$borrowers.value?.list || []`.
- Prefer **`SignalTable`** for data tables instead of ad hoc table state.

## Data flow

```
User action → events.js → resolvers.js → src/api/*.api.js → Express API
                ↓
           update signals in consts.js → component re-renders
```

Components must **not** call API modules directly; only resolvers do.

## Forms

Use **`UniversalInput`** (`src/components/global/Inputs/UniversalInput/UniversalInput.jsx`) for fields—not raw `<input>` or react-bootstrap inputs.

## Auth

- Firebase auth listener initialized in [App.jsx](../src/App.jsx) via `initAuthListener`.
- [PrivateRoutes](../src/components/global/PrivateRoutes) guards authenticated pages.
- [SuperAdminRoute](../src/components/global/SuperAdminRoute/SuperAdminRoute) gates `/onboarding` (requires `user.isSuperAdmin` from API).

## Logging

Remove `console.log` / `warn` / `error` before merge; use project logging utilities when available.

## Example feature

Borrower financials tab:

- View: `src/components/views/BorrowerDetails/_components/TabContent/BorrowerFinancialsTab/`
- Resolvers/events/consts alongside under `_helpers/`

## Related

- [api-layer.md](./api-layer.md)
- [routing.md](./routing.md)
- [styling.md](./styling.md)
