import { Badge, ListGroup, Spinner } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import {
  $onboardingMatchForm,
  $onboardingRunDetail,
  $onboardingView,
} from '../_helpers/onboarding.consts';
import {
  handleConfirmMatch,
  handleIgnoreItem,
  requestCloseMatchModal,
} from '../_helpers/onboarding.events';
import {
  buildMatchFolderOptions,
  isFolderAssignedToOtherItem,
} from '../_helpers/onboarding.helpers';

const MatchRelationshipModal = () => {
  const itemId = $onboardingView.value.selectedItemId;
  const runId = $onboardingRunDetail.value.run?.id;
  const item = ($onboardingRunDetail.value.items || []).find(i => i.id === itemId);
  const {
    candidates = [],
    folders = [],
    selectedFolderPath,
  } = $onboardingMatchForm.value;
  const folderOptions = buildMatchFolderOptions(folders, item);
  const assignedElsewhere = isFolderAssignedToOtherItem(folders, selectedFolderPath, itemId);
  const { isLoadingMatch, isSavingMatch, matchSaveAction } = $onboardingView.value;
  const matchBusy = isLoadingMatch || isSavingMatch;

  return (
    <UniversalModal
      show={$onboardingView.value.showMatchModal && Boolean(itemId)}
      onHide={requestCloseMatchModal}
      closeButton
      headerText="Match folder to borrower"
      leftBtnText={matchSaveAction === 'ignore' ? (
        <>
          <Spinner animation="border" size="sm" className="me-8 align-middle" role="status" aria-hidden />
          Ignoring…
        </>
      ) : 'Ignore'}
      leftBtnOnClick={() => handleIgnoreItem(itemId, runId)}
      leftButtonDisabled={matchBusy}
      keyboard={!isSavingMatch}
      backdrop={isSavingMatch ? 'static' : true}
      rightBtnText={matchSaveAction === 'confirm' ? (
        <>
          <Spinner animation="border" size="sm" className="me-8 align-middle" role="status" aria-hidden />
          Saving…
        </>
      ) : 'Confirm match'}
      rightButtonDisabled={matchBusy}
      rightBtnOnClick={() => handleConfirmMatch(itemId, runId)}
      size="lg"
    >
      <p className="text-info-200 small mb-8">Borrower</p>
      <p className="text-light mb-16">
        {item?.borrowerName || '—'}
        {item?.loanNumber ? ` ${item.loanNumber}` : ''}
      </p>
      <p className="text-info-200 small mb-8">Folder</p>
      <div className={assignedElsewhere ? 'mb-8' : 'mb-16'}>
        <SelectInput
          name="selectedFolderPath"
          signal={$onboardingMatchForm}
          options={folderOptions}
          value={selectedFolderPath}
          isPortal
          placeholder="Select a folder"
          isDisabled={matchBusy}
        />
      </div>
      {assignedElsewhere && (
        <p className="text-warning small mb-16">
          Confirming moves this folder to this borrower.
        </p>
      )}
      <p className="text-info-200 small mb-8">Ranked candidates (from classification)</p>
      {isLoadingMatch ? (
        <div className="d-flex align-items-center gap-8 text-info-200 small mb-16">
          <Spinner animation="border" size="sm" role="status" aria-hidden />
          Loading match options…
        </div>
      ) : (
        <ListGroup variant="flush" className="mb-16">
          {candidates.length === 0 && (
            <ListGroup.Item className="bg-info-900 text-info-200 border-info px-0">
              No stored probabilities yet. Pick a candidate after diff & classify completes.
            </ListGroup.Item>
          )}
          {candidates.map(c => (
            <ListGroup.Item
              key={c.name}
              action={!isSavingMatch}
              active={$onboardingMatchForm.value.selectedBorrowerName === c.name}
              onClick={isSavingMatch ? undefined : () => $onboardingMatchForm.update({ selectedBorrowerName: c.name })}
              className="bg-info-900 text-light border-info d-flex justify-content-between align-items-center"
            >
              <span>{c.name}</span>
              <Badge className="bg-info-400 text-info-900">
                {(c.probability * 100).toFixed(0)}
                %
              </Badge>
            </ListGroup.Item>
          ))}
        </ListGroup>
      )}
      {item?.matchConfidence != null && (
        <p className="text-info-200 small mb-0">
          Model confidence:
          {' '}
          {(item.matchConfidence * 100).toFixed(0)}
          %
        </p>
      )}
    </UniversalModal>
  );
};

export default MatchRelationshipModal;
