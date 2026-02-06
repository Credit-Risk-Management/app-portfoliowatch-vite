import { useMemo } from 'react';
import { Button, Badge } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCheck, faCopy, faTable } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import { $borrower } from '@src/consts/consts';
import { $borrowerFinancials } from '@src/signals';
import { formatCurrency } from '@src/utils/formatCurrency';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { $borrowerFinancialsFilter, $borrowerFinancialsTableView } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.consts';
import * as consts from './_helpers/borrowerFinancialsTab.consts';
import * as events from './_helpers/borrowerFinancialsTab.events';
import * as resolvers from './_helpers/borrowerFinancialsTab.resolvers';
import {
  FINANCIALS_TABLE_HEADERS,
  formatFinancialDate,
  getUploadLinkUrl,
} from './_helpers/borrowerFinancialsTab.helpers';

export function BorrowerFinancialsTab() {
  const borrowerId = $borrower.value?.borrower?.id;

  useEffectAsync(async () => {
    if (!borrowerId) return;
    await resolvers.fetchPermanentUploadLink(borrowerId);
  }, [borrowerId]);

  const financialsTableRows = useMemo(
    () => ($borrowerFinancials.value?.list || []).map((financial) => ({
      ...financial,
      asOfDate: formatFinancialDate(financial.asOfDate),
      submittedAt: formatFinancialDate(financial.submittedAt),
      accountabilityScore: financial.accountabilityScore ?? '-',
      grossRevenue: <span className="text-success-500 fw-500">{formatCurrency(financial.grossRevenue)}</span>,
      netIncome: <span className="text-success-500 fw-500">{formatCurrency(financial.netIncome)}</span>,
      ebitda: <span className="text-success-500 fw-500">{formatCurrency(financial.ebitda)}</span>,
      debtService: financial.debtService ? parseFloat(financial.debtService).toFixed(2) : '-',
      currentRatio: financial.currentRatio ? parseFloat(financial.currentRatio).toFixed(2) : '-',
      liquidity: <span className="text-success-500 fw-500">{formatCurrency(financial.liquidity)}</span>,
      submittedBy: financial.submittedBy ?? '-',
      documents: financial.documentIds?.length > 0 ? (
        <Badge bg="info-100">{financial.documentIds.length} docs</Badge>
      ) : (
        <span className="text-info-100">-</span>
      ),
    })),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- $borrowerFinancials is a signal; component re-renders on update
    [$borrowerFinancials.value?.list],
  );

  const isLoading = $borrowerFinancials.value?.isLoading && !$borrowerFinancials.value?.list?.length;
  const uploadLinkUrl = getUploadLinkUrl();

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-16">
        <div className="d-flex gap-2 align-items-center flex-grow-1">
          <Button
            variant="secondary-100"
            className="me-8"
            size="sm"
            onClick={() => events.openSubmitFinancials(borrowerId)}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-8" />
            Submit Financials
          </Button>
          <Button
            variant={consts.$copiedLink.value ? 'success' : 'info-100'}
            onClick={events.handleCopyPermanentLink}
            disabled={!uploadLinkUrl}
            size="sm"
          >
            <FontAwesomeIcon icon={consts.$copiedLink.value ? faCheck : faCopy} className="me-8" />
            {consts.$copiedLink.value ? 'Copied!' : 'Copy Borrower Link'}
          </Button>
          <Button
            variant="outline-primary-100"
            onClick={() => events.handleExportExcel(borrowerId)}
            disabled={consts.$isExportingExcel.value}
            size="sm"
            className="ms-8"
          >
            <FontAwesomeIcon icon={faTable} className="me-8" />
            {consts.$isExportingExcel.value ? 'Exporting...' : 'Export Spreadsheet'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-32">
          <p className="text-info-100">Loading financial history...</p>
        </div>
      )}
      {!isLoading && financialsTableRows.length === 0 && (
        <div className="text-center py-32">
          <p className="text-info-100 lead">No financial history records found.</p>
          <p className="text-info-200 small">Submit new financials to start tracking history.</p>
        </div>
      )}
      {!isLoading && financialsTableRows.length > 0 && (
        <SignalTable
          $filter={$borrowerFinancialsFilter}
          $view={$borrowerFinancialsTableView}
          headers={FINANCIALS_TABLE_HEADERS}
          rows={financialsTableRows}
          totalCount={$borrowerFinancials.value?.totalCount || 0}
          currentPage={$borrowerFinancialsFilter.value.page}
          itemsPerPageAmount={10}
          onRowClick={(financial) => events.onFinancialRowClick(borrowerId, financial)}
        />
      )}
    </div>
  );
}

export default BorrowerFinancialsTab;
