import { useState, useEffect, useMemo } from 'react';
import { Table, Button, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilePdf } from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { auth } from '@src/utils/firebase';
import UniversalModal from '@src/components/global/UniversalModal';
import { $borrowerFinancials } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import borrowerFinancialsApi from '@src/api/borrowerFinancials.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';

const FinancialSpreadsheetModal = ({ show, onHide, borrowerId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  useEffect(() => {
    if (show && borrowerId) {
      fetchFinancialData();
    }
  }, [show, borrowerId]);

  const fetchFinancialData = async () => {
    if (!borrowerId) return;
    
    try {
      setIsLoading(true);
      const response = await borrowerFinancialsApi.getByBorrowerId(borrowerId, {
        sortKey: 'asOfDate',
        sortDirection: 'desc',
        limit: 6, // Get last 6 periods
      });

      if (response.success) {
        $borrowerFinancials.update({
          list: response.data || [],
          totalCount: response.count || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching financial data:', error);
      dangerAlert('Failed to load financial data');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
    });
  };

  const formatRatio = (value) => {
    if (value === null || value === undefined) return '-';
    return Number(value).toFixed(2);
  };

  // Prepare spreadsheet data - columns are periods, rows are metrics
  const spreadsheetData = useMemo(() => {
    const financials = $borrowerFinancials.value?.list || [];
    
    // Define the financial metrics to display
    const metrics = [
      { key: 'grossRevenue', label: 'Gross Revenue', format: 'currency' },
      { key: 'netIncome', label: 'Net Income', format: 'currency' },
      { key: 'ebitda', label: 'EBITDA', format: 'currency' },
      { key: 'debtService', label: 'DSCR', format: 'ratio' },
      { key: 'currentRatio', label: 'Current Ratio', format: 'ratio' },
      { key: 'liquidity', label: 'Liquidity', format: 'currency' },
      { key: 'liquidityRatio', label: 'Liquidity Ratio', format: 'ratio' },
      { key: 'totalCurrentAssets', label: 'Total Current Assets', format: 'currency' },
      { key: 'totalCurrentLiabilities', label: 'Total Current Liabilities', format: 'currency' },
      { key: 'cash', label: 'Cash', format: 'currency' },
      { key: 'cashEquivalents', label: 'Cash Equivalents', format: 'currency' },
      { key: 'accountsReceivable', label: 'Accounts Receivable', format: 'currency' },
      { key: 'inventory', label: 'Inventory', format: 'currency' },
      { key: 'accountsPayable', label: 'Accounts Payable', format: 'currency' },
      { key: 'equity', label: 'Equity', format: 'currency' },
    ];

    return {
      periods: financials.map(f => ({
        id: f.id,
        date: formatDate(f.asOfDate),
        fullDate: f.asOfDate,
        data: f,
      })),
      metrics,
    };
  }, [$borrowerFinancials.value?.list]);

  const handleGeneratePdf = async () => {
    try {
      setIsGeneratingPdf(true);
      
      // Use axios directly for blob response (bypass apiClient interceptor)
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3333';
      
      const user = auth.currentUser;
      let token = '';
      if (user) {
        token = await user.getIdToken();
      }
      
      const response = await axios.get(`${API_BASE_URL}/borrowers/${borrowerId}/financials/spreadsheet/pdf`, {
        responseType: 'blob',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response && response.data) {
        // Handle blob response
        const blob = new Blob([response.data], { type: 'application/pdf' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `financial-spreadsheet-${borrowerId}-${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        successAlert('PDF generated successfully!');
      } else {
        throw new Error('Invalid response from server');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      dangerAlert('Failed to generate PDF');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <UniversalModal
      show={show}
      onHide={onHide}
      headerText="Financial Spreadsheet"
      leftBtnText="Close"
      rightBtnText={null}
      footerClass="justify-content-start"
      size="xl"
      closeButton
    >
      <div>
        {isLoading ? (
          <div className="text-center py-32">
            <Spinner animation="border" variant="primary" />
            <p className="mt-16 text-info-100">Loading financial data...</p>
          </div>
        ) : spreadsheetData.periods.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-info-100 lead">No financial data available</p>
            <p className="text-info-200 small">Submit new financials to start tracking history.</p>
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-end mb-16">
              <Button
                variant="primary-100"
                onClick={handleGeneratePdf}
                disabled={isGeneratingPdf}
                size="sm"
              >
                <FontAwesomeIcon icon={faFilePdf} className="me-2" />
                {isGeneratingPdf ? 'Generating...' : 'Generate PDF'}
              </Button>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <Table striped bordered hover responsive className="text-info-100">
                <thead className="bg-info-800">
                  <tr>
                    <th className="sticky-left bg-info-700 text-info-50 fw-500" style={{ minWidth: '200px', position: 'sticky', left: 0, zIndex: 10 }}>
                      Metric
                    </th>
                    {spreadsheetData.periods.map((period, idx) => (
                      <th key={period.id} className="bg-info-700 text-info-50 fw-500" style={{ minWidth: '150px', textAlign: 'center' }}>
                        {period.date}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {spreadsheetData.metrics.map((metric) => (
                    <tr key={metric.key}>
                      <td className="fw-bold sticky-left text-info-50" style={{ position: 'sticky', left: 0, zIndex: 5 }}>
                        {metric.label}
                      </td>
                      {spreadsheetData.periods.map((period) => {
                        const value = period.data[metric.key];
                        let displayValue = '-';
                        
                        if (value !== null && value !== undefined && value !== '') {
                          if (metric.format === 'currency') {
                            displayValue = formatCurrency(value);
                          } else if (metric.format === 'ratio') {
                            displayValue = formatRatio(value);
                          } else {
                            displayValue = value.toString();
                          }
                        }
                        
                        return (
                          <td key={`${period.id}-${metric.key}`} style={{ textAlign: 'right' }}>
                            {displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          </>
        )}
      </div>
    </UniversalModal>
  );
};

export default FinancialSpreadsheetModal;

