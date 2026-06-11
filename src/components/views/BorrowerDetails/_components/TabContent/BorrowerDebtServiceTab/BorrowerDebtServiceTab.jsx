/* eslint-disable react-hooks/exhaustive-deps */
import { useMemo } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faDollarSign, faEye } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
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
import DebtServiceQuarterlySummary from './_components/DebtServiceQuarterlySummary';
import { buildQuarterlyDebtServiceSummary } from './_helpers/debtService.helpers';

export function BorrowerDebtServiceTab() {
  // Fetch debt service history and financials when tab loads
  useEffectAsync(async () => {
    await fetchDebtServiceHistory();
    await fetchLatestDebtService();
    await fetchFinancialHistory();
  }, [$debtServiceHistoryView.value.refreshTrigger]);

  const quarterlySummary = useMemo(() => {
    const financialsList = $debtServiceContainerDetails.value?.financialsList?.length
      ? $debtServiceContainerDetails.value.financialsList
      : ($borrowerFinancials.value?.list || []);

    const debtServiceHistoryList = $debtServiceHistory.value?.list || [];
    const totalMonthlyPayment = debtServiceHistoryList[0]?.totalMonthlyPayment ?? null;

    return buildQuarterlyDebtServiceSummary({
      financialsList,
      totalMonthlyPayment,
      loans: $borrower.value?.borrower?.loans || [],
    });
  }, [
    $debtServiceContainerDetails.value?.financialsList,
    $borrowerFinancials.value?.list,
    $debtServiceHistory.value?.list,
    $borrower.value?.borrower?.loans,
  ]);

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
        const annualPayment = monthlyPayment != null ? Math.floor(Number(monthlyPayment)) * 12 : null;

        return {
          ...record,
          asOfDate: new Date(record.asOfDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          }),
          totalCurrentBalance: <span className="text-warning-500 fw-500">{formatCurrency(record.totalCurrentBalance)}</span>,
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
      <DebtServiceQuarterlySummary sections={quarterlySummary.sections} />

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
