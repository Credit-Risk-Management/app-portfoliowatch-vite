import { useState } from 'react';
import { $debtServiceHistory, $debtServiceHistoryView } from '@src/signals';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import UniversalModal from '@src/components/global/UniversalModal';
import debtServiceHistoryApi from '@src/api/debtServiceHistory.api';

export default function DebtServiceModalDelete({ show, onHide }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { selectedRecord } = $debtServiceHistory.value;

  const handleConfirmDelete = async () => {
    if (!selectedRecord) return;

    setIsDeleting(true);
    try {
      const response = await debtServiceHistoryApi.delete(selectedRecord.id);
      if (response.success) {
        successAlert('Debt service record deleted successfully', 'toast');
        $debtServiceHistoryView.update({
          refreshTrigger: $debtServiceHistoryView.value.refreshTrigger + 1,
        });
        onHide();
      }
    } catch (error) {
      console.error('Error deleting debt service:', error);
      dangerAlert('Failed to delete debt service record', 'toast');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <UniversalModal
      show={show}
      onHide={onHide}
      headerText="Delete Debt Service Record"
      leftBtnText="Cancel"
      rightBtnText={isDeleting ? 'Deleting...' : 'Delete'}
      rightBtnOnClick={handleConfirmDelete}
      rightButtonDisabled={isDeleting}
      size="sm"
    >
      <p className="text-info-100">
        Are you sure you want to delete this debt service record from{' '}
        {selectedRecord?.asOfDate ? new Date(selectedRecord.asOfDate).toLocaleDateString() : 'N/A'}?
      </p>
      <p className="text-warning-500">This action cannot be undone.</p>
    </UniversalModal>
  );
}
