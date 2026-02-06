/* eslint-disable react/no-danger */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Button, Row, Col } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import Loadable from '@src/components/global/Loadable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faFileAlt, faMoneyBillWave, faUser } from '@fortawesome/free-solid-svg-icons';
import SignalSideNav from '@src/components/global/SignalSideNav/SignalSideNav';
import SignalSideNavContent from '@src/components/global/SignalSideNav/SignalSideNavContent';
import * as resolvers from './_helpers/guarantorDetail.resolvers';
import { $guarantorDetailView, $guarantorDetailsData } from './_helpers/guarantorDetail.consts';
import { GuarantorDetailTab, GuarantorFinancialsTab, GuarantorLoansTab, GuarantorDocumentsTab, GuarantorDebtServiceTab } from './_components/TabContent';
import SubmitPFSModal from './_components/SubmitPFSModal/SubmitPFSModal';

const tabs = [
  {
    key: 'detail',
    title: 'Detail',
    icon: faUser,
    component: <GuarantorDetailTab />,
  },
  {
    key: 'financials',
    title: 'Financials',
    icon: faFileAlt,
    component: <GuarantorFinancialsTab />,
  },
  {
    key: 'loans',
    title: 'Loans',
    icon: faMoneyBillWave,
    component: <GuarantorLoansTab />,
  },
  {
    key: 'documents',
    title: 'Documents',
    icon: faFileAlt,
    component: <GuarantorDocumentsTab />,
  },
  {
    key: 'debtService',
    title: 'Debt Service',
    icon: faMoneyBillWave,
    component: <GuarantorDebtServiceTab />,
  },
];

export function GuarantorDetailContainer() {
  const { guarantorId } = useParams();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await resolvers.fetchGuarantorDetail(guarantorId);
  }, [guarantorId]);

  if ($guarantorDetailView.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }

  return (
    <Loadable signal={$guarantorDetailView} template="fullscreen">
      <Container className="py-16 py-md-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
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
          <Col xs={12} md={2} className="mb-12 mb-md-0">
            <SignalSideNav
              $view={$guarantorDetailView}
              navItems={tabs}
              sectionTitle="Sections"
            />
          </Col>
          <Col xs={12} md={9}>
            <SignalSideNavContent
              $view={$guarantorDetailView}
              navItems={tabs}
            />
          </Col>
        </Row>
      </Container>
      <SubmitPFSModal />
    </Loadable>
  );
}

export default GuarantorDetailContainer;
