/* eslint-disable no-unsafe-optional-chaining */
/* eslint-disable react/no-danger */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Button, Row, Col } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import UniversalCard from '@src/components/global/UniversalCard';
import Loadable from '@src/components/global/Loadable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { formatCurrency } from '@src/utils/formatCurrency';
import { calculateAnnualDebtServiceFromLoans } from '@src/utils/currency';
import * as resolvers from './_helpers/guarantorDetails.resolvers';
import GuarantorFinancials from './_components/GuarantorFinancials';
import GuarantorDocuments from './_components/GuarantorDocuments';
import { $guarantorDetailView, $guarantorDetailsData } from './_helpers/guarantorDetails.consts';
import SubmitPFSModal from './_components/SubmitPFSModal/SubmitPFSModal';
import GuarantorLoans from './_components/GuarantorLoans';
import { $submitPFSModalView } from './_components/SubmitPFSModal/_helpers/submitPFSModal.const';

export function GuarantorDetailContainer() {
  const { guarantorId } = useParams();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await resolvers.fetchGuarantorDetail(guarantorId);
  }, [guarantorId]);
  console.log('submitPFSModalView', $submitPFSModalView.value);

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
        <PageHeader title={$guarantorDetailsData.value?.name} />

        <Row>
          <Col xs={6} md={4} className="mb-12 mb-md-16">
            <UniversalCard headerText="Guarantor Details">
              <Col>
                <div className="text-info-200 fw-300 fs-6 mt-8">Net Worth</div>
                <div className="text-success-400 fw-600 fs-5">
                  {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.netWorth || 'N/A')}
                </div>
                <div className="text-info-200 fw-300 fs-6 mt-8">Email</div>
                <div className="text-info-50 fw-500 fs-5">
                  {$guarantorDetailsData.value?.email || 'N/A'}
                </div>
                <div className="text-info-200 fw-300 fs-6 mt-8">Phone</div>
                <div className="text-info-50 fw-500 fs-5">
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
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency($guarantorDetailsData.value?.financials?.[0]?.liquidity || 'N/A')}
                  </div>
                </Col>
                <Col xs={12} md={4}>
                  <div className="text-info-200 small fw-300">Debt Service</div>
                  <div className="text-info-50 fw-500 fs-5">
                    {formatCurrency(calculateAnnualDebtServiceFromLoans($guarantorDetailsData.value?.loans || []))}
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
