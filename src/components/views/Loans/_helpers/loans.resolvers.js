import { $borrowers, $relationshipManagers } from '@src/signals';
import borrowersApi from '@src/api/borrowers.api';
import relationshipManagersApi from '@src/api/relationshipManagers.api';

/**
 * Loads reference data (borrowers and relationship managers) needed for the Loans view
 */
export const loadReferenceData = async () => {
  const [borrowersResponse, managersResponse] = await Promise.all([
    borrowersApi.getAll(),
    relationshipManagersApi.getAll(),
  ]);
  $borrowers.update({ list: borrowersResponse.data || [] });
  $relationshipManagers.update({ list: managersResponse.data || [] });
};

