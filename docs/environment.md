# Environment variables

Vite exposes only variables prefixed with **`VITE_`**. Copy [`.env.example`](../.env.example) to `.env`. Do not commit secrets.

## Required for local full stack

| Variable | Purpose | Default / notes |
|----------|---------|-----------------|
| `VITE_API_BASE_URL` | Express API base URL | Falls back to `http://localhost:3333` in [client.js](../src/api/client.js) and [publicClient.js](../src/api/publicClient.js) |

## App environment

| Variable | Purpose |
|----------|---------|
| `VITE_APP_ENV` | Config profile key in [config.js](../src/config/config.js) (default `production`; `development` object used when set) |
| `VITE_APP_BASE_URL` | Legacy GraphQL endpoint field in config (`BACKEND_GRAPHQL_ENDPOINT`) |

## Firebase

Firebase web config is largely defined in [config.js](../src/config/config.js) (`VITE_APP_FIREBASE_CONFIG`). Optional override:

| Variable | Purpose |
|----------|---------|
| `VITE_FIREBASE_MEASUREMENT_ID` | Analytics measurement ID |

Auth uses [firebase.js](../src/utils/firebase.js) with `VITE_APP_FIREBASE_PUB_KEY` for storage key naming when present in config.

## Public upload templates (optional)

Override default template URLs when not served from the app:

| Variable | Used in |
|----------|---------|
| `VITE_DEBT_SCHEDULE_TEMPLATE_URL` | Public borrower financial upload |
| `VITE_PFS_TEMPLATE_URL` | Public guarantor PFS |
| `VITE_PFS_TEMPLATE_XLSX_URL` | PFS worksheet modal (XLSX) |

## Developer UX

| Variable | Purpose |
|----------|---------|
| `VITE_DEV_IS_BREAKPOINT_VISABLE` | When `'true'`, shows breakpoint debug overlay in [AppWrapper](../src/components/global/AppWrapper/AppWrapper.jsx) |

## QA / production

CI loads env from GCP Secret Manager into `.env` before deploy (see [deployment.md](./deployment.md)). Match keys expected by the build for each hosting target.

## Related

- [local-full-stack.md](./local-full-stack.md)
- API env: [api-portfoliowatch-express/docs/environment.md](../../api-portfoliowatch-express/docs/environment.md)
