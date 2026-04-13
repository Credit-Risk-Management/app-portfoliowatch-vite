/* eslint-disable react-hooks/exhaustive-deps */
import { Card, Row, Col, Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faPlus, faEdit } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import { $borrower } from '@src/consts/consts';
import { formatCurrency } from '@src/utils/formatCurrency';
import { GuarantorNetWorthWithMemoFlag, getLatestGuarantorFinancial } from '@src/utils/guarantorFinancialsSource';
import * as guarantorModalEvents from './_helpers/guarantorModal.events';

export function BorrowerGuarantorsTab() {
  const navigate = useNavigate();
  const borrower = $borrower.value?.borrower;

  const handleViewDetails = (guarantorId) => {
    if (guarantorId) {
      navigate(`/guarantors/${guarantorId}`);
    }
  };

  if ($borrower.value.isLoading) {
    return (
      <div className="text-info-100 fw-200">Loading borrower guarantors...</div>
    );
  }

  const guarantors = borrower?.guarantors || [];
  const isEmpty = guarantors.length === 0;

  if (isEmpty) {
    return (
      <Row className="g-4">
        <Col xs={12} md={8} lg={6}>
          <Card
            className="bg-info-800 border-info-600 border-dashed h-100 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={guarantorModalEvents.openAddBorrowerGuarantorModal}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                guarantorModalEvents.openAddBorrowerGuarantorModal();
              }
            }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center py-24 text-center">
              <FontAwesomeIcon icon={faPlus} className="text-info-50 fs-1 mb-12" />
              <h5 className="text-info-50 fw-bold mb-8">Add a guarantor</h5>
              <p className="text-info-200 small mb-16 mb-md-0">
                No guarantors are linked to this borrower yet. Add contact details for a guarantor to get started.
              </p>
              <Button
                variant="outline-primary-100"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  guarantorModalEvents.openAddBorrowerGuarantorModal();
                }}
              >
                <FontAwesomeIcon icon={faPlus} className="me-8" />
                Add guarantor
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    );
  }

  return (
    <Row className="g-4">
      {guarantors.map((guarantor) => {
        const latestFinancial = getLatestGuarantorFinancial(guarantor.financials);

        return (
          <Col key={guarantor.id} xs={12} lg={6} className="mb-3">
            <Card className="bg-info-800 border-info-600 h-100">
              <Card.Body className="d-flex flex-column">
                <div className="d-flex justify-content-between align-items-center mb-12 gap-8">
                  <h5 className="text-info-50 mb-0 fw-bold text-break">
                    Guarantor: {guarantor.name}
                  </h5>
                  <Button
                    variant="outline-primary-100"
                    size="sm"
                    className="flex-shrink-0"
                    onClick={() => guarantorModalEvents.openEditBorrowerGuarantorModal(guarantor)}
                    aria-label={`Edit ${guarantor.name}`}
                  >
                    <FontAwesomeIcon icon={faEdit} className="me-8" />
                    Edit
                  </Button>
                </div>

                <Row className="mb-16 g-2  justify-content-between">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Email</div>
                    <div className="text-info-50 fw-600 ">
                      {guarantor.email || 'N/A'}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Phone</div>
                    <div className="text-info-50 fw-600">
                      {guarantor.phone || 'N/A'}
                    </div>
                  </Col>
                </Row>
                <Row className="mb-16 g-2">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Net Worth</div>
                    <GuarantorNetWorthWithMemoFlag
                      netWorth={latestFinancial?.netWorth}
                      notes={latestFinancial?.notes}
                    />
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Total Assets</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(latestFinancial?.totalAssets || 'N/A')}
                    </div>
                  </Col>
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Total Liabilities</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(latestFinancial?.totalLiabilities || 'N/A')}
                    </div>
                  </Col>

                </Row>
                <Row className="mb-16 g-2 justify-content-between">
                  <Col xs={12} md={4}>
                    <div className="text-info-200 small fw-300">Annual Debt Service</div>
                    <div className="text-info-50 fw-500 fs-5">
                      {formatCurrency(latestFinancial?.annualDebtService || 'N/A')}
                    </div>
                  </Col>
                </Row>

                <div className="mt-auto">
                  <Button
                    variant="outline-primary-100"
                    size="sm"
                    onClick={() => handleViewDetails(guarantor.id)}
                    className="w-100"
                  >
                    View Guarantor Details
                    <FontAwesomeIcon icon={faArrowRight} className="ms-8" />
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        );
      })}
      <Col xs={12} lg={6} className="mb-3">
        <Card
          className="bg-info-800 border-info-600 border-dashed h-100 cursor-pointer"
          role="button"
          tabIndex={0}
          onClick={guarantorModalEvents.openAddBorrowerGuarantorModal}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              guarantorModalEvents.openAddBorrowerGuarantorModal();
            }
          }}
        >
          <Card.Body className="d-flex flex-column align-items-center justify-content-center py-24 text-center h-100">
            <FontAwesomeIcon icon={faPlus} className="text-info-50 fs-3 mb-8" />
            <span className="text-info-50 fw-600">Add another guarantor</span>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
}

export default BorrowerGuarantorsTab;
