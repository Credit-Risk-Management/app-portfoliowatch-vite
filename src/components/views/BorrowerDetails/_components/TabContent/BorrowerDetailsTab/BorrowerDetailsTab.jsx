import UniversalCard from '@src/components/global/UniversalCard';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { $borrower } from '@src/consts/consts';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Loadable from '@src/components/global/Loadable';
import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatEmail,
} from '../../../_helpers/borrowerDetail.helpers';

export function BorrowerDetailsTab() {
  const navigate = useNavigate();
  const borrower = $borrower.value?.borrower;
  if ($borrower.value?.isLoading) {
    return (
      <Loadable signal={$borrower.value?.isLoading} template="component">
        <div className="text-info-100 fw-200 mt-8">Loading...</div>
      </Loadable>
    );
  }
  return (
    <UniversalCard headerText="Borrower Details">
      <div>
        <div className="text-info-100 fw-200 mt-8">Borrower Type</div>
        <div className="text-info-50 lead fw-500">{borrower?.borrowerType || 'N/A'}</div>

        <div className="text-info-100 fw-200 mt-16">Primary Contact</div>
        <div className="text-info-50 lead fw-500">{borrower?.primaryContact || 'N/A'}</div>

        <div className="text-info-100 fw-200 mt-16">Email</div>
        <div className="text-info-50 lead fw-500">{formatEmail(borrower?.email)}</div>

        <div className="text-info-100 fw-200 mt-16">Phone</div>
        <div className="text-info-50 lead fw-500">{formatPhoneNumber(borrower?.phoneNumber || '')}</div>

        <div className="text-info-100 fw-200 mt-16">Address</div>
        <div className="text-info-50 lead fw-500">{formatAddress(borrower || {})}</div>

        {borrower?.taxId && (
        <>
          <div className="text-info-100 fw-200 mt-16">Tax ID</div>
          <div className="text-info-50 lead fw-500">{borrower?.taxId}</div>
        </>
        )}

        {borrower?.creditScore && (
        <>
          <div className="text-info-100 fw-200 mt-16">Credit Score</div>
          <div className="text-info-50 lead fw-500">{borrower?.creditScore}</div>
        </>
        )}

        {borrower?.dateOfBirth && (
        <>
          <div className="text-info-100 fw-200 mt-16">Date of Birth</div>
          <div className="text-info-50 lead fw-500">{formatDate(borrower?.dateOfBirth)}</div>
        </>
        )}

        {borrower?.businessStartDate && (
        <>
          <div className="text-info-100 fw-200 mt-16">Business Start Date</div>
          <div className="text-info-50 lead fw-500">{formatDate(borrower?.businessStartDate)}</div>
        </>
        )}

        {borrower?.relationshipManager && (
        <>
          <hr className="my-16" />
          <div className="lead mb-12">Relationship Manager</div>
          <div className="text-info-100 fw-200 mt-8">Name</div>
          <div className="text-info-50 lead fw-500">
            <Button
              variant="link"
              className="p-0 text-secondary-100 lead fw-500 text-start text-decoration-none"
              onClick={() => navigate(`/relationship-managers/${borrower.relationshipManager.id}`)}
            >
              {borrower.relationshipManager.name}
              <FontAwesomeIcon icon={faArrowRight} className="ms-4" size="xs" />
            </Button>
          </div>
          {borrower.relationshipManager.email && (
          <>
            <div className="text-info-100 fw-200 mt-8">Email</div>
            <div className="text-info-50 lead fw-500">{borrower.relationshipManager.email}</div>
          </>
          )}
          {borrower.relationshipManager.phone && (
          <>
            <div className="text-info-100 fw-200 mt-8">Phone</div>
            <div className="text-info-50 lead fw-500">{borrower.relationshipManager.phone}</div>
          </>
          )}
          {borrower.relationshipManager.officeLocation && (
          <>
            <div className="text-info-100 fw-200 mt-8">Office</div>
            <div className="text-info-50 lead fw-500">{borrower.relationshipManager.officeLocation}</div>
          </>
          )}
        </>
        )}
      </div>
    </UniversalCard>
  );
}

export default BorrowerDetailsTab;
