import { Badge, ListGroup } from 'react-bootstrap';
import UniversalModal from '@src/components/global/UniversalModal';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import {
  $onboardingMatchForm,
  $onboardingRunDetail,
  $onboardingView,
} from '../_helpers/onboarding.consts';
import {
  closeMatchModal,
  handleConfirmMatch,
  handleIgnoreItem,
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

  return (
    <UniversalModal
      show={$onboardingView.value.showMatchModal && Boolean(itemId)}
      onHide={closeMatchModal}
      closeButton
      headerText="Match folder to borrower"
      leftBtnText="Ignore"
      leftBtnOnClick={() => handleIgnoreItem(itemId, runId)}
      rightBtnText="Confirm match"
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
        />
      </div>
      {assignedElsewhere && (
        <p className="text-warning small mb-16">
          Confirming moves this folder to this borrower.
        </p>
      )}
      <p className="text-info-200 small mb-8">Ranked candidates (from classification)</p>
      <ListGroup variant="flush" className="mb-16">
        {candidates.length === 0 && (
          <ListGroup.Item className="bg-info-900 text-info-200 border-info px-0">
            No stored probabilities yet. Pick a candidate after diff & classify completes.
          </ListGroup.Item>
        )}
        {candidates.map(c => (
          <ListGroup.Item
            key={c.name}
            action
            active={$onboardingMatchForm.value.selectedBorrowerName === c.name}
            onClick={() => $onboardingMatchForm.update({ selectedBorrowerName: c.name })}
            className="bg-info-900 text-light border-info d-flex justify-content-between align-items-center"
          >
            <span>{c.name}</span>
            <Badge bg="info">{(c.probability * 100).toFixed(0)}%</Badge>
          </ListGroup.Item>
        ))}
      </ListGroup>
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
