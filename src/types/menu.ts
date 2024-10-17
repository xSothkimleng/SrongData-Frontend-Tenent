export type MenuItemType = {
  name: string;
  path?: string;
  icon?: React.ReactNode;
  NestedList?: MenuItemType[];
  permission?: number;
};
