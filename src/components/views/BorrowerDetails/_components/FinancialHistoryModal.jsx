/* eslint-disable no-nested-ternary */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect } from 'react';
import { Table, Badge, Spinner } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowerFinancials, $borrowerFinancialsView } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';

const FinancialHistoryModal = () => {
  useEffect(() => {
    if ($borrowerFinancialsView.value.showHistoryModal && $borrowerFinancialsView.value.currentBorrowerId) {
      fetchFinancialHistory();
    }
  }, [$borrowerFinancialsView.value.showHistoryModal, $borrowerFinancialsView.value.currentBorrowerId]);

  const fetchFinancialHistory = async () => {
    try {
      $borrowerFinancials.update({ isLoading: true });
      const response = await borrowerFinancialsApi.getByBorrowerId(
        $borrowerFinancialsView.value.currentBorrowerId,
        { sortKey: 'submittedAt', sortDirection: 'desc' },
      );

      if (response.success) {
        $borrowerFinancials.update({
          list: response.data || [],
          totalCount: response.count || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching financial history:', error);
      $borrowerFinancials.update({
        list: [],
        totalCount: 0,
        isLoading: false,
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleClose = () => {
    $borrowerFinancialsView.update({
      showHistoryModal: false,
      currentBorrowerId: null,
    });
    $borrowerFinancials.update({ list: [], totalCount: 0 });
  };

  return (
    <UniversalModal
      show={$borrowerFinancialsView.value.showHistoryModal}
      onHide={handleClose}
      headerText="Financial History"
      leftBtnText="Close"
      rightBtnText={null}
      // rightBtnOnClick={() => { }}
      footerClass="justify-content-start"
      size="xl"
      closeButton
    >
      <div>
        {$borrowerFinancials.value.isLoading ? (
          <div className="text-center py-32">
            <Spinner animation="border" variant="primary" />
            <p className="mt-16 text-info-100">Loading financial history...</p>
          </div>
        ) : $borrowerFinancials.value.list.length > 0 ? (
          <>
            <div className="mb-16">
              <Badge bg="secondary-100" className="me-8 text-secondary-900">
                Total Records: {$borrowerFinancials.value.totalCount}
              </Badge>
            </div>
            <Table striped responsive className="text-info-100">
              <thead className="bg-info-800">
                <tr>
                  <th className="bg-info-700 text-info-50 fw-500">As Of Date</th>
                  <th className="bg-info-700 text-info-50 fw-500">Submitted Date</th>
                  <th className="bg-info-700 text-info-50 fw-500">Gross Revenue</th>
                  <th className="bg-info-700 text-info-50 fw-500">Net Income</th>
                  <th className="bg-info-700 text-info-50 fw-500">EBITDA</th>
                  <th className="bg-info-700 text-info-50 fw-500">Debt Service</th>
                  <th className="bg-info-700 text-info-50 fw-500">Current Ratio</th>
                  <th className="bg-info-700 text-info-50 fw-500">Liquidity</th>
                  <th className="bg-info-700 text-info-50 fw-500">Submitted By</th>
                  <th className="bg-info-700 text-info-50 fw-500">Documents</th>
                </tr>
              </thead>
              <tbody>
                {$borrowerFinancials.value.list.map((financial) => (
                  <tr key={financial.id}>
                    <td className="fw-bold text-secondary-100">{formatDate(financial.asOfDate)}</td>
                    <td className="fw-500 text-info-200">{formatDate(financial.submittedAt)}</td>
                    <td className="text-success-500 fw-500">
                      {formatCurrency(financial.grossRevenue)}
                    </td>
                    <td className="text-success-500 fw-500">
                      {formatCurrency(financial.netIncome)}
                    </td>
                    <td className="text-success-500 fw-500">
                      {formatCurrency(financial.ebitda)}
                    </td>
                    <td className="fw-500">
                      {financial.debtService ? parseFloat(financial.debtService).toFixed(2) : '-'}
                    </td>
                    <td className="fw-500">
                      {financial.currentRatio ? parseFloat(financial.currentRatio).toFixed(2) : '-'}
                    </td>
                    <td className="text-success-500 fw-500">
                      {formatCurrency(financial.liquidity)}
                    </td>
                    <td className="text-info-50">{financial.submittedBy || '-'}</td>
                    <td>
                      {financial.documentIds && financial.documentIds.length > 0 ? (
                        <Badge bg="info-100">{financial.documentIds.length} docs</Badge>
                      ) : (
                        <span className="text-info-100">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </>
        ) : (
          <div className="text-center py-32">
            <p className="text-info-100 lead">No financial history records found.</p>
            <p className="text-info-200 small">Submit new financials to start tracking history.</p>
          </div>
        )}
      </div>
    </UniversalModal>
  );
};

export default FinancialHistoryModal;
