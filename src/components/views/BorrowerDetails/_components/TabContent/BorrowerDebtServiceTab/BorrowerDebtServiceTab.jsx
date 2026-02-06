/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faDollarSign, faEye } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import UniversalCard from '@src/components/global/UniversalCard';
import { $debtServiceHistory, $debtServiceHistoryView, $borrowerFinancials } from '@src/signals';
import { $borrower } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { fetchDebtServiceHistory, fetchLatestDebtService, fetchFinancialHistory } from './_helpers/debtService.resolvers';
import { $debtServiceContainerDetails, $debtServiceContainerView } from './_helpers/debtService.consts';
import { handleAddNew, handleEdit, handleDelete, handleViewDetails, handleCloseModal } from './_helpers/debtService.events';
import DebtServiceModalUpsert from './_components/DebtServiceModalUpsert';
import DebtServiceModalView from './_components/DebtServiceModalView';
import DebtServiceModalDelete from './_components/DebtServiceModalDelete';

export function BorrowerDebtServiceTab() {
  // Fetch debt service history and financials when tab loads
  useEffectAsync(async () => {
    await fetchDebtServiceHistory();
    await fetchLatestDebtService();
    await fetchFinancialHistory();
  }, [$debtServiceHistoryView.value.refreshTrigger]);

  // Calculate summary metrics
  const summaryMetrics = useMemo(() => {
    // Use latestFinancial from state, or try to get from $borrowerFinancials if available
    const financialsList = $borrowerFinancials.value?.list || [];
    let financialToUse = $debtServiceContainerDetails.value?.latestFinancial;

    // If we don't have latestFinancial in state but have financials in signal, use that
    if (!financialToUse && financialsList.length > 0) {
      const sortedFinancials = [...financialsList].sort((a, b) => {
        const dateA = new Date(a.asOfDate);
        const dateB = new Date(b.asOfDate);
        return dateB - dateA;
      });
      financialToUse = sortedFinancials[0] || null;
    }

    // Get EBITDA from latest financial - use same approach as Financials tab
    const ebitda = financialToUse?.ebitda != null ? Number(financialToUse.ebitda) : null;

    // Convert monthly to annual (multiply by 12)
    const debtServiceHistoryList = $debtServiceHistory.value?.list || [];
    const totalDebtService = debtServiceHistoryList.reduce((sum, item) => {
      const totalMonthlyPayment = item.totalMonthlyPayment != null ? Number(item.totalMonthlyPayment) : 0;
      return sum + totalMonthlyPayment;
    }, 0) * 12 || null;

    // Calculate Current DSCR: EBITDA / Annual Debt Service
    let currentDSCR = null;
    if (ebitda != null && totalDebtService != null && totalDebtService > 0) {
      currentDSCR = ebitda / totalDebtService;
    }

    // Get Covenant DSCR from loans (most restrictive)
    const loans = $borrower.value?.borrower?.loans || [];
    let covenantDSCR = null;
    loans.forEach((loan) => {
      if (loan.debtServiceCovenant != null && loan.debtServiceCovenant !== '') {
        const value = parseFloat(loan.debtServiceCovenant);
        if (!Number.isNaN(value) && (!covenantDSCR || value < covenantDSCR)) {
          covenantDSCR = value;
        }
      }
    });

    // Determine DSCR color class
    let dscrColorClass = 'text-info-100';
    if (currentDSCR !== null && covenantDSCR !== null && currentDSCR >= covenantDSCR) {
      dscrColorClass = 'text-success-500';
    } else if (currentDSCR !== null) {
      dscrColorClass = 'text-danger-500';
    }

    return {
      ebitda,
      totalDebtService,
      currentDSCR,
      covenantDSCR,
      dscrColorClass,
    };
  }, [$debtServiceContainerDetails.value?.latestFinancial, $borrowerFinancials.value?.list, $debtServiceContainerDetails.value?.latestDebtService, $borrower.value?.borrower?.loans]);

  // Table headers
  const tableHeaders = [
    { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
    { key: 'totalCurrentBalance', value: 'Total Balance', sortKey: 'totalCurrentBalance' },
    { key: 'totalMonthlyPayment', value: 'Total Annual Payment', sortKey: 'totalMonthlyPayment' },
    { key: 'debtCount', value: '# of Debts' },
    { key: 'submittedBy', value: 'Submitted By', sortKey: 'submittedBy' },
    { key: 'actions', value: 'Actions' },
  ];

  // Transform data into table rows
  const tableRows = useMemo(
    () => {
      const list = $debtServiceHistory.value?.list || [];
      return list.map((record) => {
        const monthlyPayment = record.totalMonthlyPayment != null ? Number(record.totalMonthlyPayment) : null;
        const annualPayment = monthlyPayment != null ? monthlyPayment * 12 : null;

        return {
          ...record,
          asOfDate: new Date(record.asOfDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          totalCurrentBalance: <span className="text-danger-500 fw-500">{formatCurrency(record.totalCurrentBalance)}</span>,
          totalMonthlyPayment: <span className="text-warning-500 fw-500">{formatCurrency(annualPayment)}</span>,
          debtCount: (
            <Button
              variant="link"
              className="p-0 text-info-100 text-decoration-underline"
              onClick={() => handleViewDetails(record)}
            >
              {record.debtLineItems?.length || 0}
            </Button>
          ),
          submittedBy: record.submittedBy || '-',
          actions: () => (
            <ContextMenu
              items={[
                { label: 'View Details', icon: faEye, action: 'view' },
                { label: 'Edit', icon: faEdit, action: 'edit' },
                { label: 'Delete', icon: faTrash, action: 'delete' },
              ]}
              onItemClick={(item) => {
                if (item.action === 'view') {
                  handleViewDetails(record);
                } else if (item.action === 'edit') {
                  handleEdit(record);
                } else if (item.action === 'delete') {
                  handleDelete(record);
                }
              }}
            />
          ),
        };
      });
    },
    [$debtServiceHistory.value?.list],
  );

  if ($debtServiceContainerView.value?.isLoading) {
    return (
      <div className="text-center py-64">
        <p className="text-info-100">Loading debt service history...</p>
      </div>
    );
  }

  return (
    <div>
      {/* Summary Metrics */}
      <UniversalCard headerText="Debt Service Summary" className="mb-16">
        <Row>
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <div className="text-info-100 fw-200 mb-4">EBITDA</div>
            <div className="text-success-500 fs-4 fw-bold">
              {summaryMetrics.ebitda !== null ? formatCurrency(summaryMetrics.ebitda) : '-'}
            </div>
          </Col>
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <div className="text-info-100 fw-200 mb-4">Total Debt Service</div>
            <div className="text-warning-500 fs-4 fw-bold">
              {summaryMetrics.totalDebtService !== null ? formatCurrency(summaryMetrics.totalDebtService) : '-'}
            </div>
          </Col>
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <div className="text-info-100 fw-200 mb-4">Current DSCR</div>
            <div className={`fs-4 fw-bold ${summaryMetrics.dscrColorClass}`}>
              {summaryMetrics.currentDSCR !== null ? summaryMetrics.currentDSCR.toFixed(2) : '-'}
            </div>
          </Col>
          <Col xs={12} md={3} className="mb-12 mb-md-0">
            <div className="text-info-100 fw-200 mb-4">Covenant DSCR</div>
            <div className="text-secondary-200 fs-4 fw-bold">
              {summaryMetrics.covenantDSCR !== null ? summaryMetrics.covenantDSCR.toFixed(2) : '-'}
            </div>
          </Col>
        </Row>
      </UniversalCard>

      <div className="d-flex justify-content-between align-items-center mb-16">
        <h4 className="text-info-50">Debt Service History</h4>
        <Button variant="primary-100" size="sm" onClick={handleAddNew}>
          <FontAwesomeIcon icon={faPlus} className="me-8" />
          Add Debt Service
        </Button>
      </div>

      {tableRows.length === 0 ? (
        <div className="text-center py-64">
          <FontAwesomeIcon icon={faDollarSign} className="text-info-300 mb-16" size="3x" />
          <h5 className="text-info-100 mb-16">No Debt Service Records</h5>
          <p className="text-info-200">Add a debt service record to track borrower obligations.</p>
          <Button variant="primary-100" size="sm" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} className="me-8" />
            Add First Record
          </Button>
        </div>
      ) : (
        <SignalTable
          headers={tableHeaders}
          rows={tableRows}
          totalCount={$debtServiceHistory.value?.totalCount || 0}
          currentPage={1}
          itemsPerPageAmount={10}
          hasPagination={false}
        />
      )}

      {/* Add/Edit Modal */}
      <DebtServiceModalUpsert
        show={$debtServiceContainerView.value.activeModalKey === 'add' || $debtServiceContainerView.value.activeModalKey === 'edit'}
        onHide={handleCloseModal}
      />

      {/* Delete Modal */}
      <DebtServiceModalDelete show={$debtServiceContainerView.value.activeModalKey === 'delete'} onHide={handleCloseModal} />

      {/* View Details Modal */}
      <DebtServiceModalView
        show={$debtServiceContainerView.value.activeModalKey === 'details'}
        onHide={handleCloseModal}
        record={$debtServiceContainerView.value.selectedRecordForDetails}
      />
    </div>
  );
}
export default BorrowerDebtServiceTab;
