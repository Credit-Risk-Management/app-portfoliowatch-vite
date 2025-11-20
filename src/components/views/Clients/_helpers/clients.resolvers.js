import { $relationshipManagers } from '@src/signals';
import relationshipManagersApi from '@src/api/relationshipManagers.api';

export const loadReferenceData = async () => {
  const managersResponse = await relationshipManagersApi.getAll();
  $relationshipManagers.update({ list: managersResponse.data || [] });
};

