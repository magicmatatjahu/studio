export interface ExpandedPanel {
  id: string;
  title: string;
  opened: boolean;
  component: React.ElementType;
  actions?: Array<ExpandedPanelAction>;
}

export interface ExpandedPanelAction {
  label: string;
  icon: React.ElementType;
  props?: (panel: ExpandedPanel) => React.DetailedHTMLProps<React.HTMLAttributes<any>, any>;
}

export interface ExpandedGroup {
  title: string;
  panels: Array<ExpandedPanel>;
  actions?: Array<ExpandedGroupAction>;
}

export interface ExpandedGroupAction {
  label: string;
  icon: React.ElementType;
  props?: (panel: ExpandedGroup) => React.DetailedHTMLProps<React.HTMLAttributes<any>, any>;
}
