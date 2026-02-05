import { Signal } from '@fyclabs/tools-fyc-react/signals';

/** Currently expanded accordion item id (single open at a time). undefined = use defaultExpandedId, null = none. */
export const expandedId = Signal(undefined);

export default expandedId;
