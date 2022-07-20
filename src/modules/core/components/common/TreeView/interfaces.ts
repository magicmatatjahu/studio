export interface TreeViewItem {
  id: string;
  kind: string;
  label: string;
  content: React.ReactNode;
  items?: Array<TreeViewItem>;
}

export interface TreeViewItemDetail {
  kind: string;
  defaultIcon: React.ElementType;
  expandedIcon?: React.ElementType | null;
  collapsedIcon?: React.ElementType | null;
  label: string;
  props?: (item: TreeViewItem) => React.DetailedHTMLProps<React.HTMLAttributes<any>, any>;
  actions?: Array<TreeViewItemDetailAction>;
}

export interface TreeViewItemDetailAction {
  label: string;
  icon: React.ElementType;
  props?: (item: TreeViewItem) => React.DetailedHTMLProps<React.HTMLAttributes<any>, any>;
}
