/* eslint-disable react/no-danger */
import { useParams, useNavigate } from 'react-router-dom';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import { Container, Button, Row, Col } from 'react-bootstrap';
import PageHeader from '@src/components/global/PageHeader';
import Loadable from '@src/components/global/Loadable';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faFileAlt, faMoneyBillWave, faUser, faBell, faDollarSign, faReceipt, faFile, faIndustry, faStickyNote } from '@fortawesome/free-solid-svg-icons';
import SignalSideNav from '@src/components/global/SignalSideNav/SignalSideNav';
import SignalSideNavContent from '@src/components/global/SignalSideNav/SignalSideNavContent';
import { $borrower } from '@src/consts/consts';
import SubmitFinancialsModal from '@src/components/views/BorrowerDetails/_components/SubmitFinancialsModal';
import DeleteBorrowerDocumentModal from '@src/components/views/Borrowers/_components/DeleteBorrowerDocumentModal';
import UniversalCard from '@src/components/global/UniversalCard';
import { $borrowerDetailView } from './_helpers/borrowerDetail.consts';
import { handleGenerateAnnualReview } from './_helpers/borrowerDetail.events';
import { fetchFinancialHistory } from './_components/TabContent/BorrowerFinancialsTab/_helpers/borrowerFinancialsTab.resolvers';
import {
  BorrowerDetailsTab,
  BorrowerTriggersTab,
  BorrowerLoansTab,
  BorrowerFinancialsTab,
  BorrowerDocumentsTab,
  BorrowerDebtServiceTab,
  BorrowerGuarantorsTab,
  BorrowerIndustryTab,
} from './_components/TabContent';
import { fetchBorrowerDetail } from './_helpers/borrowerDetail.resolvers';
import { fetchLoanWatchScoreBreakdowns } from './_components/TabContent/BorrowerLoansTab/_helpers/loanCoard.resolvers';
import EditBorrowerDetailModal from './_components/EditBorrowerDetailModal';

const tabs = [
  {
    key: 'details',
    title: 'Detail',
    icon: faUser,
    component: <BorrowerDetailsTab />,
  },
  {
    key: 'triggers',
    title: 'Triggers',
    icon: faBell,
    component: <BorrowerTriggersTab />,
  },
  {
    key: 'loans',
    title: 'Loans',
    icon: faMoneyBillWave,
    component: <BorrowerLoansTab />,
  },
  {
    key: 'financials',
    title: 'Financials',
    icon: faDollarSign,
    component: <BorrowerFinancialsTab />,
  },
  {
    key: 'debtService',
    title: 'Debt Service',
    icon: faReceipt,
    component: <BorrowerDebtServiceTab />,
  },
  {
    key: 'guarantors',
    title: 'Guarantors',
    icon: faUser,
    component: <BorrowerGuarantorsTab />,
  },
  {
    key: 'documents',
    title: 'Documents',
    icon: faFile,
    component: <BorrowerDocumentsTab />,
  },
  {
    key: 'industry',
    title: 'Industry',
    icon: faIndustry,
    component: <BorrowerIndustryTab />,
  },
  { key: 'notes',
    title: 'Notes',
    icon: faStickyNote,
    component: (
      <UniversalCard headerText="Notes">
        <div className="text-info-50">{$borrower.value?.borrower?.notes || 'No notes'}</div>
      </UniversalCard>),
  },
];

export function BorrowerDetailsContainer() {
  const { borrowerId } = useParams();
  const navigate = useNavigate();

  // Fetch borrower detail and relationship managers on mount or when borrowerId changes
  useEffectAsync(async () => {
    await fetchBorrowerDetail(borrowerId);
  }, [borrowerId]);

  useEffectAsync(async () => {
    if ($borrowerDetailView.value.activeKey === 'loans' || $borrowerDetailView.value.activeKey === 'financials') {
      await fetchFinancialHistory();
      await fetchLoanWatchScoreBreakdowns();
    }
  }, [$borrowerDetailView.value.activeKey, borrowerId, $borrower.value?.borrower]);
  return (
    <Loadable signal={$borrower} template="fullscreen">
      <Container className="fluid py-16 py-md-24">
        <div className="d-flex justify-content-between align-items-center flex-wrap">
          <Button
            onClick={() => {
              $borrower.reset();
              $borrowerDetailView.reset();
              navigate('/borrowers');
            }}
            className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
          >
            <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
            Back to Borrowers
          </Button>
          <div>
            <Button
              onClick={() => $borrowerDetailView.update({ showEditBorrowerModal: true })}
              variant="outline-primary-100"
              className="me-8 mb-8 mb-md-0"
            >
              <FontAwesomeIcon icon={faEdit} className="me-8" />
              Edit Borrower
            </Button>
            <Button
              variant="outline-success-500"
              onClick={() => handleGenerateAnnualReview(borrowerId)}
              disabled={$borrower.value?.borrower?.loans?.length === 0}
            >
              <FontAwesomeIcon icon={faFileAlt} className="me-8" />
              Generate Annual Review
            </Button>
          </div>
        </div>
        <div className="text-info-50">Borrower ID: {$borrower.value?.borrower?.borrowerId}</div>
        <PageHeader title={$borrower.value?.borrower?.name} />
        <Row>
          <Col xs={12} md={2} className="mb-12 mb-md-0 pb-16">
            <SignalSideNav
              $view={$borrowerDetailView}
              navItems={tabs}
              sectionTitle="Sections"
            />
          </Col>
          <Col xs={12} md={9} className="pb-16">
            <SignalSideNavContent
              $view={$borrowerDetailView}
              navItems={tabs}
            />
          </Col>
        </Row>

        {/* Financial Modals  */}
        <SubmitFinancialsModal />

        {/* Edit Borrower Modal */}
        <EditBorrowerDetailModal />

        {/* Document Modals */}
        <DeleteBorrowerDocumentModal />

      </Container>
    </Loadable>
  );
}

export default BorrowerDetailsContainer;
