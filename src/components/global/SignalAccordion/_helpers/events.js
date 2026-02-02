import * as consts from './consts';

export const toggleItem = (itemId) => {
  const next = consts.expandedId.value === itemId ? null : itemId;
  consts.expandedId.value = next;
};

export default toggleItem;
