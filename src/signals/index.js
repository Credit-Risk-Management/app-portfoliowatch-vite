import { Signal } from '@fyclabs/tools-fyc-react/signals';

export const $global = Signal({
  isLoading: true,
  isSignedIn: false,
});
export const $view = Signal({});
export const $auth = Signal({
  user: null,
  token: null,
  isLoading: true,
});
export const $user = Signal({
  id: null,
  email: null,
  name: null,
  organizationId: null,
  role: null,
});
export const $organization = Signal({
  id: null,
  name: null,
  industry: null,
  createdAt: null,
});
export const $list = Signal({});
export const $detail = Signal({});
export const $form = Signal({});
export const $filter = Signal({ page: 1 });
export const $alert = Signal({});

export const $borrowers = Signal({
  list: [],
  selectedBorrower: null,
  isTableLoading: false,
  totalCount: 0,
});

export const $borrowersFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
  searchTerm: '',
  borrowerType: [],
  riskRating: '',
});

export const $borrowersView = Signal({
  isTableLoading: false,
  selectedItems: [],
  isSelectAllChecked: false,
  showAddModal: false,
  showEditModal: false,
  showViewModal: false,
  showDeleteModal: false,
  tableHeaders: [],
});

export const $borrowersForm = Signal({
  id: '',
  client_id: '',
  name: '',
  client_type: 'Individual',
  primary_contact: '',
  email: '',
  phone_number: '',
  date_of_birth: '',
  street_address: '',
  city: '',
  state: '',
  zip_code: '',
  country: 'USA',
  tax_id: '',
  business_start_date: '',
  industry_type: '',
  relationship_manager_id: '',
  client_risk_rating: 'Medium',
  credit_score: '',
  notes: '',
});

export const $loans = Signal({
  list: [],
  selectedLoan: null,
  isTableLoading: false,
  totalCount: 0,
});

export const $loansFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
  searchTerm: '',
  interestType: '',
  watchScore: '',
  relationshipManager: '',
});

export const $loansView = Signal({
  isTableLoading: false,
  selectedItems: [],
  isSelectAllChecked: false,
  showAddModal: false,
  showEditModal: false,
  showViewModal: false,
  showDeleteModal: false,
  showSaveReportModal: false,
  reportName: '',
  tableHeaders: [],
});

export const $loansForm = Signal({
  id: '',
  loan_number: '',
  borrower_name: '',
  borrower_id: null,
  principal_amount: '',
  payment_amount: '',
  next_payment_due_date: '',
  last_payment_received_date: '',
  type_of_interest: 'Fixed',
  current_interest_rate: '',
  next_rate_adjustment_date: '',
  loan_maturity_date: '',
  loan_origination_date: '',
  last_annual_review: '',
  last_financial_statement: '',
  gross_revenue: '',
  net_income: '',
  ebitda: '',
  debt_service: '',
  current_ratio: '',
  liquidity: '',
  retained_earnings: '',
  current_risk_rating: 3,
  relationship_manager_id: '',
  naics: '',
  industry: '',
  financial_metrics_override_by: null,
  financial_metrics_override_date: null,
  financial_metrics_override_notes: '',
});

export const $documents = Signal({
  list: [],
  selectedDocument: null,
  isTableLoading: false,
  totalCount: 0,
});

export const $documentsFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
  searchTerm: '',
  documentType: '',
});

export const $documentsView = Signal({
  isTableLoading: false,
  selectedItems: [],
  showUploadModal: false,
  showDeleteModal: false,
  showPreviewModal: false,
  tableHeaders: [],
});

export const $transactions = Signal({
  list: [],
  selectedTransaction: null,
  isTableLoading: false,
  totalCount: 0,
});

export const $transactionsFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
  searchTerm: '',
  transactionType: '',
  status: '',
  startDate: '',
  endDate: '',
});

export const $transactionsView = Signal({
  isTableLoading: false,
  selectedItems: [],
  showDetailModal: false,
  tableHeaders: [],
});

export const $relationshipManagers = Signal({
  list: [],
  selectedManager: null,
  isTableLoading: false,
  totalCount: 0,
});

export const $relationshipManagersFilter = Signal({
  page: 1,
  sortKey: undefined,
  sortDirection: undefined,
  searchTerm: '',
  isActive: true,
});

export const $relationshipManagersView = Signal({
  isTableLoading: false,
  selectedItems: [],
  showDetailModal: false,
  showAddModal: false,
  showEditModal: false,
  tableHeaders: [],
});

export const $relationshipManagersForm = Signal({
  id: '',
  user_id: '',
  name: '',
  email: '',
  phone: '',
  office_location: '',
  position_title: '',
  manager_id: '',
  is_active: true,
  created_at: '',
  updated_at: '',
});

export const $reports = Signal({
  list: [],
  selectedReport: null,
  isGenerating: false,
});

export const $reportsView = Signal({
  showGenerateModal: false,
  reportType: '',
  parameters: {},
  selectedReportId: null,
});

export const $comments = Signal({
  list: [],
  isLoading: false,
});

export const $dashboard = Signal({
  metrics: {
    totalBorrowers: 0,
    activeLoans: 0,
    portfolioValue: 0,
    atRiskLoans: 0,
  },
  recentActivity: [],
  recentLoans: [],
  upcomingTasks: [],
  isLoading: false,
});

export const $contacts = Signal({
  list: [],
  selectedContact: null,
  isLoading: false,
  totalCount: 0,
});

export const $contactsView = Signal({
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
});

export const $contactsForm = Signal({
  id: '',
  borrowerId: '',
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  title: '',
  isPrimary: false,
  organizationId: '',
});

export const $borrowerFinancials = Signal({
  list: [],
  isLoading: false,
  totalCount: 0,
  selectedFinancial: null,
});

export const $borrowerFinancialsView = Signal({
  showHistoryModal: false,
  showSubmitModal: false,
  currentBorrowerId: null,
  isEditMode: false,
  editingFinancialId: null,
  refreshTrigger: 0, // Used to trigger refresh after updates
});

export const $borrowerFinancialsForm = Signal({
  activeTab: 'documents',
  documentType: 'balanceSheet',
  asOfDate: '',
  accountabilityScore: '',
  // Income Statement fields
  grossRevenue: '',
  netIncome: '',
  ebitda: '',
  rentalExpenses: '',
  profitMargin: '',
  // Balance Sheet fields
  totalCurrentAssets: '',
  totalCurrentLiabilities: '',
  cash: '',
  cashEquivalents: '',
  equity: '',
  accountsReceivable: '',
  accountsPayable: '',
  inventory: '',
  // Debt Service fields (actual value, covenant is on Loan)
  debtService: '',
  // Current Ratio fields (actual value, covenant is on Loan)
  currentRatio: '',
  // Liquidity fields (actual values, covenants are on Loan)
  liquidity: '',
  liquidityRatio: '',
  retainedEarnings: '',
  // Trigger fields (calculated by backend)
  changeInCash: '',
  changeInEbitda: '',
  changeInAccountsReceivable: '',
  changeInProfitMargin: '',
  changeInInventory: '',
  changeInAccountsPayable: '',
  // Other
  notes: '',
  documentIds: [],
});

export const $users = Signal({
  list: [],
  invitations: [],
  isLoading: false,
  totalCount: 0,
});

export const $usersView = Signal({
  showInviteModal: false,
  showDeleteModal: false,
});

export const $usersForm = Signal({
  email: '',
  role: 'USER',
});

export const $profile = Signal({
  isLoading: false,
  isEditing: false,
});

export const $profileView = Signal({
  isEditing: false,
  isSaving: false,
});

export const $profileForm = Signal({
  name: '',
});

export const $settings = Signal({
  isLoading: false,
  activeTab: 'organization',
});

export const $settingsView = Signal({
  activeTab: 'organization',
  isSaving: false,
  showInviteModal: false,
});

export const $settingsForm = Signal({
  organizationName: '',
  organizationIndustry: '',
});
