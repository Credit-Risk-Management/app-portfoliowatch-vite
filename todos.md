√ 1. Remove KYC
√ 2. Do not remove Contacts
√ 3. Add Industry report
• Add Borrower Detail view with list of loans
√ 5. Add date on activity
√ 6. Add Finacial history view
√ 7. Add demo flow for upload financials and recompute watch score
  - Upload financials and then allow for modification
  - Choose the month/quarter for the financials
√ 8. Remove Edit Contact
• 10. Create sample Annual Report
• 12. Add invite feature (fix not getting the email)
  - Needs testing and improvement
• 13. Add company settings
• 17. Create external link for Borrower to upload fincial docs
• 18. Add Guarantors to Borrower
• 19. Add Collateral to Borrower
  - Collateral tab - Asset, Value, valuation date, LTV %
• 20. Improve upload experience
  - The lender will be sending an email to Small Business requesting financial statements 
• Setup Submit Financial reminders
  - Add a field to the loans table for "next financial statement due"
  - If we do not get the value explicitly, require next financials due at quarter end
  - Add to loan detail the financial submission frequency values
  - Add Fiscal year end
  - Create Loan Documents Type upload form. So lender can identify which documents they need. By default we will have P&L, Balance Sheet, Tax Returns. Bank will let us know what is the default, but they can add loan by loan if needed. 
  - Put a notice on the loan saying "X/10 documents provided"
  - This stages the docs for review (financials are subimitted automatically but not verified).
  - VIew financials between unverified and verified


11. Create Quartlerly Spreadsheet from last few pages from annual report
16. Update Submit new financials to actual use OCR
4a. Add a "Grid view" to teh signal table


}dIQqt^m-G`\OH1T

2. Update WATCH Algorithm
1. Fix OCR Workflow


Weighted Exposure Fields
√ Add ebidta field to the borrower financials table
√ Add debt service field to the borrower financials table
√ Add total current assets field to the borrower financials table
√ Add total current liabilities field to the borrower financials table
√ Add cash field to the borrower financials table
√ add cash equivalents field to the borrower financials table
√ add equity field to the borrower financials table
√ add rental expenses field to the borrower financials table
√ add accounts receivable field to the borrower financials table
√ add profit margin field to the borrower financials table
add inventorty field to the borrower financials table
add accounts payable field to the borrower financials table

Triggers
add change in cash field to the borrower financials table
add change in ebidta field to the borrower financials table
add change in accounts receivable field to the borrower financials table
add change in profit margin field to the borrower financials table
add change in inventory field to the borrower financials table
add change in accounts payable field to the borrower financials table

Collateral
add collateral to the loans table

Balance Sheet

totalCurrentAssets
totalCurrentLiabilities
cash
cashEquivalents
equity
accountsReceivable
accountsPayable
inventory

Income Statement

ebidta
rentalExpenses
profitMargin

Debt Service Work Sheet
debt service

Computed Triggers
changeInCash
changeInEbidta
changeInProfit
changeInAccountsReceivable
changeInProfitMargin
changeInInventory
changeInAccountsPayable