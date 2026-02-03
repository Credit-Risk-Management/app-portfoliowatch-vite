import UniversalModal from '@src/components/global/UniversalModal';
import { Badge, Table } from 'react-bootstrap';
import { formatCurrency } from '@src/utils/formatCurrency';
import { formatDate } from '@src/utils/formatDate';

export default function DebtServiceModalView({ show, onHide, record }) {
  if (!record) return null;

  const debtLineItems = record.debtLineItems || [];

  return (
    <UniversalModal
      show={show}
      onHide={onHide}
      headerText={`Debt Obligations - ${formatDate(record.asOfDate)}`}
      leftBtnText="Close"
      rightBtnText={null}
      footerClass="justify-content-start"
      size="xl"
      closeButton
    >
      <div>
        <div className="mb-16">
          <Badge bg="secondary-100" className="me-8 text-secondary-900">
            Total Obligations: {debtLineItems.length}
          </Badge>
          <Badge bg="info-400" className="me-8 text-info-900">
            Total Balance: {formatCurrency(record.totalCurrentBalance)}
          </Badge>
          <Badge bg="warning-500" className="text-warning-900">
            Total Annual Payment: {formatCurrency(record.totalMonthlyPayment != null ? record.totalMonthlyPayment * 12 : null)}
          </Badge>
        </div>

        {debtLineItems.length === 0 ? (
          <div className="text-center py-32">
            <p className="text-info-100">No debt obligations found for this record.</p>
          </div>
        ) : (
          <Table striped bordered hover responsive className="text-info-100">
            <thead className="bg-info-800">
              <tr>
                <th className="bg-info-700 text-info-50 fw-500">Creditor Name</th>
                <th className="bg-info-700 text-info-50 fw-500">Loan Status</th>
                <th className="bg-info-700 text-info-50 fw-500">Current Balance</th>
                <th className="bg-info-700 text-info-50 fw-500">Monthly Payment</th>
                <th className="bg-info-700 text-info-50 fw-500">Interest Rate</th>
                <th className="bg-info-700 text-info-50 fw-500">Original Amount</th>
                <th className="bg-info-700 text-info-50 fw-500">LOC Limit</th>
                <th className="bg-info-700 text-info-50 fw-500">Maturity Date</th>
                <th className="bg-info-700 text-info-50 fw-500">Collateral</th>
              </tr>
            </thead>
            <tbody>
              {debtLineItems.map((item, index) => (
                <tr key={index}>
                  <td className="fw-bold text-info-50">{item.creditorName || '-'}</td>
                  <td>
                    <Badge bg={item.loanStatus === 'current' ? 'success-500' : 'danger-500'} className="text-dark">
                      {item.loanStatus || 'current'}
                    </Badge>
                  </td>
                  <td className="text-danger-500 fw-500">
                    {item.currentBalance ? formatCurrency(item.currentBalance) : '-'}
                  </td>
                  <td className="text-warning-500 fw-500">
                    {item.monthlyPayment ? formatCurrency(item.monthlyPayment) : '-'}
                  </td>
                  <td>{item.interestRate ? `${parseFloat(item.interestRate).toFixed(2)}%` : '-'}</td>
                  <td>{item.originalAmountFinanced ? formatCurrency(item.originalAmountFinanced) : '-'}</td>
                  <td>{item.lineOfCreditLimit ? formatCurrency(item.lineOfCreditLimit) : '-'}</td>
                  <td>{formatDate(item.maturityDate)}</td>
                  <td className="text-info-200">{item.collateralDescription || '-'}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </UniversalModal>
  );
}
