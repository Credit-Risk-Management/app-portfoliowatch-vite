/* eslint-disable react/no-danger */
/* eslint-disable react-hooks/exhaustive-deps */
import { useNavigate, useParams } from 'react-router-dom';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft, faEdit, faFileAlt, faUser, faMoneyBillWave, faDollarSign, faReceipt } from '@fortawesome/free-solid-svg-icons';
import PageHeader from '@src/components/global/PageHeader';
import { $borrower } from '@src/consts/consts';
import { EditLoanModal, DeleteLoanModal } from '@src/components/views/Loans/_components';
import { useEffectAsync } from '@fyclabs/tools-fyc-react/utils';
import SignalSideNav from '@src/components/global/SignalSideNav/components/SignalSideNav';
import SignalSideNavContent from '@src/components/global/SignalSideNav/components/SignalSideNavContent';
import SubmitFinancialsModal from './_components/SubmitFinancialModal/SubmitFinancialsModal';
import EditBorrowerDetailModal from './_components/EditBorrowerDetailModal';
import DebtServiceContainer from './_components/TabsContent/DebtServiceContainer/DebtServiceContainer';
import { handleGenerateAnnualReview } from './_components/TabsContent/BorrowerDetailsContainer/_helpers/borrowerDetail.events';
import DeleteBorrowerDocumentModal from './_components/DeleteBorrowerDocumentModal';
import LoansContainer from './_components/TabsContent/LoansContainer/LoansContainer';
import FinancialsContainer from './_components/TabsContent/FinancialsContainer';
import { $borrowerDetailsManagementContainerView } from './_helpers/borrowerDetailsManagementContainer.const';
import BorrowerDetailsContainer from './_components/TabsContent/BorrowerDetailsContainer/BorrowerDetailsContainer';
import { fetchBorrowerDetail } from './_components/TabsContent/BorrowerDetailsContainer/_helpers/borrowerDetail.resolvers';

const navItems = [
  { key: 'details', title: 'Details', icon: faUser, component: <BorrowerDetailsContainer /> },
  // { key: 'contacts', title: 'Contacts', icon: faAddressBook },
  { key: 'loans', title: 'Loans', icon: faMoneyBillWave, component: <LoansContainer /> },
  { key: 'financials', title: 'Financials', icon: faDollarSign, component: <FinancialsContainer /> },
  // { key: 'covenants', title: 'Covenants', icon: faShieldAlt },
  { key: 'debtService', title: 'Debt Service', icon: faReceipt, component: <DebtServiceContainer /> },
  // { key: 'documents', title: 'Documents', icon: faFile, component: <DocumentsContainer /> },
  // { key: 'industry', title: 'Industry Analysis', icon: faIndustry, component: <IndustryAnalysisContainer /> },
  // ...(borrower.notes ? [{ key: 'notes', title: 'Notes', icon: faStickyNote, component: <NotesContainer /> }] : []),
];

export function BorrowerDetailsManagementContainer() {
  const { borrowerId } = useParams();
  const navigate = useNavigate();

  useEffectAsync(async () => {
    await fetchBorrowerDetail(borrowerId);
  }, [borrowerId]);

  if ($borrower.value?.isLoading) {
    return (
      <Container fluid className="py-24">
        <PageHeader title="Loading..." />
      </Container>
    );
  }
  return (
    <Container className="py-16 py-md-24">
      <div className="d-flex justify-content-between align-items-center flex-wrap">
        <Button
          onClick={() => navigate('/borrowers')}
          className="btn-sm border-dark text-dark-800 bg-grey-50 mb-12 mb-md-16"
        >
          <FontAwesomeIcon icon={faArrowLeft} className="me-8" />
          Back to Borrowers
        </Button>
        <div>
          <Button
            onClick={() => $borrowerDetailsManagementContainerView.update({ activeModalKey: 'editBorrower' })}
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
      <PageHeader
        title={`${$borrower.value?.borrower?.name}`}
      />
      <Row>
        <Col xs={12} md={2} className="mb-12 mb-md-0">
          <SignalSideNav $view={$borrowerDetailsManagementContainerView} navItems={navItems} queryParamKey="tab" />
        </Col>
        <Col xs={12} md={9}>
          <SignalSideNavContent $view={$borrowerDetailsManagementContainerView} navItems={navItems} />
        </Col>
      </Row>

      {/* Financial Modals */}
      <SubmitFinancialsModal />

      {/* Edit Borrower Modal */}
      <EditBorrowerDetailModal />

      {/* Loan Modals */}
      <EditLoanModal />
      <DeleteLoanModal />

      {/* Document Modals */}
      <DeleteBorrowerDocumentModal />
    </Container>
  );
}

export default BorrowerDetailsManagementContainer;
