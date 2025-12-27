/* eslint-disable react-hooks/exhaustive-deps */
import { useState, useEffect, useMemo } from 'react';
import { Button, Row, Col, Form, Card, Alert } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTrash, faEdit, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import UniversalModal from '@src/components/global/UniversalModal';
import UniversalInput from '@src/components/global/Inputs/UniversalInput';
import SignalTable from '@src/components/global/SignalTable';
import ContextMenu from '@src/components/global/ContextMenu';
import { $debtServiceHistory, $debtServiceHistoryView, $debtServiceHistoryForm } from '@src/signals';
import { $borrower } from '@src/consts/consts';
import debtServiceHistoryApi from '@src/api/debtServiceHistory.api';
import { successAlert, dangerAlert } from '@src/components/global/Alert/_helpers/alert.events';
import { formatCurrency } from '@src/utils/formatCurrency';

const DebtServiceTab = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch debt service history when tab loads
  useEffect(() => {
    if ($borrower.value?.borrower?.id) {
      fetchDebtServiceHistory();
    }
  }, [$borrower.value?.borrower?.id, $debtServiceHistoryView.value.refreshTrigger]);

  const fetchDebtServiceHistory = async () => {
    if (!$borrower.value?.borrower?.id) return;

    try {
      setIsLoading(true);
      const response = await debtServiceHistoryApi.getByBorrowerId($borrower.value.borrower.id);

      if (response.success) {
        $debtServiceHistory.update({
          list: response.data || [],
          totalCount: response.count || 0,
          isLoading: false,
        });
      }
    } catch (error) {
      console.error('Error fetching debt service history:', error);
      dangerAlert('Failed to load debt service history', 'toast');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddNew = () => {
    // Reset form and open modal
    $debtServiceHistoryForm.update({
      asOfDate: '',
      debtLineItems: [{
        creditorName: '',
        originalAmountFinanced: '',
        lineOfCreditLimit: '',
        originalLoanDate: '',
        currentBalance: '',
        interestRate: '',
        maturityDate: '',
        monthlyPayment: '',
        collateralDescription: '',
        loanStatus: 'current',
      }],
      totalCurrentBalance: 0,
      totalMonthlyPayment: 0,
      notes: '',
    });
    $debtServiceHistoryView.update({ showAddModal: true, isEditMode: false });
  };

  const handleEdit = (record) => {
    // Populate form with existing data
    $debtServiceHistoryForm.update({
      asOfDate: new Date(record.asOfDate).toISOString().split('T')[0],
      debtLineItems: record.debtLineItems || [],
      totalCurrentBalance: record.totalCurrentBalance,
      totalMonthlyPayment: record.totalMonthlyPayment,
      notes: record.notes || '',
    });
    $debtServiceHistory.update({ selectedRecord: record });
    $debtServiceHistoryView.update({ showEditModal: true, isEditMode: true, editingRecordId: record.id });
  };

  const handleDelete = (record) => {
    $debtServiceHistory.update({ selectedRecord: record });
    $debtServiceHistoryView.update({ showDeleteModal: true });
  };

  const handleCloseModal = () => {
    $debtServiceHistoryView.update({ showAddModal: false, showEditModal: false, isEditMode: false });
    $debtServiceHistory.update({ selectedRecord: null });
  };

  // Table headers
  const tableHeaders = [
    { key: 'asOfDate', value: 'As Of Date', sortKey: 'asOfDate' },
    { key: 'totalCurrentBalance', value: 'Total Balance', sortKey: 'totalCurrentBalance' },
    { key: 'totalMonthlyPayment', value: 'Total Monthly Payment', sortKey: 'totalMonthlyPayment' },
    { key: 'debtCount', value: '# of Debts' },
    { key: 'submittedBy', value: 'Submitted By', sortKey: 'submittedBy' },
    { key: 'actions', value: 'Actions' },
  ];

  // Transform data into table rows
  const tableRows = useMemo(
    () => {
      const list = $debtServiceHistory.value?.list || [];
      return list.map((record) => ({
        ...record,
        asOfDate: new Date(record.asOfDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }),
        totalCurrentBalance: <span className="text-danger-500 fw-500">{formatCurrency(record.totalCurrentBalance)}</span>,
        totalMonthlyPayment: <span className="text-warning-500 fw-500">{formatCurrency(record.totalMonthlyPayment)}</span>,
        debtCount: record.debtLineItems?.length || 0,
        submittedBy: record.submittedBy || '-',
        actions: () => (
          <ContextMenu
            items={[
              { label: 'View/Edit', icon: faEdit, action: 'edit' },
              { label: 'Delete', icon: faTrash, action: 'delete' },
            ]}
            onItemClick={(item) => {
              if (item.action === 'edit') {
                handleEdit(record);
              } else if (item.action === 'delete') {
                handleDelete(record);
              }
            }}
          />
        ),
      }));
    },
    [$debtServiceHistory.value?.list],
  );

  if (isLoading) {
    return (
      <div className="text-center py-64">
        <p className="text-info-100">Loading debt service history...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-16">
        <h4 className="text-info-50">Debt Service History</h4>
        <Button variant="primary-100" size="sm" onClick={handleAddNew}>
          <FontAwesomeIcon icon={faPlus} className="me-8" />
          Add Debt Service
        </Button>
      </div>

      {tableRows.length === 0 ? (
        <div className="text-center py-64">
          <FontAwesomeIcon icon={faDollarSign} className="text-info-300 mb-16" size="3x" />
          <h5 className="text-info-100 mb-16">No Debt Service Records</h5>
          <p className="text-info-200">Add a debt service record to track borrower obligations.</p>
          <Button variant="primary-100" size="sm" onClick={handleAddNew}>
            <FontAwesomeIcon icon={faPlus} className="me-8" />
            Add First Record
          </Button>
        </div>
      ) : (
        <SignalTable
          headers={tableHeaders}
          rows={tableRows}
          totalCount={$debtServiceHistory.value?.totalCount || 0}
          currentPage={1}
          itemsPerPageAmount={10}
          hasPagination={false}
        />
      )}

      {/* Add/Edit Modal */}
      <DebtServiceModal
        show={$debtServiceHistoryView.value.showAddModal || $debtServiceHistoryView.value.showEditModal}
        onHide={handleCloseModal}
      />

      {/* Delete Modal */}
      <DeleteDebtServiceModal />
    </div>
  );
};

// Debt Service Modal Component
const DebtServiceModal = ({ show, onHide }) => {
  const { isEditMode, editingRecordId } = $debtServiceHistoryView.value;
  const { debtLineItems, asOfDate, notes } = $debtServiceHistoryForm.value;
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate totals whenever debt items change
  useEffect(() => {
    const totalBalance = debtLineItems.reduce((sum, item) => {
      const balance = parseFloat(item.currentBalance) || 0;
      return sum + balance;
    }, 0);

    const totalPayment = debtLineItems.reduce((sum, item) => {
      const payment = parseFloat(item.monthlyPayment) || 0;
      return sum + payment;
    }, 0);

    $debtServiceHistoryForm.update({
      totalCurrentBalance: totalBalance,
      totalMonthlyPayment: totalPayment,
    });
  }, [debtLineItems]);

  const handleAddDebtItem = () => {
    const newItem = {
      creditorName: '',
      originalAmountFinanced: '',
      lineOfCreditLimit: '',
      originalLoanDate: '',
      currentBalance: '',
      interestRate: '',
      maturityDate: '',
      monthlyPayment: '',
      collateralDescription: '',
      loanStatus: 'current',
    };
    $debtServiceHistoryForm.update({
      debtLineItems: [...debtLineItems, newItem],
    });
  };

  const handleRemoveDebtItem = (index) => {
    const updated = debtLineItems.filter((_, i) => i !== index);
    $debtServiceHistoryForm.update({ debtLineItems: updated });
  };

  const handleDebtItemChange = (index, field, value) => {
    const updated = [...debtLineItems];
    updated[index] = { ...updated[index], [field]: value };
    $debtServiceHistoryForm.update({ debtLineItems: updated });
  };

  const handleSubmit = async () => {
    // Validation
    if (!asOfDate) {
      dangerAlert('Please enter an as of date', 'toast');
      return;
    }

    if (debtLineItems.length === 0) {
      dangerAlert('Please add at least one debt line item', 'toast');
      return;
    }

    // Validate each debt item has required fields
    for (let i = 0; i < debtLineItems.length; i++) {
      const item = debtLineItems[i];
      if (!item.creditorName || !item.currentBalance || !item.monthlyPayment) {
        dangerAlert(`Debt item ${i + 1}: Creditor name, current balance, and monthly payment are required`, 'toast');
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const payload = {
        borrowerId: $borrower.value.borrower.id,
        asOfDate,
        debtLineItems: debtLineItems.map(item => ({
          creditorName: item.creditorName,
          originalAmountFinanced: parseFloat(item.originalAmountFinanced) || undefined,
          lineOfCreditLimit: parseFloat(item.lineOfCreditLimit) || undefined,
          originalLoanDate: item.originalLoanDate || undefined,
          currentBalance: parseFloat(item.currentBalance),
          interestRate: parseFloat(item.interestRate) || 0,
          maturityDate: item.maturityDate || undefined,
          monthlyPayment: parseFloat(item.monthlyPayment),
          collateralDescription: item.collateralDescription || undefined,
          loanStatus: item.loanStatus,
        })),
        totalCurrentBalance: $debtServiceHistoryForm.value.totalCurrentBalance,
        totalMonthlyPayment: $debtServiceHistoryForm.value.totalMonthlyPayment,
        submittedBy: $borrower.value.borrower.primaryContact || 'System',
        notes,
        organizationId: $borrower.value.borrower.organizationId,
      };

      let response;
      if (isEditMode) {
        response = await debtServiceHistoryApi.update(editingRecordId, payload);
      } else {
        response = await debtServiceHistoryApi.create(payload);
      }

      if (response.success) {
        successAlert(isEditMode ? 'Debt service updated successfully' : 'Debt service added successfully', 'toast');
        $debtServiceHistoryView.update({ refreshTrigger: $debtServiceHistoryView.value.refreshTrigger + 1 });
        onHide();
      }
    } catch (error) {
      console.error('Error saving debt service:', error);
      dangerAlert('Failed to save debt service record', 'toast');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <UniversalModal
      show={show}
      onHide={onHide}
      headerText={isEditMode ? 'Edit Debt Service' : 'Add Debt Service'}
      leftBtnText="Cancel"
      rightBtnText={isSubmitting ? 'Saving...' : 'Save'}
      rightBtnOnClick={handleSubmit}
      rightButtonDisabled={isSubmitting}
      size="xl"
      closeButton
    >
      <Row className="mb-16">
        <Col md={6}>
          <UniversalInput
            label="As Of Date"
            labelClassName="text-info-100"
            type="date"
            value={asOfDate}
            name="asOfDate"
            signal={$debtServiceHistoryForm}
            required
          />
        </Col>
      </Row>

      <div className="mb-16">
        <div className="d-flex justify-content-between align-items-center mb-16">
          <h5 className="text-info-100 mb-0">Debt Line Items</h5>
          <Button variant="outline-success-300" size="sm" onClick={handleAddDebtItem}>
            <FontAwesomeIcon icon={faPlus} className="me-8" />
            Add Debt
          </Button>
        </div>

        {debtLineItems.map((item, index) => (
          <Card key={index} className="bg-info-800 border-info-600 mb-16">
            <Card.Body>
              <div className="d-flex justify-content-between align-items-center mb-12">
                <h6 className="text-info-50 mb-0">Debt #{index + 1}</h6>
                <Button
                  variant="outline-danger-300"
                  size="sm"
                  onClick={() => handleRemoveDebtItem(index)}
                  disabled={debtLineItems.length === 1}
                >
                  <FontAwesomeIcon icon={faTrash} />
                </Button>
              </div>

              <Row>
                <Col md={6} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Creditor Name *</Form.Label>
                    <Form.Control
                      type="text"
                      value={item.creditorName}
                      onChange={(e) => handleDebtItemChange(index, 'creditorName', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="Bank or lender name"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Loan Status *</Form.Label>
                    <Form.Select
                      value={item.loanStatus}
                      onChange={(e) => handleDebtItemChange(index, 'loanStatus', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                    >
                      <option value="current">Current</option>
                      <option value="delinquent">Delinquent</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Original Amount Financed</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.originalAmountFinanced}
                      onChange={(e) => handleDebtItemChange(index, 'originalAmountFinanced', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="Term loan only"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Line of Credit Limit</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.lineOfCreditLimit}
                      onChange={(e) => handleDebtItemChange(index, 'lineOfCreditLimit', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="LOC only"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Original Loan Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={item.originalLoanDate}
                      onChange={(e) => handleDebtItemChange(index, 'originalLoanDate', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Current Balance *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.currentBalance}
                      onChange={(e) => handleDebtItemChange(index, 'currentBalance', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Interest Rate (%)</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.interestRate}
                      onChange={(e) => handleDebtItemChange(index, 'interestRate', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="5.25"
                    />
                  </Form.Group>
                </Col>
                <Col md={4} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Maturity Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={item.maturityDate}
                      onChange={(e) => handleDebtItemChange(index, 'maturityDate', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Monthly Payment *</Form.Label>
                    <Form.Control
                      type="number"
                      step="0.01"
                      value={item.monthlyPayment}
                      onChange={(e) => handleDebtItemChange(index, 'monthlyPayment', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="0.00"
                    />
                  </Form.Group>
                </Col>
                <Col md={6} className="mb-12">
                  <Form.Group>
                    <Form.Label className="text-info-100">Collateral Description</Form.Label>
                    <Form.Control
                      type="text"
                      value={item.collateralDescription}
                      onChange={(e) => handleDebtItemChange(index, 'collateralDescription', e.target.value)}
                      className="bg-info-800 text-info-50 border-info-600"
                      placeholder="e.g., Real estate, equipment"
                    />
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        ))}
      </div>

      {/* Totals Display */}
      <Alert variant="info" className="mb-16">
        <Row>
          <Col md={6}>
            <strong>Total Current Balance:</strong> {formatCurrency($debtServiceHistoryForm.value.totalCurrentBalance)}
          </Col>
          <Col md={6}>
            <strong>Total Monthly Payment:</strong> {formatCurrency($debtServiceHistoryForm.value.totalMonthlyPayment)}
          </Col>
        </Row>
      </Alert>

      {/* Notes */}
      <Row>
        <Col md={12}>
          <UniversalInput
            label="Notes"
            labelClassName="text-info-100"
            type="text"
            value={notes}
            name="notes"
            signal={$debtServiceHistoryForm}
            placeholder="Additional notes or comments"
          />
        </Col>
      </Row>
    </UniversalModal>
  );
};

// Delete Modal Component
const DeleteDebtServiceModal = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { showDeleteModal } = $debtServiceHistoryView.value;
  const { selectedRecord } = $debtServiceHistory.value;

  const handleDelete = async () => {
    if (!selectedRecord) return;

    setIsDeleting(true);
    try {
      const response = await debtServiceHistoryApi.delete(selectedRecord.id);
      if (response.success) {
        successAlert('Debt service record deleted successfully', 'toast');
        $debtServiceHistoryView.update({
          showDeleteModal: false,
          refreshTrigger: $debtServiceHistoryView.value.refreshTrigger + 1,
        });
        $debtServiceHistory.update({ selectedRecord: null });
      }
    } catch (error) {
      console.error('Error deleting debt service:', error);
      dangerAlert('Failed to delete debt service record', 'toast');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <UniversalModal
      show={showDeleteModal}
      onHide={() => $debtServiceHistoryView.update({ showDeleteModal: false })}
      headerText="Delete Debt Service Record"
      leftBtnText="Cancel"
      rightBtnText={isDeleting ? 'Deleting...' : 'Delete'}
      rightBtnOnClick={handleDelete}
      rightButtonDisabled={isDeleting}
      size="sm"
    >
      <p className="text-info-100">
        Are you sure you want to delete this debt service record from{' '}
        {selectedRecord?.asOfDate ? new Date(selectedRecord.asOfDate).toLocaleDateString() : 'N/A'}?
      </p>
      <p className="text-warning-500">This action cannot be undone.</p>
    </UniversalModal>
  );
};

export default DebtServiceTab;
