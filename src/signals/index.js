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
  sortKey: 'name',
  sortDirection: 'asc',
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
  borrowerId: '',
  name: '',
  borrowerType: 'Business',
  email: '',
  phoneNumber: '',
  streetAddress: '',
  city: '',
  state: '',
  zipCode: '',
  borrowerRiskRating: 'Medium',
  relationshipManagerId: '',
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
  loanNumber: '',
  borrowerId: null,
  borrowerName: '',
  principalAmount: '',
  paymentAmount: '',
  nextPaymentDueDate: '',
  lastPaymentReceivedDate: '',
  typeOfInterest: 'fixed',
  currentInterestRate: '',
  nextRateAdjustmentDate: '',
  loanMaturityDate: '',
  loanOriginationDate: '',
  lastAnnualReview: '',
  lastFinancialStatement: '',
  grossRevenue: '',
  netIncome: '',
  ebitda: '',
  debtService: '',
  currentRatio: '',
  liquidity: '',
  retainedEarnings: '',
  currentRiskRating: 3,
  relationshipManagerId: '',
  naics: '',
  industry: '',
  financialMetricsOverrideBy: null,
  financialMetricsOverrideDate: null,
  financialMetricsOverrideNotes: '',
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
  userId: '',
  name: '',
  email: '',
  phone: '',
  officeLocation: '',
  positionTitle: '',
  managerId: null,
  isActive: true,
});

export const $managerDetail = Signal({
  manager: null,
  loans: [],
  borrowers: [],
  comments: [],
  recentLoans: [],
  allManagers: [],
  isLoading: false,
  metrics: {
    portfolioValue: 0,
    totalBorrowers: 0,
    activeLoans: 0,
    watchScoreCountData: [],
    watchScoreAmountData: [],
  },
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
  refreshTrigger: 0,
});

export const $borrowerFinancialsView = Signal({
  activeModalKey: null,
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

export const $debtServiceHistory = Signal({
  list: [],
  isLoading: false,
  totalCount: 0,
  selectedRecord: null,
});

export const $debtServiceHistoryView = Signal({
  showAddModal: false,
  showEditModal: false,
  showDeleteModal: false,
  isEditMode: false,
  editingRecordId: null,
  refreshTrigger: 0,
});

export const $debtServiceHistoryForm = Signal({
  asOfDate: '',
  debtLineItems: [],
  totalCurrentBalance: 0,
  totalMonthlyPayment: 0,
  notes: '',
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
  isLoading: true,
});

export const $usersForm = Signal({
  email: '',
  role: 'USER',
  message: '',
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
  isLoading: false,
});

export const $settingsForm = Signal({
  organizationName: '',
  organizationIndustry: '',
});

export const $notifications = Signal({
  list: [],
  unreadCount: 0,
  isLoading: false,
  totalCount: 0,
});

export const $notificationsView = Signal({
  showDropdown: false,
  filter: 'all', // all, unread, read
});

export const $mentionableUsers = Signal({
  list: [],
  isLoading: false,
});
