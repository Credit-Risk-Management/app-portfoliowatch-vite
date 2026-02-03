/* eslint-disable react/no-danger */
import { Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/free-solid-svg-icons';
import UniversalCard from '@src/components/global/UniversalCard';
import { $borrower } from '@src/consts/consts';
import { getHealthScoreColor, renderMarkdownLinks } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.helpers';
import { handleGenerateIndustryReport } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.events';

export function BorrowerIndustryTab() {
  const borrower = $borrower.value?.borrower;
  const borrowerId = borrower?.id;

  return (
    <UniversalCard headerText="Industry Analysis">
      <div>
        <Row>
          <Col xs={12} md={8} className="mb-12 mb-md-0">
            <Button
              variant="primary-100"
              size="sm"
              onClick={() => handleGenerateIndustryReport(borrowerId)}
            >
              <FontAwesomeIcon icon={faMagic} className="me-8" />
              Generate Industry Report
            </Button>
            {borrower?.industryType && (
              <div className="mt-16">
                <span className="text-info-100 fw-200">Industry Type: </span>
                <span className="fw-bold">{borrower.industryType}</span>
              </div>
            )}
          </Col>
          <Col xs={12} md={4} className="text-md-end">
            {borrower?.industryHealthScore != null && (
              <>
                <div className="text-info-100 fw-200">Industry Health Score</div>
                <div className={`fs-1 fw-bold ${getHealthScoreColor(borrower.industryHealthScore)}`}>
                  {borrower.industryHealthScore}
                </div>
                <div className="text-info-100 fw-200 small">out of 100</div>
              </>
            )}
          </Col>
        </Row>
        <Row>
          <Col xs={12} md={12}>
            <div>
              <div className="text-info-100 fw-200 mt-16 mb-8 fw-semibold">Industry Analysis</div>
              {borrower?.industryHealthReport ? (
                <div
                  dangerouslySetInnerHTML={{ __html: renderMarkdownLinks(borrower.industryHealthReport) }}
                  style={{ lineHeight: '1.6' }}
                />
              ) : (
                <div className="text-info-100 fw-200 fst-italic">
                  No industry report generated yet. Click the button above to generate one.
                </div>
              )}
            </div>
          </Col>
        </Row>
      </div>
    </UniversalCard>
  );
}

export default BorrowerIndustryTab;
