import { useMemo } from 'react';
import { $guarantorDetailsData } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetails.consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { GuarantorNetWorthWithMemoFlag } from '@src/utils/guarantorFinancialsSource';
import SignalTable from '@src/components/global/SignalTable/SignalTable';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCheck, faCopy, faTable } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@src/utils/formatDate';
import { formatRatioPercentForDisplay } from '@src/utils/ratioPercent';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { $submitPFSModalView } from '../SubmitPFSModal/_helpers/submitPFSModal.const';
import { $guarantorDetailView } from '../../_helpers/guarantorDetails.consts';
import * as consts from './_helpers/guarantorFinancials.consts';
import * as events from './_helpers/guarantorFinancials.events';
import * as resolvers from './_helpers/guarantorFinancials.resolvers';
import getGuarantorUploadLinkUrl from './_helpers/guarantorFinancials.helpers';

const TABLE_HEADERS = [
  { key: 'asOfDate', value: 'As Of Date' },
  { key: 'totalAssets', value: 'Total Assets' },
  { key: 'totalLiabilities', value: 'Total Liabilities' },
  { key: 'netWorth', value: 'Net Worth' },
  { key: 'liquidity', value: 'Liquidity' },
  { key: 'annualDebtService', value: 'Annual Debt Service' },
  { key: 'adjustedGrossIncome', value: 'Adjusted Gross Income ' },
  { key: 'debtToincomeRatio', value: 'Debt to Income Ratio' },
];

export function GuarantorFinancials() {
  const { guarantorId } = $guarantorDetailView.value;
  const { financials } = $guarantorDetailsData.value;

  useEffectAsync(async () => {
    if (!guarantorId) return;
    await resolvers.fetchPermanentUploadLink(guarantorId);
  }, [guarantorId]);

  const uploadLinkUrl = getGuarantorUploadLinkUrl(guarantorId);
  const sortedFinancials = useMemo(
    () => [...(financials || [])].sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate)),
    [financials],
  );

  const financialsRows = useMemo(() => sortedFinancials.map((financial) => ({
    id: financial.id,
    totalAssets: formatCurrency(financial.totalAssets),
    totalLiabilities: formatCurrency(financial.totalLiabilities),
    netWorth: (
      <GuarantorNetWorthWithMemoFlag
        netWorth={financial.netWorth}
        notes={financial.notes}
        compact
      />
    ),
    liquidity: formatCurrency(financial.liquidity),
    annualDebtService: formatCurrency(financial.annualDebtService),
    adjustedGrossIncome: formatCurrency(financial.adjustedGrossIncome),
    debtToincomeRatio: financial.debtToincomeRatio != null
      ? formatRatioPercentForDisplay(financial.debtToincomeRatio ?? financial.debtToIncomeRatio)
      : '-',
    asOfDate: formatDate(financial.asOfDate),
  })), [sortedFinancials]);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-16">
        <div className="d-flex gap-2 align-items-center flex-grow-1">
          <Button
            variant="secondary-100"
            className="me-8"
            size="sm"
            onClick={() => {
              $submitPFSModalView.update({
                activeModalKey: 'submitPFS',
                guarantorId: $guarantorDetailView.value.guarantorId,
              });
            }}
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
            {consts.$copiedLink.value ? 'Copied!' : 'Copy Guarantor Link'}
          </Button>
          <Button
            variant="outline-primary-100"
            onClick={() => events.handleExportExcel(guarantorId)}
            disabled={consts.$isExportingExcel.value}
            size="sm"
            className="ms-8"
          >
            <FontAwesomeIcon icon={faTable} className="me-8" />
            {consts.$isExportingExcel.value ? 'Exporting...' : 'Export Spreadsheet'}
          </Button>
        </div>
      </div>
      <h6 className="text-info-100 mb-8">Financial Statements</h6>
      <SignalTable
        rows={financialsRows}
        headers={TABLE_HEADERS}
        data={sortedFinancials}
        totalCount={sortedFinancials.length}
        isLoading={$guarantorDetailView.value.isLoading}
        onRowClick={(financial) => {
          $submitPFSModalView.update({
            activeModalKey: 'submitPFS',
            guarantorId: $guarantorDetailView.value.guarantorId,
            editingFinancialId: financial.id,
          });
        }}
      />
    </div>
  );
}
export default GuarantorFinancials;
