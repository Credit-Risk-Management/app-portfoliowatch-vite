# Local full stack

Run **api-portfoliowatch-express** and **app-portfoliowatch-vite** together for end-to-end development.

## 1. Start the API

In the API repo:

```bash
yarn
cp .env.example .env
yarn dev
```

Confirm **http://localhost:3333** responds (health route). Details: [api-portfoliowatch-express/docs/getting-started.md](../../api-portfoliowatch-express/docs/getting-started.md).

## 2. Configure the frontend

In this repo `.env`:

```env
VITE_API_BASE_URL=http://localhost:3333
VITE_APP_ENV=development
```

Optional: `VITE_DEV_IS_BREAKPOINT_VISABLE=true` for layout debugging.

## 3. Start the frontend

```bash
yarn dev
```

Open the URL Vite prints (typically **http://localhost:5173**).

## 4. Sign in

Use Firebase auth (project configured in [src/config/config.js](../src/config/config.js)). The API validates the Bearer token and resolves organization context.

## Troubleshooting

| Symptom | Likely fix |
|---------|------------|
| Network error / CORS | Add your dev origin host to API `CORS_ALLOWED_FROM` — [environment.md](../../api-portfoliowatch-express/docs/environment.md) |
| 401 on API calls | Sign in again; check Firebase project matches API |
| Empty data | Seed or migrate DB — API [getting-started.md](../../api-portfoliowatch-express/docs/getting-started.md) |
| Onboarding menu missing | User must be super-admin (`SUPER_ADMIN_EMAILS` on API); see [borrower-onboarding-gui.md](../../api-portfoliowatch-express/docs/borrower-onboarding-gui.md) |

## Public upload flows

Token URLs (`/upload-financials/:token`, etc.) use [publicClient.js](../src/api/publicClient.js) with the same `VITE_API_BASE_URL`.
