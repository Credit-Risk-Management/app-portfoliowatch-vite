import { useEffect } from 'react';
import { Badge, Button, Col, Container, Row, Spinner } from 'react-bootstrap';
import UniversalInput from '@src/components/global/Inputs/UniversalInput/UniversalInput';
import { faFolderOpen, faLink } from '@fortawesome/free-solid-svg-icons';
import SelectInput from '@src/components/global/Inputs/SelectInput';
import Search from '@src/components/global/Inputs/Search/Search';
import ContextMenu from '@src/components/global/ContextMenu';
import { PAGE_LIMIT_OPTIONS } from '@src/consts/consts';
import { useParams } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import {
  $onboardingDiff,
  $onboardingImport,
  $onboardingItemFilter,
  $onboardingRunDetail,
  $onboardingRunSummary,
  $onboardingScan,
  $onboardingView,
  ITEM_TABLE_HEADERS,
  IMPORT_STATUS_BADGE,
  MATCH_STATUS_BADGE,
  RUN_STATUS_BADGE,
  ONBOARDING_IMPORT_STATUS_FILTER_OPTIONS,
  ONBOARDING_MATCH_STATUS_FILTER_OPTIONS,
} from './_helpers/onboarding.consts';
import {
  clearOnboardingSummaryPoll,
  loadOnboardingRunPage,
} from './_helpers/onboarding.resolvers';
import {
  beginOnboardingRunLoad,
  clearOnboardingDiffPoll,
  clearOnboardingImportPoll,
  clearOnboardingScanPoll,
  handleStartDiff,
  handleStartImport,
  handleOnboardingItemAction,
  handleOnboardingMatchStatusClick,
  openUploadModal,
  resumeDiffPollingIfNeeded,
  resumeImportPollingIfNeeded,
  resumeScanPollingIfNeeded,
} from './_helpers/onboarding.events';
import {
  onboardingDiffButtonLabel,
  onboardingDiffStatusMessage,
  onboardingImportStatusMessage,
  canQuickConfirmMatch,
  filterOnboardingItems,
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
      clearOnboardingImportPoll();
      clearOnboardingScanPoll();
      clearOnboardingSummaryPoll();
      $onboardingDiff.update({ activeRunId: null });
      $onboardingImport.update({ activeRunId: null });
      $onboardingScan.update({ activeRunId: null });
    };
  }, [runId]);

  useEffectAsync(async () => {
    await loadOnboardingRunPage(runId);
    if (runId) {
      resumeDiffPollingIfNeeded(runId);
      resumeImportPollingIfNeeded(runId);
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
  const importPollBusy = $onboardingImport.value.isPolling || run?.status === 'IMPORTING';
  const { isImporting } = $onboardingView.value;
  const actionsBusy = diffBusy || isImporting || importPollBusy;
  const manualPipeline = !run?.autoContinue;
  const summary = $onboardingRunSummary.value.data;
  const failedImportCount = summary?.failedItems?.length
    ?? ($onboardingRunDetail.value.items || []).filter((i) => i.importStatus === 'FAILED').length;

  const RunDetailActions = () => (
    <div className="d-flex flex-wrap gap-8">
      <Button variant="outline-primary-100" size="sm" onClick={() => openUploadModal(runId)}>
        Upload folders
      </Button>
      {manualPipeline && (
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
      )}
      {manualPipeline && (
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
      )}
      {failedImportCount > 0 && (
        <Button
          variant="outline-warning"
          size="sm"
          disabled={actionsBusy}
          onClick={() => handleStartImport(runId)}
        >
          Retry failed
        </Button>
      )}
    </div>
  );
  const filteredItems = filterOnboardingItems(
    $onboardingRunDetail.value.items || [],
    $onboardingItemFilter.value,
  );
  const {
    items: pageItems,
    totalCount: itemTotalCount,
    currentPage: itemPage,
    pageLimit: itemPageLimit,
  } = paginateList(
    filteredItems,
    $onboardingItemFilter.value.page,
    $onboardingItemFilter.value.limit,
  );
  const { isSavingMatch, confirmingMatchItemId } = $onboardingView.value;

  const rows = pageItems.map(item => ({
    borrowerName: item.borrowerName,
    loanNumber: item.loanNumber || '—',
    folderPath: item.folderPath || '—',
    matchStatus: () => {
      const confirming = isSavingMatch && confirmingMatchItemId === item.id;
      const quickConfirm = canQuickConfirmMatch(item);
      const interactive = item.matchStatus !== 'CONFIRMED' && !confirming;
      let title = '';
      if (interactive) {
        title = quickConfirm
          ? 'Click to confirm this match'
          : 'Click to review or change match';
      }
      return (
        <span className="d-inline-flex align-items-center gap-8">
          <OnboardingStatusBadge
            badgeMap={MATCH_STATUS_BADGE}
            statusKey={item.matchStatus}
            onClick={interactive ? () => handleOnboardingMatchStatusClick(item) : undefined}
            title={title}
          />
          {confirming && (
            <Spinner animation="border" size="sm" role="status" aria-hidden />
          )}
        </span>
      );
    },
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
        {run?.autoContinue && (
          <Badge className="bg-info-400 text-info-900">Auto-continue</Badge>
        )}
        {run?.autoScanAfterImport && (
          <Badge className="bg-info-400 text-info-900">Auto-scan</Badge>
        )}
        {diffBusy && (
          <span className="text-info-200 small">{onboardingDiffStatusMessage(run?.status)}</span>
        )}
        {importPollBusy && !diffBusy && (
          <span className="text-info-200 small">{onboardingImportStatusMessage()}</span>
        )}
        {run?.dropboxFolderName && (
          <span className="text-info-200 small">
            Dropbox ref:
            {' '}
            {run.dropboxFolderName}
          </span>
        )}
      </div>
      {summary && (
        <div className="d-flex flex-wrap gap-12 mb-16 text-info-200 small">
          <span>
            Exceptions:
            {' '}
            {summary.exceptionsCount ?? 0}
          </span>
          <span>
            Imported:
            {' '}
            {summary.importStatusCounts?.COMPLETED ?? run?.importedItems ?? 0}
            /
            {run?.totalItems ?? 0}
          </span>
          {summary.scan?.totalTasks > 0 && (
            <span>
              Scan tasks:
              {' '}
              {summary.scan.totalTasks}
              {summary.scan.inFlight ? ' (in progress)' : ''}
            </span>
          )}
          {(summary.duplicateBorrowerWarnings?.length ?? 0) > 0 && (
            <span className="text-warning">
              Possible duplicate borrowers:
              {' '}
              {summary.duplicateBorrowerWarnings.length}
            </span>
          )}
        </div>
      )}
      <Row className="mb-8 align-items-end">
        <Col xs={12} lg={4} className="mb-12 mb-lg-0">
          <Search
            placeholder="Search borrower, loan #, folder…"
            signal={$onboardingItemFilter}
            name="searchTerm"
            onChange={() => $onboardingItemFilter.update({ page: 1 })}
          />
        </Col>
        <Col xs={12} sm={6} lg={2} className="mb-12 mb-lg-0">
          <SelectInput
            name="matchStatus"
            signal={$onboardingItemFilter}
            value={$onboardingItemFilter.value.matchStatus}
            options={ONBOARDING_MATCH_STATUS_FILTER_OPTIONS}
            onChange={() => $onboardingItemFilter.update({ page: 1 })}
            placeholder="All match statuses"
            notClearable
            isSearchable={false}
          />
        </Col>
        <Col xs={12} sm={6} lg={2} className="mb-12 mb-lg-0">
          <SelectInput
            name="importStatus"
            signal={$onboardingItemFilter}
            value={$onboardingItemFilter.value.importStatus}
            options={ONBOARDING_IMPORT_STATUS_FILTER_OPTIONS}
            onChange={() => $onboardingItemFilter.update({ page: 1 })}
            placeholder="All import statuses"
            notClearable
            isSearchable={false}
          />
        </Col>
        <Col xs={12} lg={2} className="mb-12 mb-lg-0 d-flex align-items-end">
          <UniversalInput
            type="checkbox"
            label="Needs attention only"
            signal={$onboardingItemFilter}
            name="needsAttentionOnly"
            customOnChange={() => {
              $onboardingItemFilter.update({
                needsAttentionOnly: !$onboardingItemFilter.value.needsAttentionOnly,
                page: 1,
              });
            }}
          />
        </Col>
        <Col xs={12} lg={2} className="d-flex align-items-center justify-content-lg-end gap-2">
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
