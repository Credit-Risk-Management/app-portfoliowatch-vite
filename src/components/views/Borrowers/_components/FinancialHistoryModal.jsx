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
        { sortKey: 'submittedAt', sortDirection: 'desc' }
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
      day: 'numeric' 
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
      rightBtnText=""
      rightBtnOnClick={() => {}}
      footerClass="justify-content-start"
      size="fullscreen"
    >
      <div className="py-16">
        {$borrowerFinancials.value.isLoading ? (
          <div className="text-center py-32">
            <Spinner animation="border" variant="primary" />
            <p className="mt-16 text-info-100">Loading financial history...</p>
          </div>
        ) : $borrowerFinancials.value.list.length > 0 ? (
          <>
            <div className="mb-16">
              <Badge bg="secondary-100" className="me-8">
                Total Records: {$borrowerFinancials.value.totalCount}
              </Badge>
            </div>
            <Table striped bordered hover responsive className="text-info-100">
              <thead className="bg-info-800">
                <tr>
                  <th>Submitted Date</th>
                  <th>Gross Revenue</th>
                  <th>Net Income</th>
                  <th>EBITDA</th>
                  <th>Debt Service</th>
                  <th>Current Ratio</th>
                  <th>Liquidity</th>
                  <th>Submitted By</th>
                  <th>Documents</th>
                </tr>
              </thead>
              <tbody>
                {$borrowerFinancials.value.list.map((financial) => (
                  <tr key={financial.id}>
                    <td className="fw-500">{formatDate(financial.submittedAt)}</td>
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

