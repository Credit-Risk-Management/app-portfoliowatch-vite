import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCopy, faCheck, faTable } from '@fortawesome/free-solid-svg-icons';
import SignalTable from '@src/components/global/SignalTable';
import { $borrower } from '@src/consts/consts';
import { $borrowerFinancials, $borrowerFinancialsView } from '@src/signals';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import {
  $borrowerFinancialsFilter,
  $borrowerFinancialsTableView,
} from '../BorrowerDetailsContainer/_helpers/borrowerDetail.consts';
import { $financialsContainerView } from './_helpers/financialsContainer.consts';
import {
  FINANCIALS_TABLE_HEADERS,
  buildFinancialsTableRows,
} from './_helpers/financialsContainer.helpers';
import {
  fetchFinancialHistory,
  fetchPermanentUploadLink,
} from './_helpers/financialsContainer.resolvers';
import {
  handleOpenSubmitFinancials,
  handleOpenEditFinancial,
  handleCopyPermanentLink,
  handleExportExcel,
  getUploadLinkUrl,
} from './_helpers/financialsContainer.events';

const FinancialsContainer = () => {
  const borrower = $borrower.value?.borrower;
  const borrowerId = borrower?.id;
  const { copiedLink, isExportingExcel } = $financialsContainerView.value;
  const financialsList = $borrowerFinancials.value?.list || [];
  const tableRows = buildFinancialsTableRows(financialsList);
  const uploadLinkUrl = getUploadLinkUrl();

  useEffectAsync(async () => {
    await fetchFinancialHistory();
  }, [borrowerId, $borrowerFinancialsFilter.value, $borrowerFinancialsView.value?.refreshTrigger]);

  useEffectAsync(async () => {
    if (borrowerId) {
      await fetchPermanentUploadLink(borrowerId);
    }
  }, [borrowerId]);

  const isLoading = $borrowerFinancials.value?.isLoading && !financialsList.length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-16">
        <div className="d-flex gap-2 align-items-center flex-grow-1">
          <Button
            variant="secondary-100"
            className="me-8"
            size="sm"
            onClick={() => handleOpenSubmitFinancials(borrowerId)}
          >
            <FontAwesomeIcon icon={faChartLine} className="me-8" />
            Submit Financials
          </Button>
          <Button
            variant={copiedLink ? 'success' : 'info-100'}
            onClick={handleCopyPermanentLink}
            disabled={!uploadLinkUrl}
            size="sm"
          >
            <FontAwesomeIcon icon={copiedLink ? faCheck : faCopy} className="me-8" />
            {copiedLink ? 'Copied!' : 'Copy Borrower Link'}
          </Button>
          <Button
            variant="outline-primary-100"
            onClick={() => handleExportExcel(borrowerId)}
            disabled={isExportingExcel}
            size="sm"
            className="ms-8"
          >
            <FontAwesomeIcon icon={faTable} className="me-8" />
            {isExportingExcel ? 'Exporting...' : 'Export Spreadsheet'}
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="text-center py-32">
          <p className="text-info-100">Loading financial history...</p>
        </div>
      )}

      {!isLoading && tableRows.length === 0 && (
        <div className="text-center py-32">
          <p className="text-info-100 lead">No financial history records found.</p>
          <p className="text-info-200 small">Submit new financials to start tracking history.</p>
        </div>
      )}

      {!isLoading && tableRows.length > 0 && (
        <SignalTable
          $filter={$borrowerFinancialsFilter}
          $view={$borrowerFinancialsTableView}
          headers={FINANCIALS_TABLE_HEADERS}
          rows={tableRows}
          totalCount={$borrowerFinancials.value?.totalCount || 0}
          currentPage={$borrowerFinancialsFilter.value.page}
          itemsPerPageAmount={10}
          onRowClick={(financial) => handleOpenEditFinancial(borrowerId, financial.id)}
        />
      )}
    </div>
  );
};

export default FinancialsContainer;
