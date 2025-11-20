import { $reports, $loans, $relationshipManagers } from '@src/signals';
import reportsApi from '@src/api/reports.api';
import loansApi from '@src/api/loans.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';

export const loadReportsData = async () => {
  const [reportsResponse, loansResponse, managersResponse] = await Promise.all([
    reportsApi.getAll(),
    loansApi.getAll(),
    relationshipManagersApi.getAll(),
  ]);
  $reports.update({ list: reportsResponse.data || [] });
  $loans.update({ list: loansResponse.data || [] });
  $relationshipManagers.update({ list: managersResponse.data || [] });
};

