import { useEffect } from 'react';
import { Button, Col, Container, Row } from 'react-bootstrap';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import { PAGE_LIMIT_OPTIONS } from '@src/consts/consts';
import { useParams } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingDiff,
  $onboardingItemFilter,
  $onboardingRunDetail,
  $onboardingScan,
  $onboardingView,
  ITEM_TABLE_HEADERS,
  IMPORT_STATUS_BADGE,
  MATCH_STATUS_BADGE,
  RUN_STATUS_BADGE,
} from './_helpers/onboarding.consts';
import { fetchRunDetail, fetchTenants } from './_helpers/onboarding.resolvers';
import {
  clearOnboardingDiffPoll,
  clearOnboardingScanPoll,
  handleStartDiff,
  handleStartImport,
  openFolderFilesModal,
  openMatchModal,
  openUploadModal,
  resetOnboardingFileReview,
  resumeDiffPollingIfNeeded,
  resumeScanPollingIfNeeded,
} from './_helpers/onboarding.events';
import {
  onboardingDiffButtonLabel,
  onboardingDiffStatusMessage,
  paginateList,
} from './_helpers/onboarding.helpers';
import UploadFolderModal from './_components/UploadFolderModal';
import MatchRelationshipModal from './_components/MatchRelationshipModal';
import FolderClassificationsModal from './_components/FolderClassificationsModal';
import OnboardingFileClassifications from './_components/OnboardingFileClassifications';
import OnboardingStatusBadge from './_components/OnboardingStatusBadge';

const OnboardingRunDetail = () => {
  const { runId } = useParams();

  useEffect(() => {
    resetOnboardingFileReview();
    $onboardingDiff.update({ activeRunId: runId || null });
    return () => {
      clearOnboardingDiffPoll();
      clearOnboardingScanPoll();
      $onboardingDiff.update({ activeRunId: null });
      $onboardingScan.update({ activeRunId: null });
    };
  }, [runId]);

  useEffectAsync(async () => {
    await fetchTenants();
    if (runId) {
      await fetchRunDetail(runId);
      resumeDiffPollingIfNeeded(runId);
      resumeScanPollingIfNeeded(runId);
    }
  }, [runId]);

  const { run } = $onboardingRunDetail.value;
  const diffBusy = $onboardingDiff.value.isInFlight
    || run?.status === 'DIFFING'
    || run?.status === 'CLASSIFYING';

  const RunDetailActions = () => (
    <div className="d-flex flex-wrap gap-8">
      <Button variant="outline-primary-100" size="sm" onClick={() => openUploadModal(runId)}>
        Upload folders
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={diffBusy}
        onClick={() => handleStartDiff(runId)}
      >
        {onboardingDiffButtonLabel(run?.status, diffBusy)}
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={diffBusy}
        onClick={() => handleStartImport(runId)}
      >
        Import
      </Button>
    </div>
  );
  const items = $onboardingRunDetail.value.items || [];
  const {
    items: pageItems,
    totalCount: itemTotalCount,
    currentPage: itemPage,
    pageLimit: itemPageLimit,
  } = paginateList(items, $onboardingItemFilter.value.page, $onboardingItemFilter.value.limit);

  const rows = pageItems.map(item => ({
    borrowerName: item.borrowerName,
    loanNumber: item.loanNumber || '—',
    folderPath: item.folderPath || '—',
    matchStatus: () => (
      <OnboardingStatusBadge badgeMap={MATCH_STATUS_BADGE} statusKey={item.matchStatus} />
    ),
    importStatus: () => (
      <OnboardingStatusBadge badgeMap={IMPORT_STATUS_BADGE} statusKey={item.importStatus} />
    ),
    actions: () => (
      <div className="d-flex flex-wrap gap-8">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary-100"
          onClick={e => {
            e.stopPropagation();
            openMatchModal(item.id);
          }}
        >
          Match
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary-100"
          disabled={!item.folderPath}
          onClick={e => {
            e.stopPropagation();
            openFolderFilesModal(item.id, item.folderPath);
          }}
        >
          Classifications
        </button>
      </div>
    ),
  }));

  return (
    <Container className="py-16 py-md-24">
      <PageHeader
        title={run?.name || 'Onboarding run'}
        breadcrumbs={[
          { href: '/onboarding', label: 'Onboarding' },
          { label: run?.name || 'Run' },
        ]}
        AdditionalComponents={RunDetailActions}
      />
      <div className="d-flex flex-wrap align-items-center gap-8 mb-16">
        <OnboardingStatusBadge badgeMap={RUN_STATUS_BADGE} statusKey={run?.status} />
        {diffBusy && (
          <span className="text-info-200 small">{onboardingDiffStatusMessage(run?.status)}</span>
        )}
        {run?.dropboxFolderName && (
          <span className="text-info-200 small">
            Dropbox ref:
            {' '}
            {run.dropboxFolderName}
          </span>
        )}
      </div>
      <Row className="mb-8 align-items-center justify-content-end">
        <Col xs="auto" className="d-flex align-items-center gap-2">
          <span className="text-info-100 text-nowrap small me-4">Rows per page</span>
          <SelectInput
            options={PAGE_LIMIT_OPTIONS}
            value={$onboardingItemFilter.value.limit}
            onChange={() => $onboardingItemFilter.update({ page: 1 })}
            placeholder="Limit"
            signal={$onboardingItemFilter}
            name="limit"
            isMulti={false}
            isSearchable={false}
            notClearable
          />
        </Col>
      </Row>
      <SignalTable
        $filter={$onboardingItemFilter}
        $view={$onboardingView}
        headers={ITEM_TABLE_HEADERS}
        rows={rows}
        hasPagination
        syncUrl={false}
        totalCount={itemTotalCount}
        currentPage={itemPage}
        currentPageItemsCount={pageItems.length}
        itemsPerPageAmount={itemPageLimit}
        rowCursor="default"
      />
      <OnboardingFileClassifications />
      <UploadFolderModal />
      <MatchRelationshipModal />
      <FolderClassificationsModal />
    </Container>
  );
};

export default OnboardingRunDetail;
