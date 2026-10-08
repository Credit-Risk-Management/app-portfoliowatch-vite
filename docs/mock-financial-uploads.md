# Mock financial uploads

Filename-based mock data for financial document uploads (no `VITE_USE_STATIC_MOCKS` flag).

## Behavior

1. User uploads a file (e.g. `Q1_Balance_Sheet.pdf`)
2. App matches the filename to predefined mock data
3. The form auto-populates; user can edit before submit
4. Unmatched names fall back to generated realistic values by document type

## Recognized filenames

### Q1 2025 (March 31, 2025)

- `Q1_Balance_Sheet.pdf`
- `Q1_Income_Statement.pdf`

### Q2 2025 (June 30, 2025)

- `Q2_Balance_Sheet.pdf`
- `Q2_Income_Statement.pdf`

### Q3 2025 (September 30, 2025)

- `Q3_Balance_Sheet.pdf`
- `Q3_Income_Statement.pdf`

Matching is flexible: spaces, underscores, and extensions (`.pdf`, `.xlsx`, etc.).

## Updating mock values

Edit `MOCK_DATA_BY_FILENAME` in:

`src/components/views/Borrowers/_helpers/financials.helpers.js`

## Testing

1. Borrowers → select borrower → Financials → Submit Financial Data
2. Upload from [SampleDocs/](../SampleDocs/) if available
3. Console may log: `Using mock data for: Q1_Balance_Sheet`

## Related

- [getting-started.md](./getting-started.md)
