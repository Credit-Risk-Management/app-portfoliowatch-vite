/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-danger */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Button, Row, Col, OverlayTrigger, Tooltip } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import Loadable from '@src/components/global/Loadable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@src/utils/formatCurrency';
import * as resolvers from './_helpers/guarantorDetails.resolvers';
import GuarantorFinancials from './_components/GuarantorFinancials';
import GuarantorDocuments from './_components/GuarantorDocuments';
import { $guarantorDetailView, $guarantorDetailsData } from './_helpers/guarantorDetails.consts';
import SubmitPFSModal from './_components/SubmitPFSModal/SubmitPFSModal';
import getGuarantorDetailsHelpers from './_helpers/guarantorDetails.helpers';
import GuarantorLoans from './_components/GuarantorLoans';

export function GuarantorDetailContainer() {
  const { guarantorId } = useParams();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await resolvers.fetchGuarantorDetail(guarantorId);
  }, [guarantorId]);

  //
  // Mutations
  //

  const financials = $guarantorDetailsData.value?.financials?.sort((a, b) => new Date(b.asOfDate) - new Date(a.asOfDate))[0] || {};
  const annualDebtService = $guarantorDetailsData.value?.loans.reduce((acc, loan) => acc + Number(loan.paymentAmount || 0), 0) * 12 || 0;

  const leverage = getGuarantorDetailsHelpers.calculateLeverage(
    financials.totalLiabilities,
    financials.totalAssets,
  );

  const liquidityCoverage = getGuarantorDetailsHelpers.calculateLiquidityCoverage(
    financials.liquidity,
    annualDebtService,
  );

  const liquidityScoreContrib = liquidityCoverage !== null ? getGuarantorDetailsHelpers.liquidityScore(liquidityCoverage) : 0;
  const leverageScoreContrib = leverage !== null ? getGuarantorDetailsHelpers.leverageScore(leverage) : 0;
  const score = liquidityScoreContrib + leverageScoreContrib;

  const strength = getGuarantorDetailsHelpers.getStrengthMeta(score);

  const scoreBreakdownTooltip = (
    <Tooltip id="guarantor-score-breakdown">
      <div className="text-start small">
        <strong>Score breakdown</strong>
        <div className="mt-8">
          Liquidity coverage (up to 60 pts): {liquidityCoverage != null ? `${liquidityCoverage.toFixed(1)}×` : 'N/A'} → {liquidityScoreContrib} pts
        </div>
        <div>
          Leverage ratio (up to 40 pts): {leverage != null ? `${Math.round(leverage * 100)}%` : 'N/A'} → {leverageScoreContrib} pts
        </div>
        <div className="mt-8 pt-8 border-top border-white border-opacity-25">
          Total: {score} / 100 — {strength.label}
        </div>
      </div>
    </Tooltip>
  );

  //
  //  Render
  //

  if ($guarantorDetailView.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  if (!$guarantorDetailsData.value?.name && !$guarantorDetailView.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <Button
          onClick={() => navigate(-1)}
          className="btn-sm border-dark text-dark-800 bg-grey-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back
        </Button>
        <PageHeader title="Guarantor Not Found" />
      </Container>
    );
  }

  return (
    <Loadable signal={$guarantorDetailView} template="fullscreen">
      <Container className="py-16 py-md-24">
        <div className="d-flex justify-content-between align-items-center">
          <Button
            type="button"
            onClick={() => {
              $guarantorDetailView.reset();
              navigate(-1);
            }}
            className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
            Back
          </Button>
        </div>
        <PageHeader
          title={$guarantorDetailsData.value?.name}
          AdditionalComponents={() => (
            <OverlayTrigger placement="bottom" overlay={scoreBreakdownTooltip}>
              <div className={`px-12 py-4 rounded-pill bg-${strength.color}-200 text-${strength.color}-800 small fw-600`}>
                {score} / 100 · {strength.label}
              </div>
            </OverlayTrigger>
          )}
        />

        <Row>
          <Col xs={6} md={4} className="mb-12 mb-md-16">
            <UniversalCard headerText="Guarantor Details">
              <Col>
                <div className="text-info-200 small fw-300 mt-8">Net Worth</div>
                <div className="text-success-400 fw-600 fs-5">
                  {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.netWorth || 'N/A')}
                </div>
                <div className="text-info-200 small fw-300 mt-8">Email</div>
                <div className="text-info-50 fw-500 fs-6">
                  {$guarantorDetailsData.value?.email || 'N/A'}
                </div>
                <div className="text-info-200 small fw-300 mt-8">Phone</div>
                <div className="text-info-50 fw-500 fs-6">
                  {$guarantorDetailsData.value?.phone || 'N/A'}
                </div>
              </Col>
            </UniversalCard>
          </Col>
          <Col xs={6} md={8} className="mb-12 mb-md-16">
            <UniversalCard headerText="Latest Financials" bodyContainer="container-fluid">
              <Row className="g-2 justify-content-between mt-8">
                <Col xs={6} md={4}>
                  <div className="text-info-200 small fw-300">Total Assets</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.totalAssets || 'N/A')}
                  </div>
                </Col>
                <Col xs={6} md={4}>
                  <div className="text-info-200 small fw-300">Total Liabilities</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.totalLiabilities || 'N/A')}
                  </div>
                </Col>

              </Row>
              <Row className="mt-8 g-2 justify-content-between">
                <Col xs={12} md={4}>
                  <div className="text-info-200 small fw-300">Liquidity</div>
                  <div className="text-info-50 fw-500 fs-6">
                    {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.liquidity || 'N/A')}
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className="text-info-200 small fw-300">Debt Service</div>
                  <div className="text-info-50 fw-500 fs-6">
                    {formatCurrency($guarantorDetailsData.value?.loans.reduce((acc, loan) => acc + +loan.paymentAmount, 0) * 12 || 'N/A')}
                  </div>
                </Col>
              </Row>
              <Row className="mt-8 g-2 justify-content-between">
                <Col xs={12} md={4}>
                  <div className="text-info-200 small fw-300">Leverage Ratio</div>
                  <div className="text-info-50 fw-600 fs-6">
                    {leverage !== null ? `${Math.round(leverage * 100)}%` : 'N/A'}
                    {leverage > 0.65 && (
                      <span className="text-danger-400 ms-8 small">⚠ High</span>
                    )}
                  </div>
                </Col>

                <Col xs={12} md={4}>
                  <div className="text-info-200 small fw-300">Liquidity Coverage</div>
                  <div className="text-info-50 fw-600 fs-6">
                    {liquidityCoverage !== null
                      ? `${liquidityCoverage.toFixed(1)}×`
                      : 'N/A'}
                    {liquidityCoverage < 1.25 && (
                      <span className="text-danger-400 ms-8 small">⚠ Weak</span>
                    )}
                  </div>
                </Col>
              </Row>
            </UniversalCard>
          </Col>
        </Row>

        <Row>
          <Col xs={12} md={12}>
            <UniversalCard
              headerText="Financials"
              bodyContainer="container-fluid"
            >
              <Row className="mt-12 mb-12">
                <GuarantorFinancials />
              </Row>
            </UniversalCard>
            <UniversalCard headerText="Loans" bodyContainer="container-fluid" className="mt-md-16">
              <Row className="mt-12 mb-12">
                <GuarantorLoans />
              </Row>
            </UniversalCard>
            <UniversalCard
              headerText="Documents"
              bodyContainer="container-fluid"
              className="mb-12 mt-md-16"
            >
              <Row className="mt-12 mb-12">
                <GuarantorDocuments />
              </Row>
            </UniversalCard>
          </Col>
        </Row>
      </Container>
      <SubmitPFSModal />
    </Loadable>
  );
}

export default GuarantorDetailContainer;
