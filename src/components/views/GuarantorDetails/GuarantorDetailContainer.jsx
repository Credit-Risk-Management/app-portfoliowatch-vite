/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-danger */
import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Button, Row, Col } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import Loadable from '@src/components/global/Loadable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit } from '@fortawesome/free-solid-svg-icons';
import { calculateAnnualDebtServiceFromLoans } from '@src/utils/currency';
import AddEditGuarantorModal from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerGuarantorsTab/_components/AddEditGuarantorModal';
import * as guarantorModalEvents from '@src/components/views/BorrowerDetails/_components/TabContent/BorrowerGuarantorsTab/_helpers/guarantorModal.events';
import { formatCurrency } from '@src/utils/formatCurrency';
import { getLatestGuarantorFinancial } from './_utils/guarantorFinancialsSource.helpers';
import { GuarantorNetWorthWithMemoFlag } from './_utils/GuarantorNetWorthWithMemoFlag';
import { computeDebtToIncomeRatio, formatDebtToIncomeDisplay } from './_utils/guarantorDebtToIncome';
import * as resolvers from './_helpers/guarantorDetails.resolvers';
import * as guarantorEvents from './_helpers/guarantorDetails.events';
import GuarantorFinancials from './_components/GuarantorFinancials';
import GuarantorDocuments from './_components/GuarantorDocuments';
import { $guarantorDetailView, $guarantorDetailsData } from './_helpers/guarantorDetails.consts';
import SubmitPFSModal from './_components/SubmitGuarantorFinancialsModal/SubmitGuarantorFinancialsModal';
import GuarantorLoans from './_components/GuarantorLoans';

export function GuarantorDetailContainer() {
  const { guarantorId } = useParams();
  const navigate = useNavigate();

  useEffect(() => () => {
    resolvers.resetGuarantorRouteState();
  }, [guarantorId]);

  useEffectAsync(async () => {
    if (guarantorId) {
      await resolvers.fetchGuarantorDetail(guarantorId);
    }
  }, [guarantorId]);

  //
  // Mutations
  //

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
          onClick={() => {
            resolvers.resetGuarantorRouteState();
            guarantorEvents.navigateBackOrDefault(navigate);
          }}
          className="btn-sm border-dark text-dark-800 bg-grey-50"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back
        </Button>
        <PageHeader title="Guarantor Not Found" />
      </Container>
    );
  }

  const latestFinancial = getLatestGuarantorFinancial($guarantorDetailsData.value?.financials);

  const annualDebtResolved = latestFinancial?.annualDebtService != null && latestFinancial?.annualDebtService !== ''
    ? Number(latestFinancial.annualDebtService)
    : calculateAnnualDebtServiceFromLoans($guarantorDetailsData.value?.loans || []);
  const annualDebtForDisplay = Number.isFinite(annualDebtResolved) ? annualDebtResolved : null;

  const agiForDti = latestFinancial?.adjustedGrossIncome != null && latestFinancial?.adjustedGrossIncome !== ''
    ? Number(latestFinancial.adjustedGrossIncome)
    : null;
  const agiParsed = Number.isFinite(agiForDti) ? agiForDti : null;
  const debtToIncomeRatio = computeDebtToIncomeRatio(annualDebtForDisplay, agiParsed);

  return (
    <Loadable signal={$guarantorDetailView} template="fullscreen">
      <Container className="py-16 py-md-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap gap-8 mb-12 mb-md-16">
          <Button
            type="button"
            onClick={() => {
              resolvers.resetGuarantorRouteState();
              guarantorEvents.navigateBackOrDefault(navigate);
            }}
            className="btn-sm border-dark text-dark-800 bg-grey-50"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
            Back
          </Button>
        </div>
        <PageHeader title={$guarantorDetailsData.value?.name} />

        <Row>
          <Col xs={12} className="mb-12 mb-md-16">
            <UniversalCard
              headerText="Guarantor Details"
              headerRight={(
                <Button
                  type="button"
                  variant="outline-primary-100"
                  className="flex-shrink-0"
                  size="sm"
                  onClick={() => guarantorModalEvents.openEditBorrowerGuarantorModal({
                    id: $guarantorDetailView.value?.guarantorId,
                    borrowerId: $guarantorDetailsData.value?.borrowerId,
                    name: $guarantorDetailsData.value?.name,
                    email: $guarantorDetailsData.value?.email,
                    phone: $guarantorDetailsData.value?.phone,
                    loans: $guarantorDetailsData.value?.loans,
                    borrowerLoans: $guarantorDetailsData.value?.borrowerLoans,
                  })}
                  aria-label={`Edit ${$guarantorDetailsData.value?.name || 'guarantor'}`}
                >
                  <FontAwesomeIcon icon={faEdit} className="me-8" />
                  Edit
                </Button>
              )}
              bodyContainer="container-fluid"
            >
              <Row className="g-3 mt-8">
                <Col xs={12} md={6}>
                  <div className="text-info-200 fw-300 fs-6">Net Worth</div>
                  <GuarantorNetWorthWithMemoFlag
                    netWorth={latestFinancial?.netWorth}
                    notes={latestFinancial?.notes}
                  />
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-info-200 fw-300 fs-6">Debt to Income</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatDebtToIncomeDisplay(debtToIncomeRatio)}
                  </div>
                </Col>
              </Row>
              <Row className="g-3 mt-12">
                <Col xs={12} md={6}>
                  <div className="text-info-200 fw-300 fs-6">Email</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {$guarantorDetailsData.value?.email || 'N/A'}
                  </div>
                </Col>
                <Col xs={12} md={6}>
                  <div className="text-info-200 fw-300 fs-6">Phone</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {$guarantorDetailsData.value?.phone || 'N/A'}
                  </div>
                </Col>
              </Row>
            </UniversalCard>
          </Col>
        </Row>

        <Row>
          <Col xs={12} className="mb-12 mb-md-16">
            <UniversalCard
              headerText="Latest Financials"
              bodyContainer="container-fluid"
            >
              <Row className="g-3 mt-12 justify-content-between">
                <Col xs={6} md={3}>
                  <div className="text-info-200 small fw-300">Total Assets</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency(latestFinancial?.totalAssets || 'N/A')}
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-info-200 small fw-300">Total Liabilities</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency(latestFinancial?.totalLiabilities || 'N/A')}
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-info-200 small fw-300">Liquidity</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency(latestFinancial?.liquidity || 'N/A')}
                  </div>
                </Col>
                <Col xs={6} md={3}>
                  <div className="text-info-200 small fw-300">Annual Debt Service</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency(annualDebtForDisplay ?? 'N/A')}
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
      <AddEditGuarantorModal />
    </Loadable>
  );
}

export default GuarantorDetailContainer;
