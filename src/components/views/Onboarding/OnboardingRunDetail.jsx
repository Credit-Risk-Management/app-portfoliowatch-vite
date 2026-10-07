import { useEffect } from 'react';
import { Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import { faFolderOpen, faLink } from '@fortawesome/free-solid-svg-icons';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import ContextMenu from '@src/components/global/ContextMenu';
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
import { loadOnboardingRunPage } from './_helpers/onboarding.resolvers';
import {
  beginOnboardingRunLoad,
  clearOnboardingDiffPoll,
  clearOnboardingScanPoll,
  handleStartDiff,
  handleStartImport,
  handleOnboardingItemAction,
  openUploadModal,
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
    beginOnboardingRunLoad(runId);
    return () => {
      clearOnboardingDiffPoll();
      clearOnboardingScanPoll();
      $onboardingDiff.update({ activeRunId: null });
      $onboardingScan.update({ activeRunId: null });
    };
  }, [runId]);

  useEffectAsync(async () => {
    await loadOnboardingRunPage(runId);
    if (runId) {
      resumeDiffPollingIfNeeded(runId);
      resumeScanPollingIfNeeded(runId);
    }
  }, [runId]);

  const { run, isLoading } = $onboardingRunDetail.value;
  if (isLoading && !run) {
    return (
      <Container className="py-16 py-md-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  const diffBusy = $onboardingDiff.value.isInFlight
    || run?.status === 'DIFFING'
    || run?.status === 'CLASSIFYING';
  const { isImporting } = $onboardingView.value;
  const actionsBusy = diffBusy || isImporting;

  const RunDetailActions = () => (
    <div className="d-flex flex-wrap gap-8">
      <Button variant="outline-primary-100" size="sm" onClick={() => openUploadModal(runId)}>
        Upload folders
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={actionsBusy}
        onClick={() => handleStartDiff(runId)}
      >
        {diffBusy && (
          <Spinner animation="border" size="sm" className="me-8" role="status" aria-hidden />
        )}
        {onboardingDiffButtonLabel(run?.status, diffBusy)}
      </Button>
      <Button
        variant="outline-primary-100"
        size="sm"
        disabled={actionsBusy}
        onClick={() => handleStartImport(runId)}
      >
        {isImporting && (
          <Spinner animation="border" size="sm" className="me-8" role="status" aria-hidden />
        )}
        {isImporting ? 'Importing…' : 'Import'}
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
      <ContextMenu
        items={[
          { label: 'Match', icon: faLink, action: 'match' },
          {
            label: 'Classifications',
            icon: faFolderOpen,
            action: 'classifications',
            disabled: !item.folderPath,
          },
        ]}
        onItemClick={menuItem => handleOnboardingItemAction(item, menuItem.action)}
      />
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
