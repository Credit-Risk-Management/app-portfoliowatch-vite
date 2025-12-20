# Mock Financial Data Setup

## Overview

The application now uses filename-based mock data instead of the `VITE_USE_STATIC_MOCKS` environment variable. When users upload financial documents, the system automatically detects the filename and applies the appropriate mock financial data.

## How It Works

1. **User uploads a file** (e.g., `Q1_Balance_Sheet.pdf`)
2. **System detects filename** and matches it to predefined mock data
3. **Form auto-populates** with the corresponding financial values
4. **User can review and adjust** before submitting

## Supported Files

The following filenames are recognized and mapped to specific mock data:

### Q1 2025 (March 31, 2025)
- `Q1_Balance_Sheet.pdf`
- `Q1_Income_Statement.pdf`

### Q2 2025 (June 30, 2025)
- `Q2_Balance_Sheet.pdf`
- `Q2_Income_Statement.pdf`

### Q3 2025 (September 30, 2025)
- `Q3_Balance_Sheet.pdf`
- `Q3_Income_Statement.pdf`

## Updating Mock Data Values

All mock data is defined in:
```
app-portfoliowatch-vite/src/components/views/Borrowers/_helpers/financials.helpers.js
```

### Structure

The mock data is stored in the `MOCK_DATA_BY_FILENAME` object at the top of the file:

```javascript
const MOCK_DATA_BY_FILENAME = {
  Q1_Balance_Sheet: {
    asOfDate: '2025-03-31',
    totalCurrentAssets: '2664918.32',
    totalCurrentLiabilities: '757597.90',
    // ... more fields
  },
  Q1_Income_Statement: {
    asOfDate: '2025-03-31',
    grossRevenue: '1122359.06',
    netIncome: '244678.25',
    // ... more fields
  },
  // ... more quarters
};
```

### To Update Values

1. Open `financials.helpers.js`
2. Find the appropriate key (e.g., `Q1_Balance_Sheet`)
3. Update the values as needed
4. Save the file

**Note:** Currently all quarters use the same values as placeholders. You mentioned you'll provide the actual values soon.

## Fields by Document Type

### Balance Sheet Fields
- `asOfDate` - Date of the financial statement
- `totalCurrentAssets` - Total current assets
- `totalCurrentLiabilities` - Total current liabilities
- `cash` - Cash on hand
- `cashEquivalents` - Cash equivalents
- `equity` - Total equity
- `accountsReceivable` - Accounts receivable
- `accountsPayable` - Accounts payable
- `inventory` - Inventory value

### Income Statement Fields
- `asOfDate` - Date of the financial statement
- `grossRevenue` - Gross revenue
- `netIncome` - Net income
- `ebitda` - EBITDA
- `rentalExpenses` - Rental expenses
- `profitMargin` - Profit margin percentage

## Filename Matching

The system is flexible with filename formats. It will match:
- Exact matches: `Q1_Balance_Sheet`
- With spaces: `Q1 Balance Sheet`
- With underscores: `Q1_Balance_Sheet`
- With any file extension: `.pdf`, `.xlsx`, `.xls`, `.docx`, etc.

## Fallback Behavior

If a filename doesn't match any predefined mock data, the system falls back to generating random realistic financial data based on the document type selected.

## Testing

To test the mock data system:

1. Navigate to Borrowers view
2. Select a borrower
3. Go to the Financials tab
4. Click "Submit Financial Data"
5. Upload one of the sample files from `/SampleDocs/` directory
6. Verify the form auto-populates with the correct values
7. Check the console logs for confirmation:
   ```
   Using mock data for: Q1_Balance_Sheet
   ```

## Sample Files Location

Sample PDF files are located in:
```
app-portfoliowatch-vite/SampleDocs/
```

These files can be used for testing the mock data system.

