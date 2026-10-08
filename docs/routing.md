# Routing

Defined in [src/App.jsx](../src/App.jsx). All routes render inside `AppWrapper` unless noted.

## Public routes (`PublicRoutes`)

No login required:

| Path | View |
|------|------|
| `/upload-financials/:token` | Public borrower financial upload |
| `/upload-guarantor-financials/:token` | Public guarantor financial upload |
| `/impact-questionnaire/:token` | Public impact questionnaire |
| `/login` | Login |
| `/accept-invitation` | Accept org invitation |

## Authenticated routes (`PrivateRoutes`)

Require Firebase session:

| Path | View |
|------|------|
| `/dashboard` | Dashboard ( `/` redirects here ) |
| `/home` | Home |
| `/loans`, `/loans/:loanId` | Loans list and detail |
| `/borrowers`, `/borrowers/:borrowerId` | Borrowers list and detail |
| `/guarantors/:guarantorId` | Guarantor detail |
| `/reports` | Reports |
| `/relationship-managers`, `/relationship-managers/:managerId` | Relationship managers |
| `/notifications` | Notifications |
| `/profile` | User profile |
| `/settings` | Settings |
| `/organization-settings` | Organization settings |
| `/users-settings` | Users settings |

## Super-admin (`SuperAdminRoute` nested in private)

| Path | View |
|------|------|
| `/onboarding` | Bank onboarding list |
| `/onboarding/:runId` | Onboarding run detail |

Backend and operator docs: [api-portfoliowatch-express/docs/borrower-onboarding-gui.md](../../api-portfoliowatch-express/docs/borrower-onboarding-gui.md).

## Fallback

| Path | View |
|------|------|
| `*` | NotFound |

## API modules by area

Rough mapping (see `src/api/`):

- Borrowers / financials — `borrowers.api.js`, `borrowerFinancials.api.js`, upload link APIs
- Loans — `loans.api.js`, `debtServiceHistory.api.js`, `loanCollateralValue.api.js`
- Guarantors — `guarantors.api.js`, guarantor financial APIs
- Platform — `auth.api.js`, `users.api.js`, `organization.api.js`, `invitation.api.js`
- Reports / reviews — `reports.api.js`, `annualReviews.api.js`
