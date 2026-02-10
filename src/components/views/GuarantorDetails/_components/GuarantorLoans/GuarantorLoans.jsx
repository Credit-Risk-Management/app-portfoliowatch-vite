import { formatCurrency } from '@src/utils/formatCurrency';
import { formatDate } from '@src/utils/formatDate';
import { $guarantorDetailsData } from '@src/components/views/GuarantorDetails/_helpers/guarantorDetails.consts';
import { useNavigate } from 'react-router-dom';
import SignalTable from '@src/components/global/SignalTable/SignalTable';
import { getWatchScoreDisplay } from '@src/components/views/Borrowers/_components/TabsContent/BorrowerLoansTab/_helpers/loanCard.helpers';
import { $guarantorsLoansView, TABLE_HEADERS } from './_helpers/guarantorLoans.consts';

export function GuarantorLoans() {
  const { loans } = $guarantorDetailsData.value;
  const navigate = useNavigate();

  console.log(loans);

  const rows = (loans || []).map((loan) => {
    const watchScoreDisplay = getWatchScoreDisplay(loan?.currentWatchScore);
    return {
      ...loan,
      loanId: loan.loanId || loan.loanNumber || loan.id || '-',
      borrowerName: loan.borrowerName || '-',
      principalAmount: formatCurrency(loan.principalAmount),
      paymentAmount: formatCurrency(loan.paymentAmount),
      nextPaymentDueDate: formatDate(loan.nextPaymentDueDate),
      liquidity: formatCurrency(loan.liquidity),

      watchScore: () => <span className={`text-${watchScoreDisplay?.color}-200 fw-700`}>{watchScoreDisplay.label}</span>,
      relationshipManager: loan.relationshipManager ? loan.relationshipManager.name : '-',
    };
  });
  return (
    <SignalTable
      $view={$guarantorsLoansView}
      headers={TABLE_HEADERS}
      rows={rows}
      className="shadow"
      totalCount={loans.length}
      currentPage={1}
      itemsPerPageAmount={10}
      onRowClick={(loan) => navigate(`/loans/${loan.id}`)}
    />
  );
}
export default GuarantorLoans;
