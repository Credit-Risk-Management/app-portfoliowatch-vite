import { useMemo } from 'react';
import { $guarantorDetailsData } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetail.consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import SignalTable from '@src/components/global/SignalTable/SignalTable';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChartLine, faCheck, faCopy, faTable } from '@fortawesome/free-solid-svg-icons';
import { formatDate } from '@src/utils/formatDate';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { $submitPFSModalView } from '../../SubmitPFSModal/_helpers/submitPFSModal.const';
import { $guarantorDetailView } from '../../../_helpers/guarantorDetail.consts';
import * as consts from './_helpers/guarantorFinancialsTab.consts';
import * as events from './_helpers/guarantorFinancialsTab.events';
import * as resolvers from './_helpers/guarantorFinancialsTab.resolvers';
import getGuarantorUploadLinkUrl from './_helpers/guarantorFinancialsTab.helpers';

const TABLE_HEADERS = [
  { key: 'asOfDate', value: 'As Of Date' },
  { key: 'totalAssets', value: 'Total Assets' },
  { key: 'totalLiabilities', value: 'Total Liabilities' },
  { key: 'netWorth', value: 'Net Worth' },
  { key: 'liquidity', value: 'Liquidity' },
];

export function GuarantorFinancialsTab() {
  const { guarantorId } = $guarantorDetailView.value;
  const { financials } = $guarantorDetailsData.value;

  useEffectAsync(async () => {
    if (!guarantorId) return;
    await resolvers.fetchPermanentUploadLink(guarantorId);
  }, [guarantorId]);

  const uploadLinkUrl = getGuarantorUploadLinkUrl(guarantorId);
  const rows = useMemo(() => financials.map((financial) => ({
    id: financial.id,
    totalAssets: formatCurrency(financial.totalAssets),
    totalLiabilities: formatCurrency(financial.totalLiabilities),
    netWorth: formatCurrency(financial.netWorth),
    liquidity: formatCurrency(financial.liquidity),
    asOfDate: formatDate(financial.asOfDate),
  })), [financials]);

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
      <SignalTable
        rows={rows}
        headers={TABLE_HEADERS}
        data={financials}
        totalCount={financials.length}
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
export default GuarantorFinancialsTab;
