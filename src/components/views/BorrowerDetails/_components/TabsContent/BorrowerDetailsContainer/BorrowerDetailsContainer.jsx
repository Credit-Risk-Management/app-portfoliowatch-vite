import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import UniversalCard from '@src/components/global/UniversalCard';
import { $borrower } from '@src/consts/consts';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import {
  formatDate,
  formatAddress,
  formatPhoneNumber,
  formatEmail,
} from './_helpers/borrowerDetail.helpers';

const BorrowerDetailsContainer = () => {
  const navigate = useNavigate();
  return (
    <UniversalCard headerText="Borrower Details">
      <div>
        <div className="text-info-100 fw-200 mt-8">Borrower Type</div>
        <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.borrowerType || 'N/A'}</div>

        <div className="text-info-100 fw-200 mt-16">Primary Contact</div>
        <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.primaryContact || 'N/A'}</div>

        <div className="text-info-100 fw-200 mt-16">Email</div>
        <div className="text-info-50 lead fw-500">{formatEmail($borrower.value?.borrower?.email)}</div>

        <div className="text-info-100 fw-200 mt-16">Phone</div>
        <div className="text-info-50 lead fw-500">{formatPhoneNumber($borrower.value?.borrower?.phoneNumber)}</div>

        <div className="text-info-100 fw-200 mt-16">Address</div>
        <div className="text-info-50 lead fw-500">{formatAddress($borrower.value?.borrower)}</div>

        {$borrower.value?.borrower?.taxId && (
          <>
            <div className="text-info-100 fw-200 mt-16">Tax ID</div>
            <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.taxId}</div>
          </>
        )}

        {$borrower.value?.borrower?.creditScore && (
          <>
            <div className="text-info-100 fw-200 mt-16">Credit Score</div>
            <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.creditScore}</div>
          </>
        )}

        {$borrower.value?.borrower?.dateOfBirth && (
          <>
            <div className="text-info-100 fw-200 mt-16">Date of Birth</div>
            <div className="text-info-50 lead fw-500">{formatDate($borrower.value?.borrower?.dateOfBirth)}</div>
          </>
        )}

        {$borrower.value?.borrower?.businessStartDate && (
          <>
            <div className="text-info-100 fw-200 mt-16">Business Start Date</div>
            <div className="text-info-50 lead fw-500">{formatDate($borrower.value?.borrower?.businessStartDate)}</div>
          </>
        )}

        {$borrower.value?.borrower?.relationshipManager && (
          <>
            <hr className="my-16" />
            <div className="lead mb-12">Relationship Manager</div>
            <div className="text-info-100 fw-200 mt-8">Name</div>
            <div className="text-info-50 lead fw-500">
              <Button
                variant="link"
                className="p-0 text-secondary-100 lead fw-500 text-start text-decoration-none"
                onClick={() => navigate(`/relationship-managers/${$borrower.value?.borrower?.relationshipManager.id}`)}
              >
                {$borrower.value?.borrower?.relationshipManager.name}
                <FontAwesomeIcon icon={faArrowRight} className="ms-4" size="xs" />
              </Button>
            </div>
            {$borrower.value?.borrower?.relationshipManager.email && (
              <>
                <div className="text-info-100 fw-200 mt-8">Email</div>
                <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.relationshipManager.email}</div>
              </>
            )}
            {$borrower.value?.borrower?.relationshipManager.phone && (
              <>
                <div className="text-info-100 fw-200 mt-8">Phone</div>
                <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.relationshipManager.phone}</div>
              </>
            )}
            {$borrower.value?.borrower?.relationshipManager.officeLocation && (
              <>
                <div className="text-info-100 fw-200 mt-8">Office</div>
                <div className="text-info-50 lead fw-500">{$borrower.value?.borrower?.relationshipManager.officeLocation}</div>
              </>
            )}
          </>
        )}
      </div>
    </UniversalCard>
  );
};

export default BorrowerDetailsContainer;
