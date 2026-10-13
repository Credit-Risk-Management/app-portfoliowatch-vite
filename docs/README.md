# Portfolio Watch — Frontend documentation

Internal developer documentation for **app-portfoliowatch-vite** (React + Vite). API setup: **api-portfoliowatch-express** → [docs/README.md](../../api-portfoliowatch-express/docs/README.md).

## When to read what

| If you need to… | Start here |
|-----------------|------------|
| Run the app locally | [getting-started.md](./getting-started.md) |
| Configure `.env` | [environment.md](./environment.md) |
| Signals, `_helpers`, component patterns | [architecture.md](./architecture.md) |
| Routes and major views | [routing.md](./routing.md) |
| API client and debouncing | [api-layer.md](./api-layer.md) |
| Bootstrap / SCSS | [styling.md](./styling.md) |
| Firebase hosting deploy | [deployment.md](./deployment.md) |
| FE + API together | [local-full-stack.md](./local-full-stack.md) |
| Filename-based mock financial uploads | [mock-financial-uploads.md](./mock-financial-uploads.md) |

## Quick start

```bash
yarn
cp .env.example .env   # set VITE_API_BASE_URL, etc.
yarn dev
```

Default dev server: Vite (see terminal output). API default: `http://localhost:3333`.

## All guides

- [getting-started.md](./getting-started.md)
- [environment.md](./environment.md)
- [architecture.md](./architecture.md)
- [routing.md](./routing.md)
- [api-layer.md](./api-layer.md)
- [styling.md](./styling.md)
- [deployment.md](./deployment.md)
- [local-full-stack.md](./local-full-stack.md)
- [mock-financial-uploads.md](./mock-financial-uploads.md)
