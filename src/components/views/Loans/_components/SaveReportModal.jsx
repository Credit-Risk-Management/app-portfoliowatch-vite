import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import { $loansView } from '@src/signals';
import { handleSaveReport } from '../_helpers/loans.events';

const SaveReportModal = () => (
  <UniversalModal
    show={$loansView.value.showSaveReportModal}
    onHide={() => $loansView.update({ showSaveReportModal: false, reportName: '' })}
    headerText="Save to Reports"
    rightBtnText="Save"
    rightBtnOnClick={handleSaveReport}
    rightBtnVariant="primary"
  >
    <UniversalInput
      label="Report Name"
      type="text"
      placeholder="Enter report name"
      value={$loansView.value.reportName || ''}
      onChange={(e) => $loansView.update({ reportName: e.target.value })}
    />
    <p className="text-muted mt-16 mb-0">
      This will save the current filters as a report that you can view later.
    </p>
  </UniversalModal>
);

export default SaveReportModal;
