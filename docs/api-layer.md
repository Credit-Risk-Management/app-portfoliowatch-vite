# API layer

HTTP access to **api-portfoliowatch-express** lives in `src/api/`.

## Clients

| Module | Use |
|--------|-----|
| [client.js](../src/api/client.js) | Authenticated requests — attaches Firebase ID token |
| [publicClient.js](../src/api/publicClient.js) | Public upload / token routes (no auth header) |

Base URL: `VITE_API_BASE_URL` or `http://localhost:3333`.

Responses: axios interceptor returns `response.data` on success; 401 may redirect to login.

## Module pattern

Each entity has a `*.api.js` file exporting methods (`getAll`, `getById`, `create`, …). Read-heavy methods are wrapped with **`wrapApiWithDebounce`** from `@src/utils/debouncedApi`.

### Debouncing rules

- **Debounce:** `getAll` with filters, `getById`, similar GET-style reads (typical delay 300–350ms).
- **Never debounce:** `create`, `update`, `delete`, or any mutating call.

Components call API methods from **resolvers** only; update signals immediately, then await debounced reads.

### Example

```javascript
export const borrowersApi = wrapApiWithDebounce(borrowersApiBase, {
  getAll: 350,
  getById: 300,
});
```

## Full debouncing guide

Extended examples, migration notes, and testing tips: **[src/api/README.md](../src/api/README.md)**.

## Related

- [architecture.md](./architecture.md)
- [local-full-stack.md](./local-full-stack.md)
