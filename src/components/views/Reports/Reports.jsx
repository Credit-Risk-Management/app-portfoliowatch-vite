import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Row, Col, Button, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash, faChartBar } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import SignalTable from '@src/components/global/SignalTable';
import StatusBadge from '@src/components/global/StatusBadge';
import UniversalCard from '@src/components/global/UniversalCard';
import { $reports, $reportsView, $loans, $relationshipManagers } from '@src/signals';
import LoanChart from './_components/LoanChart';
import * as consts from './_helpers/reports.consts';
import * as events from './_helpers/reports.events';
import * as resolvers from './_helpers/reports.resolvers';
import * as helpers from './_helpers/reports.helpers';

const Reports = () => {
  useEffectAsync(async () => {
    await resolvers.loadReportsData();
  }, []);

  const reportsList = $reports.value.list || [];
  const loans = $loans.value?.list || [];
  const managers = $relationshipManagers.value?.list || [];

  const selectedReport = $reportsView.value.selectedReportId
    ? reportsList.find((r) => r.id === $reportsView.value.selectedReportId)
    : null;

  const filteredLoans = selectedReport ? helpers.applyFilters(loans, selectedReport.parameters) : [];

  const rows = helpers.formatLoansForTable(filteredLoans, managers).map((loan) => ({
    ...loan,
    current_risk_rating: () => <StatusBadge status={loans.find((l) => l.id === loan.id)?.currentRiskRating} type="risk" />,
  }));

  return (
    <Container fluid className="py-16 py-md-24">
      <PageHeader title="Reports" />

      <Row>
        <Col xs={12} md={3} className="mb-12 mb-md-0">
          <UniversalCard headerText="Saved Reports" bodyContainer="">
            <div className="p-0">
              {reportsList.length === 0 ? (
                <div className="p-16 text-center text-muted">
                  <p className="mb-0">No saved reports</p>
                  <small>Save filters from the Loans page to create a report</small>
                </div>
              ) : (
                <ListGroup variant="flush">
                  {reportsList.map((report) => (
                    <ListGroup.Item
                      key={report.id}
                      action
                      active={$reportsView.value.selectedReportId === report.id}
                      onClick={() => events.handleSelectReport(report.id)}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div className="flex-grow-1">
                        <div className="fw-600">{report.reportName}</div>
                        <small className="text-muted">
                          {new Date(report.createdAt).toLocaleDateString()}
                        </small>
                      </div>
                      <Button
                        variant="link"
                        size="sm"
                        className="text-danger p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          events.handleDeleteReport(report.id);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </Button>
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              )}
            </div>
          </UniversalCard>
        </Col>

        <Col xs={12} md={9}>
          {selectedReport ? (
            <>
              <UniversalCard bodyContainer="" className="mb-24">
                <div className="d-flex justify-content-between align-items-center mb-16">
                  <div className="lead text-dark">{selectedReport.reportName}</div>
                  <small className="text-muted">
                    Created: {new Date(selectedReport.createdAt).toLocaleString()}
                  </small>
                </div>
                <LoanChart loans={filteredLoans} />
              </UniversalCard>

              <UniversalCard headerText="Loan Details" bodyContainer="">
                <SignalTable
                  headers={consts.TABLE_HEADERS}
                  rows={rows}
                  totalCount={filteredLoans.length}
                  currentPage={1}
                  itemsPerPageAmount={10}
                  hasPagination={false}
                />
              </UniversalCard>
            </>
          ) : (
            <UniversalCard bodyContainer="">
              <div className="text-center py-48">
                <FontAwesomeIcon icon={faChartBar} size="3x" className="text-muted mb-16" />
                <h5 className="text-muted">Select a report to view</h5>
                <p className="text-muted mb-0">
                  Choose a saved report from the list to see the filtered loans and chart
                </p>
              </div>
            </UniversalCard>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default Reports;
