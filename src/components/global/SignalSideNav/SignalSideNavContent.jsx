/* eslint-disable no-restricted-syntax */
/* eslint-disable react/jsx-no-useless-fragment */

const SignalSideNavContent = ({
  $view,
  navItems,
}) => {
  const { activeKey } = $view.value;

  // Helper to find an item by key (including nested items)
  const findItemByKey = (items, key) => {
    for (const item of items) {
      if (item.key === key) return item;
      if (item.children) {
        const found = findItemByKey(item.children, key);
        if (found) return found;
      }
    }
    return null;
  };

  const activeItem = findItemByKey(navItems, activeKey);
  const content = activeItem?.component || null;

  return <>{content}</>;
};

export default SignalSideNavContent;
