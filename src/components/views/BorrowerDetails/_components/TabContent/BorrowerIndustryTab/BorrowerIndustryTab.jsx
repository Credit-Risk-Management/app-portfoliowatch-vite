/* eslint-disable react/no-danger */
import { useState } from 'react';
import { useSignals } from '@preact/signals-react/runtime';
import { Button, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagic } from '@fortawesome/free-solid-svg-icons';
import UniversalCard from '@src/components/global/UniversalCard';
import { $borrower } from '@src/consts/consts';
import { getHealthScoreColor, renderMarkdownLinks } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.helpers';
import { handleGenerateIndustryReport } from '@src/components/views/BorrowerDetails/_helpers/borrowerDetail.events';
import getResolvedIndustryTitle from '@src/utils/naicsTitles';

export function BorrowerIndustryTab() {
  useSignals();
  const [isGenerating, setIsGenerating] = useState(false);
  const borrower = $borrower.value?.borrower;
  const borrowerId = borrower?.id;
  const loans = borrower?.loans || [];
  const loanWithNaics = loans.find((l) => l?.naicsCode) ?? loans[0];
  const naicsCode = loanWithNaics?.naicsCode;
  const industryName = getResolvedIndustryTitle(
    loanWithNaics?.naicsCode,
    loanWithNaics?.naicsDescription,
    borrower?.industryType,
  );

  return (
    <UniversalCard headerText="Industry Analysis">
      <div>
        <Row>
          <Col xs={12} md={8} className="mb-12 mb-md-0">
            <Button
              variant="primary-100"
              size="sm"
              disabled={!borrowerId || isGenerating}
              onClick={async () => {
                if (!borrowerId) return;
                setIsGenerating(true);
                try {
                  await handleGenerateIndustryReport(borrowerId);
                } finally {
                  setIsGenerating(false);
                }
              }}
            >
              <FontAwesomeIcon icon={faMagic} className="me-8" />
              {isGenerating ? 'Generating…' : 'Generate Industry Report'}
            </Button>
            <div className="mt-16">
              <span className="text-info-100 fw-200">NAICS Code: </span>
              <span className="fw-bold">{naicsCode || 'N/A'}</span>
            </div>
            <div>
              <span className="text-info-100 fw-200">Industry: </span>
              <span className="fw-bold">{industryName || 'N/A'}</span>
            </div>
          </Col>
          <Col xs={12} md={4} className="text-md-end">
            <div className="text-info-100 fw-200">Industry Health Score</div>
            <div className={`fs-1 fw-bold ${getHealthScoreColor(borrower?.industryHealthScore)}`}>
              {borrower?.industryHealthScore ?? '-'}
            </div>
            <div className="text-info-100 fw-200 small">out of 100</div>
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
