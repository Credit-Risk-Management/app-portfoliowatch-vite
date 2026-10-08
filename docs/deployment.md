# Deployment

Hosting: **Firebase Hosting** (QA and production).

## Manual deploy

From repo root with Firebase CLI authenticated:

```bash
yarn deploy:qa    # hosting:qa
yarn deploy:prod  # hosting:prod
```

Scripts run `yarn build` then `firebase deploy --only hosting:…` (see [package.json](../package.json)).

## CI

[.github/workflows/firebase-deploy.yml](../.github/workflows/firebase-deploy.yml) on push to **`qa`** or **`main`**:

1. Loads env from GCP Secret Manager into `.env`
2. `yarn install --frozen-lockfile`
3. `yarn deploy:qa` or `yarn deploy:prod` by branch

Requires `FIREBASE_SERVICE_ACCOUNT` and `GCP_PROJECT_ID` (vars/secrets in GitHub).

## Build

```bash
yarn build   # output in dist/
yarn preview # local preview of dist/
```

## Related

- [environment.md](./environment.md)
- API deploy: [api-portfoliowatch-express/docs/deployment.md](../../api-portfoliowatch-express/docs/deployment.md)
